from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from .. import schemas, models
from ..database import get_db
from .auth import get_current_user

router = APIRouter(tags=["farms"])

DEMO_FARM_DATA = {
    "id": "demo-farm",
    "name": "AGRiNEX Demo Farm",
    "location": "Kolar, Karnataka",
    "area": 8.0,
    "area_unit": "acre",
    "latitude": 13.1373,
    "longitude": 78.1298,
    "water_availability": "Borewell + Tank",
    "irrigation_method": "Drip + Sprinkler",
    "farming_type": "Mixed horticulture",
    "is_demo": True,
    "zones": [
        {"id": "demo-z1", "name": "North Field", "crop": "Tomato", "area": 2.0, "area_unit": "acre", "soil_type": "Red loam", "status": "healthy", "last_moisture": 52.3},
        {"id": "demo-z2", "name": "West Field", "crop": "Chilli", "area": 1.5, "area_unit": "acre", "soil_type": "Sandy loam", "status": "attention", "last_moisture": 32.1},
        {"id": "demo-z3", "name": "South Plot", "crop": "Ragi", "area": 1.0, "area_unit": "acre", "soil_type": "Red loam", "status": "critical", "last_moisture": 18.4},
        {"id": "demo-z4", "name": "East Orchard", "crop": "Mango", "area": 3.0, "area_unit": "acre", "soil_type": "Clay loam", "status": "healthy", "last_moisture": 48.0},
        {"id": "demo-z5", "name": "Nursery", "crop": "Mixed seedlings", "area": 0.5, "area_unit": "acre", "soil_type": "Potting mix", "status": "irrigating", "last_moisture": 65.0}
    ]
}

KNOWN_LOCATIONS = {
    "bhatkal": (13.9870, 74.5560),
    "kolar": (13.1373, 78.1298),
    "bengaluru": (12.9716, 77.5946),
    "bangalore": (12.9716, 77.5946),
    "mysuru": (12.2958, 76.6394),
    "mysore": (12.2958, 76.6394),
    "shimoga": (13.9299, 75.5681),
    "shivamogga": (13.9299, 75.5681),
    "udupi": (13.3409, 74.7421),
    "mangalore": (12.9141, 74.8560),
    "mangaluru": (12.9141, 74.8560),
    "hubballi": (15.3647, 75.1240),
    "hubli": (15.3647, 75.1240),
    "dharwad": (15.4589, 75.0078),
    "belagavi": (15.8497, 74.4977),
    "belgaum": (15.8497, 74.4977),
    "mandya": (12.5242, 76.8958),
    "hassan": (13.0072, 76.1030),
    "tumakuru": (13.3422, 77.1017),
    "tumkur": (13.3422, 77.1017),
    "chikkamagaluru": (13.3161, 75.7720),
    "davangere": (14.4644, 75.9218),
    "ballari": (15.1394, 76.9214),
    "bellary": (15.1394, 76.9214),
    "guntur": (16.3067, 80.4365),
    "chittoor": (13.2172, 79.1003),
    "chennai": (13.0827, 80.2707),
    "pune": (18.5204, 73.8567),
    "coimbatore": (11.0168, 76.9558),
    "nashik": (19.9975, 73.7898),
    "punjab": (30.9010, 75.8573),
    "ludhiana": (30.9010, 75.8573),
    "amritsar": (31.6340, 74.8723),
    "bathinda": (30.2110, 74.9455),
    "jalandhar": (31.3260, 75.5762),
    "patiala": (30.3398, 76.3869),
    "haryana": (29.0588, 76.0856),
    "karnal": (29.6857, 76.9905),
    "hisar": (29.1492, 75.7217),
    "delhi": (28.7041, 77.1025),
    "new delhi": (28.6139, 77.2090),
    "hyderabad": (17.3850, 78.4867),
    "vijayawada": (16.5062, 80.6480),
    "kurnool": (15.8281, 78.0373),
    "warangal": (17.9689, 79.5941),
    "nagpur": (21.1458, 79.0882),
    "kolhapur": (16.7050, 74.2433),
    "solapur": (17.6599, 75.9064),
    "sangli": (16.8524, 74.5815),
    "satara": (17.6805, 74.0183),
    "aurangabad": (19.8762, 75.3433),
    "chhatrapati sambhajinagar": (19.8762, 75.3433),
    "ahmednagar": (19.0948, 74.7480),
    "jalgaon": (21.0077, 75.5626),
    "jaipur": (26.9124, 75.7873),
    "jodhpur": (26.2389, 73.0243),
    "kota": (25.2138, 75.8648),
    "udaipur": (24.5854, 73.7125),
    "ahmedabad": (23.0225, 72.5714),
    "surat": (21.1702, 72.8311),
    "vadodara": (22.3072, 73.1812),
    "rajkot": (22.3039, 70.8022),
    "anand": (22.5645, 72.9289),
    "lucknow": (26.8467, 80.9462),
    "varanasi": (25.3176, 82.9739),
    "kanpur": (26.4499, 80.3319),
    "agra": (27.1767, 78.0081),
    "bhopal": (23.2599, 77.4126),
    "indore": (22.7196, 75.8577),
    "patna": (25.5941, 85.1376),
    "kolkata": (22.5726, 88.3639),
    "kochi": (9.9312, 76.2673),
    "wayanad": (11.6854, 76.1320),
    "palakkad": (10.7867, 76.6548),
}

