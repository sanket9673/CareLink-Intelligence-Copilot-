from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, Literal

class CareLinkRowSchema(BaseModel):
    """
    Pydantic schema for validating a single row from the CareLink CSV.
    """
    timestamp: datetime
    glucose_level: float = Field(..., ge=0)
    event_type: Literal['meal', 'bolus', 'sensor', 'other']
    value: float = Field(..., ge=0)

class CareLinkRecordSchema(BaseModel):
    """
    Matches the shared TypeScript CareLinkRecord interface.
    """
    timestamp: datetime
    glucose_mgdl: Optional[float] = None
    insulin_units: Optional[float] = None
    carb_grams: Optional[float] = None
    event_type: Literal['meal', 'bolus', 'sensor', 'other']

    class Config:
        from_attributes = True
