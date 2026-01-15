import streamlit as st
import os
from dotenv import load_dotenv
# import google.generativeai as genai
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.agents import AgentExecutor, create_tool_calling_agent
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()
google_api_key = os.getenv('GOOGLE_API_KEY')

kb_path = 'data/kb.json'
st.title("Chat Bot")

# Define tool using the @tool decorator
@tool
def get_weather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"

@tool
def WriteSQLQuery(problem: str) -> str:
    """Write a SQL query based on the given problem description.
    
    Args:
        problem: A natural language description of what the SQL query should do
        
    Returns:
        A SQL query string in {sql_query}
    """
    
    return f"{sql_query}"
    

# Initialize the model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash-exp",
    google_api_key=google_api_key,
    temperature=0
)

# Create prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant"),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Create agent
tools = [get_weather, WriteSQLQuery]
agent = create_tool_calling_agent(llm, tools, prompt)
agent_executor = AgentExecutor(agent=agent, tools=tools, verbose=True, max_execution_time=10)

user_query = st.text_input("Start Chat here:")

# Adding exit sequence
if st.button("Send"):
    # Prevent blank or whitespace-only inputs
    if not user_query.strip():
        st.warning("Please enter a message before sending.")
    elif user_query.lower() == "exit":
        st.warning("Ending session.")
    else:
        response = agent_executor.invoke({"input": user_query})
        st.subheader("Assistant Response")
        st.markdown(response['output'])