from pydantic import BaseModel, Field

# This file defines the data models for the prompt optimization API, including the request and response schemas.
class PromptRequest(BaseModel):
    """Schema for the prompt optimization request, containing the initial user prompt and the maximum number of iterations for optimization."""
    
    initial_prompt: str = Field(..., description="The user prompt to optimize")
    max_iterations: int = Field(default=3, description="Safety limit for reflection loops")

class OptimizationResponse(BaseModel):
    """Schema for the prompt optimization response, containing the optimized prompt, latency, and framework used."""
    optimized_draft: str
    latency_seconds: float
    framework_used: str