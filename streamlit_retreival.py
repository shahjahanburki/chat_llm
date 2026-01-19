import streamlit as st
import os
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from duckduckgo_search import DDGS
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
def GetWeather(city: str) -> str:
    """Get weather for a given city."""
    return f"It's always sunny in {city}!"

@tool
def WriteSQLQuery(problem: str) -> str:
    """Write a SQL query based on the given problem description.
    
    Args:
        problem: A natural language description of what the SQL query should do
        
    Returns:
        A SQL query string in this variable: {sql_query}
    """
    
    return f"Generated SQL query for: {problem}"
    
@tool 
def SearchWeb(query: str) -> str:
    """Search the web and get the relavent answer."""
    results = DDGS().text("python programming", max_results=3)
    return results    
    
# Initialize the model
llm = ChatOllama(
    model="llama3.2:3b",
    # google_api_key=google_api_key, # In case the Gemini API is used later
    temperature=0,
    base_url="http://localhost:11434",
)

# Create prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant that can use tools ONLY when necessary. When you decide to use a tool, call it using the exact tool calling format. When you have the final answer - just write normal text."),
    ("human", "{input}"),
    ("placeholder", "{agent_scratchpad}"),
])

# Create agent
tools = [GetWeather, WriteSQLQuery, SearchWeb]
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