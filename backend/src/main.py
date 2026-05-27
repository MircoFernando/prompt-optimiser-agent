from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.api.routers import optimize

load_dotenv()

app = FastAPI(title="Prompt Optimizer Enterprise API")

# Allow the React frontend to communicate with this API
app.add_middleware(
CORSMiddleware,
allow_origins=["http://localhost:5173", "http://localhost:3000"],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

# Register the routers
app.include_router(optimize.router)

@app.get("/")
def health_check():
    return {"status": "Enterprise Backend is Running 🚀"}