import requests

def resolve_location_coordinates(location_str: str) -> tuple:
    if not location_str or not location_str.strip():
        return (13.9870, 74.5560)
    
    loc_clean = location_str.strip()
    # Check if raw "lat, lon" was typed
    if "," in loc_clean:
        parts = loc_clean.split(",")
        if len(parts) == 2:
            try:
                lat = float(parts[0].strip())
                lon = float(parts[1].strip())
                if -90 <= lat <= 90 and -180 <= lon <= 180:
                    return (round(lat, 4), round(lon, 4))
            except ValueError:
                pass

    loc_lower = loc_clean.lower()
    for key, coords in KNOWN_LOCATIONS.items():
        if key in loc_lower:
            return coords

    # Fallback to online geocoding
    try:
        url = f"https://geocoding-api.open-meteo.com/v1/search?name={requests.utils.quote(loc_clean)}&count=1&language=en&format=json"
        res = requests.get(url, timeout=2.0)
        if res.status_code == 200:
            data = res.json()
            if "results" in data and len(data["results"]) > 0:
                first = data["results"][0]
                return (round(float(first["latitude"]), 4), round(float(first["longitude"]), 4))
    except Exception:
        pass

    return (13.9870, 74.5560)

@router.get("/demo/farm")
def get_demo_farm():
    return DEMO_FARM_DATA

@router.get("/farms", response_model=List[schemas.FarmResponse])
def get_farms(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    farms = db.query(models.Farm).filter(models.Farm.owner_id == current_user.id).all()
    return farms

@router.post("/farms", response_model=schemas.FarmResponse)
def create_farm(farm_data: schemas.FarmCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    lat = farm_data.latitude
    lon = farm_data.longitude
    if not lat or not lon or lat == 0.0:
        lat, lon = resolve_location_coordinates(farm_data.location or "")
        
    farm = models.Farm(
        name=farm_data.name,
        location=farm_data.location,
        area=farm_data.area or 5.0,
        area_unit=farm_data.area_unit or "acre",
        latitude=lat,
        longitude=lon,
        water_availability=farm_data.water_availability or "Adequate",
        irrigation_method=farm_data.irrigation_method or "Drip",
        farming_type=farm_data.farming_type or "Mixed horticulture",
        owner_id=current_user.id
    )
    db.add(farm)
    db.commit()
    db.refresh(farm)
    
    # Auto-seed initial default zone
    z1 = models.Zone(
        name="Zone 1 - Main Cultivation Plot",
        crop="Tomato (Arka Rakshak)",
        soil_type="Red Sandy Loam",
        area=min(farm.area or 2.0, 2.5),
        area_unit="acre",
        status="healthy",
        last_moisture=52.0,
        farm_id=farm.id
    )
    db.add(z1)
    db.commit()
    db.refresh(farm)
    return farm

@router.put("/farms/{farm_id}", response_model=schemas.FarmResponse)
def update_farm(farm_id: str, farm_update: schemas.FarmUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.owner_id == current_user.id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found or unauthorized")
        
    if farm_update.name is not None:
        farm.name = farm_update.name
    if farm_update.area is not None:
        farm.area = farm_update.area
    if farm_update.area_unit is not None:
        farm.area_unit = farm_update.area_unit
    if farm_update.water_availability is not None:
        farm.water_availability = farm_update.water_availability
    if farm_update.irrigation_method is not None:
        farm.irrigation_method = farm_update.irrigation_method
    if farm_update.farming_type is not None:
        farm.farming_type = farm_update.farming_type

    if farm_update.location is not None:
        farm.location = farm_update.location
        if farm_update.latitude and farm_update.longitude:
            farm.latitude = farm_update.latitude
            farm.longitude = farm_update.longitude
        else:
            # Re-resolve coordinates for updated location
            lat, lon = resolve_location_coordinates(farm_update.location)
            farm.latitude = lat
            farm.longitude = lon

    db.commit()
    db.refresh(farm)
    return farm

@router.get("/farms/{farm_id}", response_model=schemas.FarmResponse)
def get_farm(farm_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if farm_id == "demo-farm":
        return DEMO_FARM_DATA
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id).first()
    if not farm:
        raise HTTPException(status_code=404, detail="Farm not found")
    return farm

@router.get("/farms/{farm_id}/zones", response_model=List[schemas.ZoneResponse])
def get_farm_zones(farm_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if farm_id == "demo-farm":
        return DEMO_FARM_DATA["zones"]
    zones = db.query(models.Zone).filter(models.Zone.farm_id == farm_id).all()
    return zones

@router.post("/farms/{farm_id}/zones", response_model=schemas.ZoneResponse)
def create_farm_zone(farm_id: str, zone_data: schemas.ZoneCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    farm = db.query(models.Farm).filter(models.Farm.id == farm_id).first()
    if not farm and farm_id != "demo-farm":
        raise HTTPException(status_code=404, detail="Farm not found")
    
    zone = models.Zone(
        name=zone_data.name,
        crop=zone_data.crop,
        soil_type=zone_data.soil_type,
        area=zone_data.area,
        area_unit=zone_data.area_unit or "acre",
        status="healthy",
        last_moisture=50.0,
        farm_id=farm_id
    )
    db.add(zone)
    db.commit()
    db.refresh(zone)
    return zone
