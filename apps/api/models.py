from datetime import datetime
from sqlalchemy import Column, Integer, Float, String, DateTime, Enum
from database import Base
import enum

class EventType(str, enum.Enum):
    MEAL = "meal"
    BOLUS = "bolus"
    SENSOR = "sensor"
    OTHER = "other"

class Patient(Base):
    __tablename__ = "patients"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    last_updated = Column(DateTime, nullable=False, default=datetime.utcnow)

class GlucoseReading(Base):
    __tablename__ = "glucose_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    value = Column(Float, nullable=False)  # mg/dL
    
    def __repr__(self):
        return f"<GlucoseReading(patient_id={self.patient_id}, timestamp={self.timestamp}, value={self.value})>"

class InsulinEvent(Base):
    __tablename__ = "insulin_events"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(String, index=True)
    timestamp = Column(DateTime, nullable=False, index=True)
    event_type = Column(String, nullable=False) # meal, bolus
    units = Column(Float, nullable=True) # insulin units
    carbs = Column(Float, nullable=True) # carb grams
    
    def __repr__(self):
        return f"<InsulinEvent(patient_id={self.patient_id}, timestamp={self.timestamp}, type={self.event_type}, units={self.units})>"
