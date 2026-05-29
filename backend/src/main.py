import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from src.api.routers.router import router
from src.middleware.error_middleware import register_error_middleware
  
load_dotenv()

app = FastAPI(title="Prompt Optimizer Enterprise API")

FRONT_END_URL = os.getenv("FRONTEND_URL")

register_error_middleware(app)

# Allow the React frontend to communicate with this API
app.add_middleware(
CORSMiddleware,
allow_origins=[FRONT_END_URL],
allow_credentials=True,
allow_methods=["*"],
allow_headers=["*"],
)

# Register the routers
app.include_router(router)

@app.get("/")
def health_check():
    return {"status": "Enterprise Backend is Running 🚀"}