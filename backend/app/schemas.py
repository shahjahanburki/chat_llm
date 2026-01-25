from pydantic import BaseModel

class AgentRequest(BaseModel):
    user_input: str
    
class AgentResponse(BaseModel):
    result: str
    
    