from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta

from database import get_db
from schemas.ai_response import InsightResponse, InsightRequest
from services.analytics import AnalyticsService
from services.ai_engine import InsightGenerator

router = APIRouter(prefix="/ai", tags=["AI Insights"])
ai_engine = InsightGenerator()

@router.post("/generate-insight", response_model=InsightResponse)
async def generate_insight(
    request: InsightRequest,
    db: AsyncSession = Depends(get_db)
):
    try:
        # Get data context using AnalyticsService
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        time_in_range = await AnalyticsService.get_time_in_range(db, request.patient_id, start_date, end_date)
        daily_summary = await AnalyticsService.get_daily_summary(db, request.patient_id, end_date.date())
        weekly_trends = await AnalyticsService.get_weekly_trends(db, request.patient_id)
        
        data_context = {
            "time_in_range_7_days": time_in_range,
            "latest_daily_summary": daily_summary,
            "weekly_trends": weekly_trends
        }
        
        # Call InsightGenerator synchronously.
        # In a high-throughput production setting, we'd use AsyncGroq, 
        # but the standard client blocks lightly here.
        insight = ai_engine.generate_insight(request.persona, data_context, request.history)
        return insight
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insight: {str(e)}")
