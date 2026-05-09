from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import random
from datetime import datetime
from database import async_session_factory
from models import GlucoseReading
from contextlib import asynccontextmanager

async def simulate_live_data():
    current_glucose = 120
    while True:
        await asyncio.sleep(8)
        # Random walk for realistic glucose
        current_glucose += random.randint(-5, 5)
        current_glucose = max(70, min(250, current_glucose))
        
        async with async_session_factory() as session:
            for pid in ["patient-123", "patient-456", "patient-789"]:
                # simple jitter
                p_glucose = current_glucose + random.randint(-2, 2)
                p_glucose = max(70, min(250, p_glucose))
                
                new_reading = GlucoseReading(
                    patient_id=pid,
                    timestamp=datetime.now(),
                    value=float(p_glucose)
                )
                session.add(new_reading)
            await session.commit()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start the background simulator
    task = asyncio.create_task(simulate_live_data())
    yield
    # Shutdown: cancel task
    task.cancel()

app = FastAPI(title="CareLink Intelligence Copilot API", lifespan=lifespan)

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
from routes.patients import router as patients_router

app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(patients_router)
