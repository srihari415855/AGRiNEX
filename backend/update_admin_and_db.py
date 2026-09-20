import os
import sys

# Ensure backend path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import engine, Base, SessionLocal
from app import models, auth

def update_db():
    print("Creating all tables including reports...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if admin@gmail.com exists
        admin_user = db.query(models.User).filter(models.User.email == "admin@gmail.com").first()
        hashed = auth.get_password_hash("Admin@123")
        
        if not admin_user:
            print("Creating new admin user admin@gmail.com...")
            admin_user = models.User(
                email="admin@gmail.com",
                hashed_password=hashed,
                name="Farm Administrator",
                language="en"
            )
            db.add(admin_user)
            db.commit()
            db.refresh(admin_user)
        else:
            print("Updating admin@gmail.com password to Admin@123...")
            admin_user.hashed_password = hashed
            db.commit()

        # Check existing farm for admin or reassign/create Namfarm
        farm = db.query(models.Farm).filter(models.Farm.owner_id == admin_user.id).first()
        if not farm:
            # Check if there is any farm from previous user
            old_farm = db.query(models.Farm).first()
            if old_farm:
                print(f"Reassigning farm {old_farm.name} to admin@gmail.com...")
                old_farm.owner_id = admin_user.id
                farm = old_farm
                db.commit()
            else:
                print("Creating Namfarm for admin@gmail.com...")
                farm = models.Farm(
                    name="Namfarm",
                    location="Bhatkal, Karnataka",
                    area=10.0,
                    area_unit="acre",
                    water_availability="adequate",
                    irrigation_method="drip",
                    farming_type="mixed",
                    owner_id=admin_user.id
                )
                db.add(farm)
                db.commit()
                db.refresh(farm)

        # Check zones for this farm
        zones = db.query(models.Zone).filter(models.Zone.farm_id == farm.id).all()
        if not zones:
            print("Seeding default zones for Namfarm...")
            default_zones = [
                {"name": "Zone 1 - North Orchard", "crop": "Mango (Alphonso)", "soil_type": "Red Sandy Loam", "area": 3.0, "status": "healthy", "last_moisture": 54.0},
                {"name": "Zone 2 - Vegetable Block A", "crop": "Tomato (Hybrid)", "soil_type": "Loamy", "area": 2.5, "status": "healthy", "last_moisture": 52.0},
                {"name": "Zone 3 - South Grain Field", "crop": "Ragi (Finger Millet)", "soil_type": "Red Soil", "area": 2.0, "status": "critical", "last_moisture": 18.4},
                {"name": "Zone 4 - Spice Grove", "crop": "Black Pepper & Cardamom", "soil_type": "Clay Loam", "area": 1.5, "status": "healthy", "last_moisture": 48.0},
                {"name": "Zone 5 - Vegetable Block B", "crop": "Green Chilli", "soil_type": "Sandy Loam", "area": 1.0, "status": "attention", "last_moisture": 32.0}
            ]
            for zd in default_zones:
                z = models.Zone(
                    name=zd["name"],
                    crop=zd["crop"],
                    soil_type=zd["soil_type"],
                    area=zd["area"],
                    status=zd["status"],
                    last_moisture=zd["last_moisture"],
                    farm_id=farm.id
                )
                db.add(z)
            db.commit()

        # Seed initial sample reports so the DB immediately has ready-to-view reports
        sample_reports = db.query(models.Report).filter(models.Report.user_id == admin_user.id).all()
        if not sample_reports:
            print("Seeding initial farm audit and analytics reports...")
            r1 = models.Report(
                title=f"{farm.name} Comprehensive Farm Operating Audit",
                report_type="farm_audit",
                farm_id=farm.id,
                user_id=admin_user.id,
                summary_text="Complete operational audit of Namfarm including zone health, irrigation schedule, and soil assessments.",
                data={
                    "farm_name": farm.name,
                    "location": farm.location,
                    "total_area": f"{farm.area} {farm.area_unit}",
                    "zones_count": 5,
                    "soil_health": "Good (pH 6.5, NPK balanced)",
                    "irrigation_efficiency": "88.4%",
                    "recommendations": [
                        "Zone 3 (Ragi) urgently requires scheduled irrigation.",
                        "Apply 4 tonnes/acre Farmyard Manure to Vegetable Block A before next cycle.",
                        "Clear drainage furrows prior to forecasted weekend rainfall."
                    ]
                }
            )
            r2 = models.Report(
                title=f"{farm.name} Longitudinal Telemetry & Resource Efficiency Analytics",
                report_type="analytics",
                farm_id=farm.id,
                user_id=admin_user.id,
                summary_text="Resource utilization analytics: 14% water reduction achieved with drip automation.",
                data={
                    "vigor_index": 92,
                    "water_efficiency": 88.4,
                    "yield_projection_delta": 18.5,
                    "estimated_yield_tonnes": 8.4,
                    "water_saved_liters": 128000,
                    "zones_overview": [
                        {"zone": "Zone 1 - North Orchard", "vigor": "94%", "water_status": "Optimal"},
                        {"zone": "Zone 2 - Vegetable Block A", "vigor": "91%", "water_status": "Optimal"},
                        {"zone": "Zone 3 - South Grain Field", "vigor": "72%", "water_status": "Moisture Deficit"},
                        {"zone": "Zone 4 - Spice Grove", "vigor": "95%", "water_status": "Optimal"},
                        {"zone": "Zone 5 - Vegetable Block B", "vigor": "86%", "water_status": "Moderate"}
                    ]
                }
            )
            db.add(r1)
            db.add(r2)
            db.commit()

        print("Database successfully updated with admin@gmail.com and initial reports!")
    finally:
        db.close()

if __name__ == "__main__":
    update_db()
