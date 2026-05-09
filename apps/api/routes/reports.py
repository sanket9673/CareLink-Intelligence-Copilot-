from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, date, timedelta
from typing import Optional

from database import get_db
from services.analytics import AnalyticsService
from services.ai_engine import InsightGenerator
from models import Patient
from sqlalchemy import select

router = APIRouter(prefix="/reports", tags=["reports"])
ai_engine = InsightGenerator()

@router.get("/{patient_id}")
async def get_report_data(patient_id: str, db: AsyncSession = Depends(get_db)):
    # 1. Fetch Patient Metadata
    stmt = select(Patient).where(Patient.id == patient_id)
    result = await db.execute(stmt)
    patient = result.scalar_one_or_none()
    
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")

    # 2. Summary Metrics (7 days)
    end_date = datetime.now()
    start_date = end_date - timedelta(days=7)
    
    tir = await AnalyticsService.get_time_in_range(db, patient_id, start_date, end_date)
    daily = await AnalyticsService.get_daily_summary(db, patient_id, end_date.date())
    
    # Calculate GMI (Glucose Management Indicator) approx: 3.31 + 0.02392 * mean_glucose
    # mean_glucose from daily if available
    avg_glucose = daily["avg_glucose"] if daily and daily["avg_glucose"] else 150
    gmi = 3.31 + (0.02392 * avg_glucose)

    # 3. Weekly Trends
    trends = await AnalyticsService.get_weekly_trends(db, patient_id)

    # 4. Recent AI Insight (Generate on the fly for report if not cached)
    data_context = {
        "time_in_range_7_days": tir,
        "latest_daily_summary": daily,
        "weekly_trends": trends
    }
    insight = ai_engine.generate_insight("clinician", data_context, [])

    return {
        "patient": {
            "id": patient.id,
            "name": patient.name,
            "dob": "1985-05-15", # Mock DOB
            "generated_at": datetime.now().isoformat()
        },
        "metrics": {
            "tir": tir,
            "avg_glucose": avg_glucose,
            "gmi": round(gmi, 1)
        },
        "trends": trends,
        "insight": insight
    }
