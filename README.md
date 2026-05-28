# Prompt Optimiser Agent

Lightweight demo comparing two prompt-optimization frameworks: Google ADK and LangGraph.

## Project Overview

- Backend: FastAPI application providing prompt-optimization endpoints.
- Two optimization engines implemented for comparison:
  - Google ADK-based workflow (backend/src/frameworks/adk/loop.py)
  - LangGraph-based workflow (backend/src/frameworks/langgraph/langraph_engine.py)
- LLM integration via a local provider factory in `backend/src/utils/llm_services.py`.
- Session memory (demo-only): ADK uses `InMemorySessionService`; LangGraph uses `MemorySaver` (in-memory checkpointing).

> Frontend: React application (placeholder) — the project assumes a React frontend will communicate with the backend.

## What’s implemented

- FastAPI app: `backend/src/main.py` exposes endpoints and CORS configuration.
- API router: `backend/src/api/routers/router.py` provides two endpoints:
  - `POST /api/v1/optimize/adk` — run the ADK workflow
  - `POST /api/v1/optimize/langgraph` — run the LangGraph workflow
- ADK workflow: session-managed iterative loop using `InMemorySessionService` (demo).
- LangGraph workflow: StateGraph with nodes (`Draft`, `Critic`, `Assess`, `Revise`) and `MemorySaver` checkpointer; `revision_history` accumulates revisions.
- LLM Providers: `create_llm_provider()` supports OpenAI / OpenRouter adapters.
- Basic config loader: `backend/src/utils/config.py` reads YAML config and `.env` with `python-dotenv`.

## Quickstart (local demo)

Prerequisites:
- Python 3.9+ (project used 3.9 for compatibility; production should use >=3.10)
- A virtualenv in `.venv` with project deps installed (see `requirements.txt`).

Run the backend:

```bash
source .venv/bin/activate
cd backend
# set required env vars (example using OpenAI)
export OPENAI_API_KEY="sk-..." TAVILY_API_KEY="tavily_key"
.venv/bin/uvicorn src.main:app --reload --host 127.0.0.1 --port 8000
```

Health check: GET `http://127.0.0.1:8000/` should return status JSON.

API request format (JSON):

```json
{ "initial_prompt": "Improve this prompt...", "max_iterations": 3 }
```

## Environment variables

- `OPENAI_API_KEY` or `OPENROUTER_API_KEY` (depends on `provider.default` in `backend/config/params.yaml`)
- `TAVILY_API_KEY` (used by the `web` provider)

## Demo behavior & caveats

- Memory is ephemeral: both ADK `InMemorySessionService` and LangGraph `MemorySaver` are in-memory and will be lost on server restart or reload.
- For the demo the code uses a fixed `session_id` so state is reused across requests — replace with per-client `session_id` for multi-user tests.
- Including `revision_history` in the prompt increases token usage; consider trimming, summarizing, or limiting history for production.
- The project currently runs with Python 3.9 in the demo; some upstream libs may require Python >=3.10.


## Next steps (ideas)

- Add `session_id` field to the `PromptRequest` DTO and wire it through the API to both engines.
- Add a small React frontend (placeholder) to drive the demos and a session inspector endpoint for visualizing `revision_history`.

## Files to inspect

- `backend/src/frameworks/adk/loop.py` — ADK workflow and session logic
- `backend/src/frameworks/langgraph/langraph_engine.py` — LangGraph workflow and checkpoints
- `backend/src/utils/llm_services.py` — LLM provider factory
- `backend/src/utils/config.py` — YAML + .env loader and env validation
- `requirements.txt` — pinned dependencies

----

