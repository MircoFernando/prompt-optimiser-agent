import operator
import time
from typing import TypedDict, Literal, Annotated
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import START, END, StateGraph
from src.utils.config import get_config
from src.utils.llm_services import create_llm_provider

# Initialize configurations
config = get_config()
llm = create_llm_provider()

class ReflectionState(TypedDict):
    query: str
    current_draft: str
    critique: str
    revision_history: Annotated[list, operator.add]  # appends each revised draft
    is_sufficient: bool
    iteration: int
    max_iterations: int
    total_tokens: int

async def draft_node(state: ReflectionState):
    """Generate initial draft response."""
    response = llm.generate(
        prompt=state["query"],
        system_prompt=(
            "You are an Expert AI Prompt Engineer specializing in designing production-ready system prompts for Large Language Models." 
            "Your task is to take a user's rough idea OR a Critic's feedback, and transform it into a highly structured, rigorous system prompt."
            "A perfect system prompt must contain the following sections:"
            "1. ROLE & PERSONA: Who the AI is acting as (e.g., You are a senior DevOps engineer...)."
            "2. CONTEXT: The background information the AI needs to understand the environment."
            "3. CORE TASK: The exact action the AI must perform."
            "4. STRICT CONSTRAINTS: What the AI must NEVER do (e.g., tone limits, forbidden external libraries, length boundaries)."
            "5. OUTPUT FORMAT: Exactly how the final response should be structured (e.g., JSON schema, bullet points, Markdown)."

            "RULES FOR YOUR OUTPUT:"
            "- Incorporate all feedback provided by the Critic if this is a subsequent iteration."
            "- Output ONLY the optimized prompt text. "
            "- Do not include conversational filler like Here is your prompt or I have optimized this."
            "-Do not provide harmful, unethical, or biased content. Always adhere to ethical guidelines. "
            "- Do not wrap the output in markdown code blocks (```) unless the prompt itself requires them."
        ),
    )
    print(f"\n{response['response'][:300]}...")
    print(f"\n[Tokens: {response['total_tokens']}, Latency: {response['latency_ms']}ms]")

    return {
        "current_draft": response["response"],
        "total_tokens": state["total_tokens"] + response["total_tokens"],
    }
    

async def critic_node(state: ReflectionState):
    """Critique the current draft and decide if it's sufficient."""
    iteration = state["iteration"] + 1

    print(f"\n{'=' * 70}")
    print(f"NODE: critique (iteration {iteration}/{state['max_iterations']})")
    print(f"{'=' * 70}")

    response = llm.generate(
        prompt=(
            f"Original Question: {state['query']}\n\n"
            f"Draft Response: {state['current_draft']}\n\n"
            f"Please provide a critical review with specific improvement suggestions."
        ),
        system_prompt=(
            "You are a strict, detail-oriented Senior AI Evaluator. Your sole purpose is to review and critique LLM system prompts drafted by a junior Prompt Engineer."
            "You do not write prompts. You only evaluate them."
            "EVALUATION RUBRIC:"
            "You must check the provided draft against these 5 mandatory criteria:"
            "1. ROLE: Is the persona clearly defined?"
            "2. CONTEXT: Is there sufficient background information?"
            "3. TASK: Is the core objective unambiguous?"
            "4. CONSTRAINTS: Are there strict rules on what the AI must NOT do?"
            "5. FORMAT: Is the exact output structure clearly defined?"

            "YOUR INSTRUCTIONS:"
            "- If the draft PERFECTLY meets all 5 criteria and is ready for a production environment, you must output exactly and only the word: APPROVED"
            "- If the draft is missing any elements, has ambiguous instructions, or contains conversational filler, you must reject it."
            "IF REJECTING:"
            "Output a concise, bulleted list of exactly what the Generator must fix in the next iteration. "
            "Do NOT rewrite the prompt for them. "
            "Do NOT include conversational filler like Here is my feedback. "
            "Output ONLY the bulleted list of required fixes."
        ),
    )

    print(f"\n{response['response'][:300]}...")
    print(f"\n[Tokens: {response['total_tokens']}, Latency: {response['latency_ms']}ms]")

    return {
        "critique": response["response"],
        "iteration": iteration,
        "total_tokens": state["total_tokens"] + response["total_tokens"],
    }
    
