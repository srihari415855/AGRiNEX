from sqlalchemy.orm import Session
from . import models, schemas, auth

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        preferred_language=user.preferred_language
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_farms(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Farm).filter(models.Farm.owner_id == user_id).offset(skip).limit(limit).all()

def get_farm(db: Session, farm_id: int, user_id: int):
    return db.query(models.Farm).filter(models.Farm.id == farm_id, models.Farm.owner_id == user_id).first()

def create_user_farm(db: Session, farm: schemas.FarmCreate, user_id: int):
    db_farm = models.Farm(**farm.dict(), owner_id=user_id)
    db.add(db_farm)
    db.commit()
    db.refresh(db_farm)
    return db_farm

def get_zones(db: Session, farm_id: int):
    return db.query(models.Zone).filter(models.Zone.farm_id == farm_id).all()

def create_farm_zone(db: Session, zone: schemas.ZoneCreate, farm_id: int):
    db_zone = models.Zone(**zone.dict(), farm_id=farm_id)
    db.add(db_zone)
    db.commit()
    db.refresh(db_zone)
    return db_zone

def delete_zone(db: Session, zone_id: int):
    db_zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if db_zone:
        db.delete(db_zone)
        db.commit()
    return db_zone

def update_zone(db: Session, zone_id: int, zone: schemas.ZoneUpdate):
    db_zone = db.query(models.Zone).filter(models.Zone.id == zone_id).first()
    if db_zone:
        update_data = zone.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_zone, key, value)
        db.commit()
        db.refresh(db_zone)
    return db_zone
