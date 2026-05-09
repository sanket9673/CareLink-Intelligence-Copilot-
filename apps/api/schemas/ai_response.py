from pydantic import BaseModel
from typing import List

class InsightResponse(BaseModel):
    title: str
    summary: str
    evidence_points: List[str]
    recommendation: str
    disclaimer: str
