from src.frameworks.adk.loop import execute_adk_optimization
from src.frameworks.adk.loop import clear_adk_session
from src.frameworks.langgraph.langraph_engine import execute_langgraph_optimization
from src.frameworks.langgraph.langraph_engine import clear_langgraph_session
from src.schemas.optimize_dto import PromptRequest, OptimizationResponse, SessionClearRequest, SessionClearResponse

class OptimizerService:
    @staticmethod
    async def run_adk(request: PromptRequest) -> OptimizationResponse:
        draft, latency, input_tokens, output_tokens = await execute_adk_optimization(
            request.initial_prompt,
            request.max_iterations,
            request.session_id,
        )
        return OptimizationResponse(
            optimized_draft=draft,
            latency_seconds=latency,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            framework_used="Google ADK"
        )

    @staticmethod
    async def run_langgraph(request: PromptRequest) -> OptimizationResponse:
        draft, latency, input_tokens, output_tokens = await execute_langgraph_optimization(
            request.initial_prompt,
            request.max_iterations,
            request.session_id,
        )
        return OptimizationResponse(
            optimized_draft=draft,
            latency_seconds=latency,
            input_tokens=input_tokens,
            output_tokens=output_tokens,
            framework_used="LangGraph"
        )

    @staticmethod
    async def clear_session(request: SessionClearRequest) -> SessionClearResponse:
        adk_cleared = clear_adk_session(request.session_id)
        langgraph_cleared = clear_langgraph_session(request.session_id)

        if adk_cleared or langgraph_cleared:
            detail = "Session memory cleared for available frameworks"
        else:
            detail = "Session memory was not found or could not be cleared"

        return SessionClearResponse(
            detail=detail,
            session_id=request.session_id,
        )