from pydantic import BaseModel, Field
from typing import List, Optional

class ChatMessageSchema(BaseModel):
    role: str
    content: str

class InsightRequest(BaseModel):
    patient_id: str
    persona: str = Field(default="patient")
    history: List[ChatMessageSchema] = Field(default_factory=list)

class InsightResponse(BaseModel):
    title: str
    summary: str
    evidence_points: List[str]
    recommendation: str
    disclaimer: str
