from langchain_ollama import ChatOllama
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor

@tool
def GenerateChat(input):
    """
    General chat tool that answers the user's query.
    Argument: 
        A natural language description of what the user wants to ask
    
    Return: 
        A natural language response in string format instead of JSON
    """
    return f"Chat response for: {input}"

# Initialize LLM with tool calling format
llm = ChatOllama(
    model="llama3.2:3b",
    temperature=0,
    base_url="http://localhost:11434",
    format="json",  # This might help with tool calling
)

# # Initialize tools
tools = [GenerateChat]
llm_with_tools = llm.bind_tools(tools, tool_choice = 'auto')

# Create prompt
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant. Use the available tools to answer questions accurately. When the user asks you to break down a task, use the break_down_task tool."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Create agent
agent = create_tool_calling_agent(llm_with_tools, tools, prompt)  
agent_executor = AgentExecutor(
    agent=agent, 
    tools=tools, 
    verbose=True,
    handle_parsing_errors=True  # This helps with errors
)

def PlannerAgent(user_input) -> str:
    """
    Agent that uses tools to break down tasks.
    Returns model output as a string.
    """
    try:
        response = agent_executor.invoke({"input": user_input})
        
        if isinstance(response, dict):
            return response.get('output', str(response))
        else:
            return str(response)
            
    except Exception as e:
        import traceback
        error_details = traceback.format_exc()
        print(error_details)
        return f"[Error calling LLM] {str(e)}"