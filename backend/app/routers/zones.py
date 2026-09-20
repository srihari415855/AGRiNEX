from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import random

from .. import schemas, models
from ..database import get_db
from .auth import get_current_user

router = APIRouter(tags=["zones"])

DEMO_ZONES_MAP = {
    "demo-z1": {"id": "demo-z1", "farm_id": "demo-farm", "name": "North Field", "crop": "Tomato", "area": 2.0, "area_unit": "acre", "soil_type": "Red loam", "status": "healthy", "last_moisture": 52.3, "created_at": datetime.now(timezone.utc), "analyses": []},
    "demo-z2": {"id": "demo-z2", "farm_id": "demo-farm", "name": "West Field", "crop": "Chilli", "area": 1.5, "area_unit": "acre", "soil_type": "Sandy loam", "status": "attention", "last_moisture": 32.1, "created_at": datetime.now(timezone.utc), "analyses": []},
    "demo-z3": {"id": "demo-z3", "farm_id": "demo-farm", "name": "South Plot", "crop": "Ragi", "area": 1.0, "area_unit": "acre", "soil_type": "Red loam", "status": "critical", "last_moisture": 18.4, "created_at": datetime.now(timezone.utc), "analyses": []},
    "demo-z4": {"id": "demo-z4", "farm_id": "demo-farm", "name": "East Orchard", "crop": "Mango", "area": 3.0, "area_unit": "acre", "soil_type": "Clay loam", "status": "healthy", "last_moisture": 48.0, "created_at": datetime.now(timezone.utc), "analyses": []},
    "demo-z5": {"id": "demo-z5", "farm_id": "demo-farm", "name": "Nursery", "crop": "Mixed seedlings", "area": 0.5, "area_unit": "acre", "soil_type": "Potting mix", "status": "irrigating", "last_moisture": 65.0, "created_at": datetime.now(timezone.utc), "analyses": []}
}

@router.get("/zones/{zone_id}", response_model=schemas.ZoneResponse)
def get_zone(zone_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if zone_id in DEMO_ZONES_MAP:
        return DEMO_ZONES_MAP[zone_id]
    zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    return zone

@router.delete("/zones/{zone_id}")
def delete_zone(zone_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if zone_id in DEMO_ZONES_MAP:
        return {"status": "success", "message": "Demo zone deleted"}
    zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    db.delete(zone)
    db.commit()
    return {"status": "success", "message": "Zone deleted"}

@router.get("/zones/{zone_id}/sensor")
def get_zone_sensor(zone_id: str, db: Session = Depends(get_db)):
    # Return realistic dynamic telemetry
    if zone_id in DEMO_ZONES_MAP:
        base_moist = DEMO_ZONES_MAP[zone_id]["last_moisture"]
        temp = round(random.uniform(26.0, 31.5), 1)
        humidity = round(random.uniform(55.0, 72.0), 1)
        moist = round(max(10.0, min(100.0, base_moist + random.uniform(-0.5, 0.5))), 1)
        return {
            "zone_id": zone_id,
            "moisture_pct": moist,
            "temperature_c": temp,
            "humidity_pct": humidity,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if not zone:
        raise HTTPException(status_code=404, detail="Zone not found")
    
    base_moist = zone.last_moisture or 45.0
    moist = round(max(10.0, min(100.0, base_moist + random.uniform(-1.0, 1.0))), 1)
    temp = round(random.uniform(25.0, 32.0), 1)
    humidity = round(random.uniform(50.0, 75.0), 1)
    
    zone.last_moisture = moist
    if moist < 25.0:
        zone.status = "critical"
    elif moist < 40.0:
        zone.status = "attention"
    elif zone.status != "irrigating":
        zone.status = "healthy"
    db.commit()
    
    return {
        "zone_id": zone_id,
        "moisture_pct": moist,
        "temperature_c": temp,
        "humidity_pct": humidity,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
