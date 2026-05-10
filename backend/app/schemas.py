from pydantic import BaseModel, Field

class AgentRequest(BaseModel):
    user_input: str
    
class AgentResponse(BaseModel):
    result: str
    
class AgentEmail(BaseModel):
    to : str
    from_email : str = Field(..., alias="from")
    subject : str
    body: str