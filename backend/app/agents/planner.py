import os
import pandas as pd
from dotenv import load_dotenv
from typing import Any
import json 

from ..schemas import AgentEmail
from ..utils.utils import get_string

from langchain_ollama import ChatOllama
from langchain.tools import tool
from langchain_core.prompts import ChatPromptTemplate
from langchain.agents import create_tool_calling_agent, AgentExecutor

load_dotenv('PATH TO ENV')
data_path = os.getenv('DATA_PATH')
model = os.getenv("OLLAMA_MODEL")
base_url = os.getenv("BASE_URL")

print("DEBUG: DATA_PATH =", data_path)
print("DEBUG: Current working directory =", os.getcwd())

df = pd.read_csv(data_path)

# Initialize LLM with tool calling format
llm = ChatOllama(
    model = model,
    temperature=0,
    base_url= base_url,
    # format="json",  # This might help with tool calling
)

# First tool defined here
@tool
def general_chat(query: Any) -> str:
    """Use this tool for general conversation, greetings, or questions that don't need data lookup."""
    # This tool exists so the agent can choose to answer directly
    query = get_string(query)
    return "Tool activated for general response."

@tool
def lookup_data(query: Any) -> str:
    """Search and retrieve relevant information from the provided dataset."""
    query = get_string(query)
    try:
        # Simple keyword search (you can improve this later with embeddings)
        mask = df.astype(str).apply(
            lambda x: x.str.contains(query, case=False, na=False)
        ).any(axis=1)
        
        results = df[mask]
        
        if results.empty:
            return "No relevant data found for this query."
        
        return results.to_string(index=False)
    
    except Exception as e:
        return f"Error searching data: {str(e)}"
    
@tool 
async def draft_email(user_input: Any) -> str:
    """Agent logic to quickly draft an email """
    try: 
        email: AgentEmail = await email_drafting_chain.ainvoke({"input": user_input})
        return {
            "status": "email_drafted",
            "email": email.model_dump(by_alias=True)   # This returns 'from' instead of 'from_email'
        }
    except Exception as e:
        print("Error drafting email:", str(e))
        return {
            "status": "error",
            "message": "Failed to draft email. Please try again."
        }

# # Initialize tools
tools = [general_chat, lookup_data, draft_email]
llm_with_tools = llm.bind_tools(tools, tool_choice = 'auto')

structured_llm = llm.with_structured_output(AgentEmail)

email_prompt = ChatPromptTemplate.from_messages([
    ("system", """You are an expert email writer.
    Your only job is to draft professional and clear emails.
    Always respond with a well-structured email containing to, from, subject, and body."""),
    ("human", "{input}")
])

email_drafting_chain = email_prompt | structured_llm

async def planner_agent(user_input) -> str:
    """
    Agent that takes in user_input and decides which tool to use.
    Returns model output as a string.
    """
    try:
        prompt = ChatPromptTemplate.from_messages([
            ("system", """You are a helpful AI assistant.
            You have access to different tools:
            - lookup_data: Use this when user asks about information that might exist in the dataset.
            - general_chat: Use this for casual talk, explanations, or when no data is needed.
            - draft_email: Use this when user wants to draft or send an email.
            Think step by step before choosing a tool."""),
            ("placeholder", "{chat_history}"),
            ("human", "{input}"),
            ("placeholder", "{agent_scratchpad}"),
        ])

        agent = create_tool_calling_agent(llm_with_tools, tools, prompt)
        agent_executor = AgentExecutor(
            agent=agent,
            tools=tools,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=2
        )

        response = await agent_executor.ainvoke({"input": user_input})
        output = response.get('output', str(response))

        try:
            parsed = json.loads(output)
            if parsed.get("status") == "email_drafted":
                email = parsed["email"]
                return (
                    f"Email drafted!\n\n"
                    f"To: {email['to']}\n"
                    f"From: {email['from']}\n"
                    f"Subject: {email['subject']}\n\n"
                    f"{email['body']}"
                )
        except (json.JSONDecodeError, TypeError, KeyError):
            pass

        return output

    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return f"[Error calling LLM] {str(e)}"