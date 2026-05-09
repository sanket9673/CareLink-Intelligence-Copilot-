import asyncio
import os
import sys
from sqlalchemy import select, func

# Add the apps/api directory to sys.path so we can import modules correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import engine, Base, async_session_factory
from models import GlucoseReading, InsulinEvent
from scripts.generate_mock_data import generate_mock_csv
from services.parser import parse_csv_to_db

async def run_test():
    print("--- Phase 1 Verification: Data Modeling & Parser Engine ---")
    
    # 1. Initialize Database Tables
    print("\n[1/4] Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # 2. Generate Mock Data
    print("\n[2/4] Generating mock data...")
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "mock_carelink.csv")
    generate_mock_csv(csv_path, num_rows=100)
    
    # 3. Parse CSV to DB
    print("\n[3/4] Running parser service...")
    async with async_session_factory() as session:
        await parse_csv_to_db(csv_path, session)
    
    # 4. Verify Results
    print("\n[4/4] Verifying database records...")
    async with async_session_factory() as session:
        # Count readings
        reading_count = await session.execute(select(func.count()).select_from(GlucoseReading))
        event_count = await session.execute(select(func.count()).select_from(InsulinEvent))
        
        r_count = reading_count.scalar()
        e_count = event_count.scalar()
        
        print(f"Total Glucose Readings: {r_count}")
        print(f"Total Insulin/Meal Events: {e_count}")
        
        # Fetch sample readings
        result = await session.execute(select(GlucoseReading).limit(5))
        readings = result.scalars().all()
        print("\nSample Glucose Readings:")
        for r in readings:
            print(f" - {r.timestamp}: {r.value} mg/dL")

    print("\n--- Verification Complete ---")

if __name__ == "__main__":
    asyncio.run(run_test())
