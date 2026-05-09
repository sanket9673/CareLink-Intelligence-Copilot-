from sqlalchemy import select, func, case, and_
from sqlalchemy.ext.asyncio import AsyncSession
from models import GlucoseReading, InsulinEvent
from datetime import date, datetime, timedelta

LOW_GLUCOSE = 70
HIGH_GLUCOSE = 180

class AnalyticsService:
    @staticmethod
    async def get_time_in_range(db: AsyncSession, patient_id: str, start_date: datetime, end_date: datetime):
        # Use func.case to categorize readings 
        is_below = case((GlucoseReading.value < LOW_GLUCOSE, 1.0), else_=0.0)
        is_above = case((GlucoseReading.value > HIGH_GLUCOSE, 1.0), else_=0.0)
        is_in_range = case((and_(GlucoseReading.value >= LOW_GLUCOSE, GlucoseReading.value <= HIGH_GLUCOSE), 1.0), else_=0.0)
        
        query = select(
            func.avg(is_in_range).label("in_range"),
            func.avg(is_below).label("below"),
            func.avg(is_above).label("above"),
            func.count(GlucoseReading.id).label("total")
        ).where(
            and_(
                GlucoseReading.timestamp >= start_date,
                GlucoseReading.timestamp <= end_date
            )
        )
        
        result = await db.execute(query)
        row = result.first()
        
        # Handle gracefully if no records are found
        if not row or row.total == 0:
            return None
            
        return {
            "percentage_in_range": row.in_range or 0.0,
            "percentage_below": row.below or 0.0,
            "percentage_above": row.above or 0.0
        }

    @staticmethod
    async def get_daily_summary(db: AsyncSession, patient_id: str, target_date: date):
        start_ts = datetime.combine(target_date, datetime.min.time())
        end_ts = datetime.combine(target_date, datetime.max.time())
        
        glucose_query = select(
            func.avg(GlucoseReading.value).label("avg_glucose"),
            func.min(GlucoseReading.value).label("min_glucose"),
            func.max(GlucoseReading.value).label("max_glucose"),
            func.count(GlucoseReading.id).label("count")
        ).where(
            and_(
                GlucoseReading.timestamp >= start_ts,
                GlucoseReading.timestamp <= end_ts
            )
        )
        
        insulin_query = select(
            func.sum(InsulinEvent.units).label("total_insulin"),
            func.sum(InsulinEvent.carbs).label("total_carbs")
        ).where(
            and_(
                InsulinEvent.timestamp >= start_ts,
                InsulinEvent.timestamp <= end_ts
            )
        )
        
        g_result = await db.execute(glucose_query)
        i_result = await db.execute(insulin_query)
        
        g_row = g_result.first()
        i_row = i_result.first()
        
        if (not g_row or g_row.count == 0) and (not i_row or (i_row.total_insulin is None and i_row.total_carbs is None)):
            return None
            
        return {
            "date": target_date,
            "avg_glucose": g_row.avg_glucose,
            "min_glucose": g_row.min_glucose,
            "max_glucose": g_row.max_glucose,
            "total_insulin": i_row.total_insulin or 0.0,
            "total_carbs": i_row.total_carbs or 0.0
        }

    @staticmethod
    async def get_weekly_trends(db: AsyncSession, patient_id: str):
        end_date = datetime.now()
        start_date = end_date - timedelta(days=7)
        
        # SQLite specific date extraction func.date
        date_expr_g = func.date(GlucoseReading.timestamp)
        
        glucose_query = select(
            date_expr_g.label("day"),
            func.avg(GlucoseReading.value).label("avg_glucose"),
            func.min(GlucoseReading.value).label("min_glucose"),
            func.max(GlucoseReading.value).label("max_glucose")
        ).where(
            and_(
                GlucoseReading.timestamp >= start_date,
                GlucoseReading.timestamp <= end_date
            )
        ).group_by(date_expr_g)
        
        date_expr_i = func.date(InsulinEvent.timestamp)
        insulin_query = select(
            date_expr_i.label("day"),
            func.sum(InsulinEvent.units).label("total_insulin"),
            func.sum(InsulinEvent.carbs).label("total_carbs")
        ).where(
            and_(
                InsulinEvent.timestamp >= start_date,
                InsulinEvent.timestamp <= end_date
            )
        ).group_by(date_expr_i)
        
        g_result = await db.execute(glucose_query)
        i_result = await db.execute(insulin_query)
        
        # To avoid cartesian products from joining independent daily aggregations in SQL, 
        # merge the pre-aggregated results in Python.
        trends_map = {}
        
        def parse_date(d_str):
            if isinstance(d_str, str):
                return datetime.strptime(d_str, "%Y-%m-%d").date()
            return d_str

        for r in g_result.all():
            if r.day:
                d = parse_date(r.day)
                trends_map[d] = {
                    "date": d,
                    "avg_glucose": r.avg_glucose,
                    "min_glucose": r.min_glucose,
                    "max_glucose": r.max_glucose,
                    "total_insulin": 0.0,
                    "total_carbs": 0.0
                }
                
        for r in i_result.all():
            if r.day:
                d = parse_date(r.day)
                if d not in trends_map:
                    trends_map[d] = {
                        "date": d,
                        "avg_glucose": None,
                        "min_glucose": None,
                        "max_glucose": None,
                        "total_insulin": r.total_insulin or 0.0,
                        "total_carbs": r.total_carbs or 0.0
                    }
                else:
                    trends_map[d]["total_insulin"] = r.total_insulin or 0.0
                    trends_map[d]["total_carbs"] = r.total_carbs or 0.0
                
        sorted_trends = sorted(list(trends_map.values()), key=lambda x: x["date"])
        return sorted_trends
