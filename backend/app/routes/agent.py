from fastapi import APIRouter
from app.schemas import AgentRequest, AgentResponse
from app.agents.planner import PlannerAgent

router = APIRouter()

@router.post("/agent/planner", response_model = AgentResponse)
def RunPlanner(req: AgentRequest):
    result = PlannerAgent(req.user_input)
    return AgentResponse(result = result)
    