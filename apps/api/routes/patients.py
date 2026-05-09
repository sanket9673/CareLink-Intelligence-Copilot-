from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from database import get_db
from models import Patient

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("")
async def get_patients(db: AsyncSession = Depends(get_db)):
    query = select(Patient)
    result = await db.execute(query)
    patients = result.scalars().all()
    
    return [
        {
            "id": p.id,
            "name": p.name,
            "last_updated": p.last_updated
        }
        for p in patients
    ]
