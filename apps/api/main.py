from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CareLink Intelligence Copilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to CareLink Intelligence Copilot API"}

from routes.analytics import router as analytics_router
from routes.ai import router as ai_router

app.include_router(analytics_router)
app.include_router(ai_router)
