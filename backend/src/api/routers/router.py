from fastapi import APIRouter
from src.schemas.optimize_dto import PromptRequest, OptimizationResponse, SessionClearRequest, SessionClearResponse
from src.services.agent_services import OptimizerService

router = APIRouter(prefix="/api/v1/optimize", tags=["Optimizer"])

@router.post("/adk", response_model=OptimizationResponse)
async def optimize_adk(request: PromptRequest):
    return await OptimizerService.run_adk(request)

@router.post("/langgraph", response_model=OptimizationResponse)
async def optimize_langgraph(request: PromptRequest):
    return await OptimizerService.run_langgraph(request)


@router.post("/session/clear", response_model=SessionClearResponse)
async def clear_session(request: SessionClearRequest):
    return await OptimizerService.clear_session(request)