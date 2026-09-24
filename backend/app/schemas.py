from pydantic import BaseModel, EmailStr
from typing import List, Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    language: Optional[str] = "en"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    token: str
    user: UserResponse

class ZoneBase(BaseModel):
    name: str
    crop: Optional[str] = None
    soil_type: Optional[str] = None
    area: Optional[float] = None
    area_unit: Optional[str] = "acre"

class ZoneCreate(ZoneBase):
    pass

class AnalysisResponse(BaseModel):
    id: str
    type: str
    result: str
    farm_id: Optional[str] = None
    user_id: Optional[str] = None
    zone_id: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ZoneResponse(ZoneBase):
    id: str
    farm_id: Optional[str] = "demo-farm"
    status: str
    last_moisture: Optional[float] = 45.0
    created_at: Optional[datetime] = None
    analyses: List[AnalysisResponse] = []
    class Config:
        from_attributes = True

class FarmBase(BaseModel):
    name: str
    location: Optional[str] = None
    area: Optional[float] = None
    area_unit: Optional[str] = "acre"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    water_availability: Optional[str] = None
    irrigation_method: Optional[str] = None
    farming_type: Optional[str] = None
    is_demo: Optional[bool] = False

class FarmCreate(FarmBase):
    pass

class FarmUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    area: Optional[float] = None
    area_unit: Optional[str] = "acre"
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    water_availability: Optional[str] = None
    irrigation_method: Optional[str] = None
    farming_type: Optional[str] = None

class FarmResponse(FarmBase):
    id: str
    owner_id: str
    created_at: datetime
    zones: List[ZoneResponse] = []
    class Config:
        from_attributes = True

class ImageAnalysisRequest(BaseModel):
    image_base64: str
    mime_type: Optional[str] = "image/jpeg"
    analysis_type: str # soil, plant, production
    zone_id: Optional[str] = None
    farm_id: Optional[str] = None
    language: Optional[str] = "en"

class CropRecommendRequest(BaseModel):
    farm_id: Optional[str] = None
    language: Optional[str] = "en"

class WhatIfRequest(BaseModel):
    farm_id: Optional[str] = None
    scenario: str
    language: Optional[str] = "en"

class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    text: str

class AskRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = []
    language: Optional[str] = "en"
    farm_id: Optional[str] = None
    voice_mode: Optional[bool] = False

class TTSRequest(BaseModel):
    text: str
    voice_id: Optional[str] = None
    language: Optional[str] = "en"
    api_key_override: Optional[str] = None

class VoiceInfo(BaseModel):
    id: str
    name: str
    description: str

class VoiceConfigResponse(BaseModel):
    elevenlabs_configured: bool
    gemini_configured: bool
    default_voice_id: str
    available_voices: List[VoiceInfo]

class IrrigationStartRequest(BaseModel):
    zone_id: str
    duration_minutes: int = 15
    confirmed: bool = True

class IrrigationStopRequest(BaseModel):
    zone_id: Optional[str] = None
    event_id: Optional[str] = None

class ProductionCreateRequest(BaseModel):
    zone_id: Optional[str] = None
    crop: str
    quantity: float
    unit: str = "kg"
    quality: Optional[str] = None
    notes: Optional[str] = None

class DeviceCreateRequest(BaseModel):
    name: str
    device_type: str = "soil_moisture"

class BuyerEnquiryCreate(BaseModel):
    crop: str
    buyer_name: str
    buyer_type: Optional[str] = None
    offered_price: Optional[float] = None
    quantity_kg: Optional[float] = None
    grade: Optional[str] = "Grade A"
    dispatch_date: Optional[str] = None
    farmer_phone: Optional[str] = None
    notes: Optional[str] = None
    farm_id: Optional[str] = None

class BuyerEnquiryResponse(BaseModel):
    id: str
    crop: str
    buyer_name: str
    buyer_type: Optional[str] = None
    offered_price: Optional[float] = None
    quantity_kg: Optional[float] = None
    grade: Optional[str] = None
    dispatch_date: Optional[str] = None
    farmer_phone: Optional[str] = None
    notes: Optional[str] = None
    status: str
    tracking_code: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True
