import csv
from sqlalchemy.ext.asyncio import AsyncSession
from models import GlucoseReading, InsulinEvent
from schemas import CareLinkRowSchema
from datetime import datetime

async def parse_csv_to_db(file_path: str, db: AsyncSession):
    """
    Parses the CareLink CSV file, validates each row using Pydantic,
    and persists valid records to the database.
    """
    with open(file_path, mode='r') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            # Validate row data
            try:
                validated_row = CareLinkRowSchema(**row)
            except Exception as e:
                print(f"Skipping invalid row: {row}. Error: {e}")
                continue
            
            # 1. Always create a Glucose Reading if it's a sensor event or has glucose data
            # (In this simplified model, every row has a glucose_level)
            reading = GlucoseReading(
                timestamp=validated_row.timestamp,
                value=validated_row.glucose_level
            )
            db.add(reading)
            
            # 2. If it's a meal or bolus, create an InsulinEvent
            if validated_row.event_type in ['meal', 'bolus']:
                event = InsulinEvent(
                    timestamp=validated_row.timestamp,
                    event_type=validated_row.event_type,
                    units=validated_row.value if validated_row.event_type == 'bolus' else None,
                    carbs=validated_row.value if validated_row.event_type == 'meal' else None
                )
                db.add(event)
        
        await db.commit()
        print(f"Successfully ingested data from {file_path}")
