import asyncio
import os
import sys
import csv
from datetime import datetime

# Add the apps/api directory to sys.path so we can import modules correctly
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import select, func
from database import engine, Base, async_session_factory
from models import GlucoseReading, InsulinEvent, Patient
from schemas import CareLinkRowSchema

async def seed_db():
    print("Starting database seeding...")
    csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "mock_carelink.csv")
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return

    # Ensure tables are recreated
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session_factory() as session:
        patients_data = [
            {"id": "patient-123", "name": "Alice Johnson"},
            {"id": "patient-456", "name": "Bob Smith"},
            {"id": "patient-789", "name": "Charlie Davis"}
        ]
        
        for p in patients_data:
            session.add(Patient(id=p["id"], name=p["name"]))
            
        await session.commit()
        
        row_count = 0
        
        with open(csv_path, mode='r') as file:
            reader = csv.DictReader(file)
            rows = list(reader)
            
            for row in rows:
                try:
                    # Parse and validate the row using the existing schema
                    validated_row = CareLinkRowSchema(**row)
                except Exception as e:
                    print(f"Skipping invalid row: {row}. Error: {e}")
                    continue
                
                # Duplicate data for each patient to have rich data
                for p in patients_data:
                    pid = p["id"]
                    
                    # 1. Create a Glucose Reading
                    reading = GlucoseReading(
                        patient_id=pid,
                        timestamp=validated_row.timestamp,
                        value=validated_row.glucose_level
                    )
                    session.add(reading)
                    
                    # 2. If it's a meal or bolus, create an InsulinEvent
                    if validated_row.event_type in ['meal', 'bolus']:
                        event = InsulinEvent(
                            patient_id=pid,
                            timestamp=validated_row.timestamp,
                            event_type=validated_row.event_type,
                            units=validated_row.value if validated_row.event_type == 'bolus' else None,
                            carbs=validated_row.value if validated_row.event_type == 'meal' else None
                        )
                        session.add(event)
                    
                    row_count += 1
        
        # CRITICAL: Commit to persist data to the database
        await session.commit()
        print(f"Successfully seeded {row_count} rows into the database.")
        
        # 3. Verify Data Ingestion
        reading_result = await session.execute(select(func.count()).select_from(GlucoseReading))
        reading_count = reading_result.scalar()
        
        event_result = await session.execute(select(func.count()).select_from(InsulinEvent))
        event_count = event_result.scalar()
        
        print("\n--- Verification ---")
        print(f"Total Glucose Readings in DB: {reading_count}")
        print(f"Total Insulin/Meal Events in DB: {event_count}")

if __name__ == "__main__":
    asyncio.run(seed_db())
