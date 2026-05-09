from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, date, timedelta
from typing import Optional

from database import get_db
from schemas.analytics import TimeInRangeSummary, DailySummary, WeeklyTrendsResponse
from services.analytics import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/summary/{patient_id}")
async def get_summary(
    patient_id: str, 
    target_date: Optional[date] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the Time In Range (TIR) for the last 24 hours and the daily summary for the specified date.
    """
    t_date = target_date or date.today()
    
    # Calculate TIR for the last 24 hours from the end of the target_date
    end_date = datetime.combine(t_date, datetime.max.time())
    start_date = end_date - timedelta(hours=24)
    
    tir = await AnalyticsService.get_time_in_range(db, patient_id, start_date, end_date)
    daily = await AnalyticsService.get_daily_summary(db, patient_id, t_date)
    
    if not tir:
        tir = {"percentage_in_range": 0.0, "percentage_below": 0.0, "percentage_above": 0.0}
    if not daily:
        daily = {
            "date": t_date,
            "avg_glucose": None,
            "min_glucose": None,
            "max_glucose": None,
            "total_insulin": 0.0,
            "total_carbs": 0.0
        }
        
    return {
        "time_in_range": tir,
        "daily_summary": daily
    }

@router.get("/trends/{patient_id}", response_model=WeeklyTrendsResponse)
async def get_trends(patient_id: str, db: AsyncSession = Depends(get_db)):
    """
    Returns the weekly trends aggregated by day.
    """
    trends = await AnalyticsService.get_weekly_trends(db, patient_id)
    if not trends:
        raise HTTPException(status_code=404, detail="No trends data found for this patient.")
    
    return {"trends": trends}

@router.get("/timeline/{patient_id}")
async def get_timeline(
    patient_id: str, 
    start_date: Optional[datetime] = None, 
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Returns a unified timeline of glucose readings and insulin/meal events.
    """
    end_ts = end_date or datetime.utcnow()
    start_ts = start_date or (end_ts - timedelta(hours=24))
    
    data = await AnalyticsService.get_timeline(db, patient_id, start_ts, end_ts)
    return data
