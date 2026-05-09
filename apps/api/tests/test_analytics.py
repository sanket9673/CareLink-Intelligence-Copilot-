import asyncio
import os
import sys
from datetime import datetime, timedelta

# Add apps/api to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database import async_session_factory
from services.analytics import AnalyticsService

async def test_analytics_engine():
    print("--- Phase 2 Verification: Analytics Engine ---")
    
    patient_id = "test-patient-123"
    
    # We generated data for the last 2 days in the mock script.
    end_date = datetime.now() + timedelta(days=1)
    start_date = end_date - timedelta(days=4)
    target_date = datetime.now().date()
    
    async with async_session_factory() as db:
        print("\n[1/3] Testing Time In Range (TIR)...")
        tir = await AnalyticsService.get_time_in_range(db, patient_id, start_date, end_date)
        if tir:
            print(f"  TIR: {tir['percentage_in_range']*100:.1f}%")
            print(f"  Below: {tir['percentage_below']*100:.1f}%")
            print(f"  Above: {tir['percentage_above']*100:.1f}%")
            # Verify it's a valid float between 0 and 1
            assert 0.0 <= tir['percentage_in_range'] <= 1.0, "TIR must be between 0 and 1"
        else:
            print("  No TIR data found. Make sure you ran Phase 1.")
            
        print("\n[2/3] Testing Daily Summary...")
        daily = await AnalyticsService.get_daily_summary(db, patient_id, target_date)
        if daily:
            print(f"  Date: {daily['date']}")
            print(f"  Avg Glucose: {daily['avg_glucose']:.1f} mg/dL" if daily['avg_glucose'] else "  Avg Glucose: None")
            print(f"  Total Insulin: {daily['total_insulin']} U")
            print(f"  Total Carbs: {daily['total_carbs']} g")
        else:
            print("  No daily summary found.")
            
        print("\n[3/3] Testing Weekly Trends...")
        trends = await AnalyticsService.get_weekly_trends(db, patient_id)
        if trends:
            print(f"  Found {len(trends)} days of trends data:")
            for t in trends:
                g_str = f"{t['avg_glucose']:.1f}" if t['avg_glucose'] else "None"
                print(f"    - {t['date']}: Avg {g_str} mg/dL | Ins: {t['total_insulin']} U | Carbs: {t['total_carbs']} g")
        else:
            print("  No trends data found.")

    print("\n--- Analytics Verification Complete ---")

if __name__ == "__main__":
    asyncio.run(test_analytics_engine())
