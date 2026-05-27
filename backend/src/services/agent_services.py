# from src.frameworks.adk.loop import execute_adk_optimization
from src.frameworks.langgraph.langraph_engine import execute_langgraph_optimization
from src.schemas.optimize_dto import PromptRequest, OptimizationResponse

class OptimizerService:
    # @staticmethod
    # def run_adk(request: PromptRequest) -> OptimizationResponse:
    #     draft, latency = execute_adk_optimization(request.initial_prompt, request.max_iterations)
    #     return OptimizationResponse(
    #         optimized_draft=draft,
    #         latency_seconds=latency,
    #         framework_used="Google ADK"
    #     )

    @staticmethod
    def run_langgraph(request: PromptRequest) -> OptimizationResponse:
        draft, latency = execute_langgraph_optimization(request.initial_prompt, request.max_iterations)
        return OptimizationResponse(
            optimized_draft=draft,
            latency_seconds=latency,
            framework_used="LangGraph"
        )