async def assessment_node(state: ReflectionState):
    """Assess the current draft and critiq decide to loop or respond"""
 
    print(f"\n{'=' * 70}")
    print(f"NODE: assess (iteration {state['iteration']}/{state['max_iterations']})")
    print(f"{'=' * 70}")
    
    if state['iteration'] > state['max_iterations']:
        print("Max iterations reached")
        return {'is_sufficient' : True}

    response = llm.generate(
         prompt=(
            f"Original question: {state['query']}\n\n"
            f"Draft response (excerpt): {state['current_draft'][:500]}\n\n"
            f"Critique: {state['critique']}\n\n"
            f"Is the draft already sufficient based on this critique? "
            f"Use SUFFICIENT and REASONING as specified."
        ),
        system_prompt=(
            "You are an evaluator judging whether a critique indicates the draft is "
            "already of sufficient quality and needs no further revision.\n\n"
            "Respond in exactly this format (no other text):\n"
            "SUFFICIENT: YES or NO\n"
            "REASONING: <one short sentence>"
        ),
    )

    print(f"\n{response['response'][:300]}...")
    print(f"\n[Tokens: {response['total_tokens']}, Latency: {response['latency_ms']}ms]")
    
    text = response["response"].strip().upper()
    sufficient = "SUFFICIENT: YES" in text or "SUFFICIENT:YES" in text

    reasoning = ""
    if "REASONING:" in response["response"]:
        reasoning = response["response"].split("REASONING:")[-1].strip().split("\n")[0]

    print(f"Sufficient: {sufficient}")
    print(f"Reasoning:  {reasoning}")

    return {
        "is_sufficient": sufficient,
        "total_tokens": state["total_tokens"] + response["total_tokens"],
    }


async def revise_node(state: ReflectionState) -> dict:
    """Revise draft based on critique."""
    print(f"\n{'=' * 70}")
    print(f"NODE: revise (iteration {state['iteration']})")
    print(f"{'=' * 70}")

    response = llm.generate(
        prompt=(
            f"Original Question: {state['query']}\n\n"
            f"Your Draft: {state['current_draft']}\n\n"
            f"Critique Feedback: {state['critique']}\n\n"
            f"Please provide an improved response that addresses all feedback points."
        ),
        system_prompt=(
            "You are a Senior Prompt Refinement Specialist. Your exact task is to execute surgical revisions on LLM system prompts that have failed quality assurance."

            "YOUR INSTRUCTIONS:"
            "1. Analyze the Critic Feedback carefully. "
            "2. Apply the exact changes requested to the Current Draft."
            "3. Retain any sections of the Current Draft that were NOT criticized. Do not rewrite the entire prompt from scratch unnecessarily; only fix what is broken."
            "4. Ensure the final output still strictly adheres to the 5-part enterprise structure:"
            "- ROLE & PERSONA"
            "- CONTEXT"
            "- CORE TASK"
            "- STRICT CONSTRAINTS"
            "- OUTPUT FORMAT"

            "OUTPUT RULES:"
            "- Output ONLY the newly revised prompt text."
            "- Do NOT output any conversational filler (e.g., Here is the revised version, I have applied the feedback)."
            "- Do NOT include the critic's feedback in your output."
        ),
    )

    print(f"\n{response['response'][:300]}...")
    print(f"\n[Tokens: {response['total_tokens']}, Latency: {response['latency_ms']}ms]")

    return {
        "current_draft": response["response"],
        "revision_history": [response["response"]],  # Annotated[list] appends across iterations
        "total_tokens": state["total_tokens"] + response["total_tokens"],
    }
    
def should_continue(state: ReflectionState) -> str:
    """Routing function: stop or continue the loop."""
    if state["is_sufficient"]:
        return "sufficient"
    return "needs_improvement"

workflow = StateGraph(ReflectionState)
workflow.add_node("Draft", draft_node)
workflow.add_node("Critic", critic_node)
workflow.add_node("Assess", assessment_node)
workflow.add_node("Revise", revise_node)


workflow.add_edge(START, "Draft")
workflow.add_edge("Draft", "Critic")
workflow.add_edge("Critic", "Assess")
workflow.add_conditional_edges("Assess", should_continue, {
    "sufficient" : END,
    "needs_improvement" : "Revise"
})
workflow.add_edge("Revise", "Critic")

langgraph_app = workflow.compile()

async def execute_langgraph_optimization(user_input: str, max_iterations: int = 3):
    """Run the LangGraph workflow to optimize a prompt.

    Returns (optimized_text, latency_seconds)
    """
    start_time = time.time()
    initial_state = {
        "query": user_input,
        "current_draft": "",
        "critique": "",
        "revision_history": [],
        "is_sufficient": False,
        "iteration": 0,
        "max_iterations": max_iterations,
        "total_tokens": 0,
    }
    result = await langgraph_app.ainvoke(initial_state)
    latency = round(time.time() - start_time, 2)
    return result.get("current_draft", ""), latency
