from fastapi import APIRouter, HTTPException
from app.schemas import AgentRequest, AgentResponse
from app.agents.planner import planner_agent

router = APIRouter()

@router.post("/agent/planner", response_model = AgentResponse)
async def RunPlanner(req: AgentRequest):
    
    # result = PlannerAgent(req.user_input)
    try:
        result = await planner_agent(user_input = req.user_input)
        
        return AgentResponse(result = result)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Internal server error")
    