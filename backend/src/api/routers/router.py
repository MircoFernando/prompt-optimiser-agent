from fastapi import APIRouter
from src.schemas.optimize_dto import PromptRequest, OptimizationResponse
from src.services.agent_services import OptimizerService

router = APIRouter(prefix="/api/v1/optimize", tags=["Optimizer"])

# @router.post("/adk", response_model=OptimizationResponse)
# async def optimize_adk(request: PromptRequest):
#     # In a fully async app, we would use asyncio to run these blocking AI calls
#     return OptimizerService.run_adk(request)

@router.post("/langgraph", response_model=OptimizationResponse)
async def optimize_langgraph(request: PromptRequest):
    return OptimizerService.run_langgraph(request)