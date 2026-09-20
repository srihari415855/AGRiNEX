from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base, SessionLocal
from .routers import auth, farms, zones, ai, data
from . import models, auth as auth_util

# Create database tables
Base.metadata.create_all(bind=engine)

# Seed default test user if needed
def seed_default_user():
    db = SessionLocal()
    try:
        test_email = "shettysapthami15@gmail.com"
        user = db.query(models.User).filter(models.User.email == test_email).first()
        if not user:
            default_user = models.User(
                email=test_email,
                hashed_password=auth_util.get_password_hash("Agrinex@2026"),
                name="Sapthami Shetty",
                language="en"
            )
            db.add(default_user)
            db.commit()
            db.refresh(default_user)
            
            # Create a sample farm for the default user
            sample_farm = models.Farm(
                name="Namfarm",
                location="Bhatkal",
                area=2.0,
                area_unit="acre",
                latitude=13.987,
                longitude=74.556,
                water_availability="Borewell",
                irrigation_method="Drip",
                farming_type="Horticulture",
                owner_id=default_user.id
            )
            db.add(sample_farm)
            db.commit()
            db.refresh(sample_farm)
            
            # Add zone 1
            z1 = models.Zone(
                name="Zone 1",
                crop="Tomato",
                soil_type="Red loam",
                area=1.0,
                area_unit="acre",
                status="healthy",
                last_moisture=50.6,
                farm_id=sample_farm.id
            )
            db.add(z1)
            db.commit()
    except Exception as e:
        print("Error seeding default user:", e)
    finally:
        db.close()

seed_default_user()

app = FastAPI(title="AGRiNEX Farm Intelligence API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition", "Content-Type", "Content-Length"],
)

# Mount routes under /api (matching extracted frontend api.js baseURL)
api_router = FastAPI()
api_router.include_router(auth.router)
api_router.include_router(farms.router)
api_router.include_router(zones.router)
api_router.include_router(ai.router)
api_router.include_router(data.router)

app.mount("/api", api_router)

# Also include directly at root for convenience
app.include_router(auth.router)
app.include_router(farms.router)
app.include_router(zones.router)
app.include_router(ai.router)
app.include_router(data.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to AGRiNEX Farm Intelligence API", "status": "online"}
