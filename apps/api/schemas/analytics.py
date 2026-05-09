from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class TimeInRangeSummary(BaseModel):
    percentage_in_range: float
    percentage_below: float
    percentage_above: float

class DailySummary(BaseModel):
    date: date
    avg_glucose: Optional[float] = None
    min_glucose: Optional[float] = None
    max_glucose: Optional[float] = None
    total_insulin: float = 0.0
    total_carbs: float = 0.0

class TrendPoint(BaseModel):
    timestamp: datetime
    avg_glucose: Optional[float] = None
    total_insulin: float = 0.0
    total_carbs: float = 0.0

class WeeklyTrendsResponse(BaseModel):
    trends: List[DailySummary]
