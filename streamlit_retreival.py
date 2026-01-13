import streamlit as st 
import json 
import os 
from google import genai
from google.genai import types
from pydantic import BaseModel, Field
from dotenv import load_dotenv


load_dotenv()

google_api_key = os.getenv('GOOGLE_API_KEY')
client = genai.Client(api_key= google_api_key)
kb_path = 'data/kb.json'

st.title("Chat Bot")

def search_kb(question: str):
    f"""
    You are a helpful assistant that answers questions from the knowledgebase about an ecommerce store.
    Load the whole knowledge base from the JSON file located at {kb_path}.
    (This is a mock function for demonstration purposes, we don't search)
    """
    with open(kb_path, 'r') as f:
        return json.load(f)
    
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_kb",
            "description": "Get the answer to the user's question from the knowledge base.",
            "parameters": {
                "type": "object",
                "properties": {
                    "question": {"type": "string"},
                },
                "required": ["question"],
                "additionalProperties": False,
            },
            "strict": True,
        },
    }
]

config = types.GenerateContentConfig(
    tools = [search_kb],
    # response_mime_type= 'application/json'
    )

def call_function(name, args):
    if name== "search_kb":
        return search_kb(**args)

def GetDataFromBot(user_query):
    try: 
        response = client.models.generate_content(
        model="gemini-2.5-flash",
        config= config,
        contents= user_query
        )
        return response.text

    except Exception as e:
        return e

user_query = ''

user_query = st.text_input("Start Chat here:")

# Adding exit sequence
if st.button("Send"):

    # Prevent blank or whitespace-only inputs
    if not user_query.strip():
        st.warning("Please enter a message before sending.")
    
    elif user_query.lower() == "exit":
        st.warning("Ending session.")
    else:
        response = GetDataFromBot(user_query)
    st.subheader("Assistant Response")
    # st.markdown(response.strip())
    st.markdown(response)