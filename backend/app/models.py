from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
import uuid
from .database import Base

def gen_uuid():
    return str(uuid.uuid4())

def get_utc_now():
    return datetime.now(timezone.utc)

class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=gen_uuid, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String, nullable=True)
    language = Column(String, default="en")
    created_at = Column(DateTime, default=get_utc_now)
    
    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    devices = relationship("Device", back_populates="user", cascade="all, delete-orphan")
    productions = relationship("ProductionRecord", back_populates="user", cascade="all, delete-orphan")
    irrigations = relationship("IrrigationEvent", back_populates="user", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="user", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(String, primary_key=True, default=gen_uuid, index=True)
    name = Column(String, index=True)
    location = Column(String, nullable=True)
    area = Column(Float, nullable=True)
    area_unit = Column(String, default="acre")
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    water_availability = Column(String, nullable=True)
    irrigation_method = Column(String, nullable=True)
    farming_type = Column(String, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=get_utc_now)
    
    owner_id = Column(String, ForeignKey("users.id"))
    owner = relationship("User", back_populates="farms")
    zones = relationship("Zone", back_populates="farm", cascade="all, delete-orphan")
    productions = relationship("ProductionRecord", back_populates="farm", cascade="all, delete-orphan")
    reports = relationship("Report", back_populates="farm", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="farm", cascade="all, delete-orphan")

class Zone(Base):
    __tablename__ = "zones"
    
    id = Column(String, primary_key=True, default=gen_uuid, index=True)
    name = Column(String)
    crop = Column(String, nullable=True)
    soil_type = Column(String, nullable=True)
    area = Column(Float, nullable=True)
    area_unit = Column(String, default="acre")
    status = Column(String, default="healthy") # healthy, attention, critical, irrigating, no_data
    last_moisture = Column(Float, default=45.0)
    created_at = Column(DateTime, default=get_utc_now)
    
    farm_id = Column(String, ForeignKey("farms.id"))
    farm = relationship("Farm", back_populates="zones")
    analyses = relationship("Analysis", back_populates="zone", cascade="all, delete-orphan")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(String, primary_key=True, default=gen_uuid, index=True)
    type = Column(String) # soil, plant, production
    result = Column(Text)
    image_base64 = Column(Text, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    
    farm_id = Column(String, ForeignKey("farms.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    zone_id = Column(String, ForeignKey("zones.id"), nullable=True)
    
    farm = relationship("Farm", back_populates="analyses")
    user = relationship("User", back_populates="analyses")
    zone = relationship("Zone", back_populates="analyses")

class IrrigationEvent(Base):
    __tablename__ = "irrigation_events"
    
    id = Column(String, primary_key=True, default=gen_uuid, index=True)
    zone_id = Column(String, index=True)
    duration_minutes = Column(Integer, default=15)
    state = Column(String, default="running") # running, completed
    confirmed = Column(Boolean, default=True)
    created_at = Column(DateTime, default=get_utc_now)
    
    user_id = Column(String, ForeignKey("users.id"))
    user = relationship("User", back_populates="irrigations")

class ProductionRecord(Base):
    __tablename__ = "production_records"
    
    id = Column(String, primary_key=True, default=gen_uuid, index=True)
    crop = Column(String)
    quantity = Column(Float)
    unit = Column(String, default="kg")
    quality = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    zone_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    
    user_id = Column(String, ForeignKey("users.id"))
    user = relationship("User", back_populates="productions")
    farm_id = Column(String, ForeignKey("farms.id"), nullable=True)
    farm = relationship("Farm", back_populates="productions")

class Device(Base):
    __tablename__ = "devices"
    
    id = Column(String, primary_key=True, default=gen_uuid, index=True)
    name = Column(String)
    device_type = Column(String, default="soil_moisture")
    status = Column(String, default="active")
    created_at = Column(DateTime, default=get_utc_now)
    
    user_id = Column(String, ForeignKey("users.id"))
    user = relationship("User", back_populates="devices")

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(String, primary_key=True, default=gen_uuid, index=True)
    title = Column(String, index=True)
    report_type = Column(String, default="farm_audit") # "farm_audit", "analytics"
    summary_text = Column(Text, nullable=True)
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=get_utc_now)
    
    user_id = Column(String, ForeignKey("users.id"))
    user = relationship("User", back_populates="reports")
    farm_id = Column(String, ForeignKey("farms.id"), nullable=True)
    farm = relationship("Farm", back_populates="reports")
