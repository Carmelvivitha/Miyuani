"""
Simple database initialization script with synthetic data generation
"""
import asyncio
import random
from datetime import datetime, timedelta
import json
from sqlalchemy import text, select
from database import AsyncSessionLocal, init_db
from db_models import User, Organization, SatellitePass, PestAlert, EdgeNode, ModelMetrics, UserRole, SatelliteStatus, PestSeverity

async def quick_seed():
    """Quick seed with pre-hashed passwords and synthetic data"""
    print("🌱 Initializing database...")
    
    await init_db()
    
    async with AsyncSessionLocal() as db:
        try:
            # 1. Create Organization
            print("  - Creating Organization...")
            org = await db.execute(select(Organization).where(Organization.id == 1))
            if not org.scalar_one_or_none():
                db.add(Organization(
                    id=1, 
                    name='Miyuani Research Institute', 
                    created_at=datetime.utcnow(), 
                    settings={}
                ))
                await db.flush()

            # 2. Create Admin User
            print("  - Creating Admin User...")
            user = await db.execute(select(User).where(User.email == 'admin@miyuani.com'))
            if not user.scalar_one_or_none():
                # Password: admin123
                hashed_pwd = '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5eSy.lB3bYaVe'
                db.add(User(
                    email='admin@miyuani.com',
                    username='admin',
                    hashed_password=hashed_pwd,
                    full_name='System Administrator',
                    role=UserRole.ADMIN,
                    organization_id=1,
                    is_active=True,
                    created_at=datetime.utcnow()
                ))

            # 3. Create Satellite Passes
            print("  - Creating Satellite Passes...")
            # Clear existing to avoid duplicates if re-seeding
            await db.execute(text("DELETE FROM satellite_passes"))
            
            satellites = ["Sentinel-2A", "Landsat-9", "Sentinel-1B", "EOS-04 (RISAT-1A)"]
            statuses = [SatelliteStatus.COMPLETED, SatelliteStatus.SCHEDULED, SatelliteStatus.ACTIVE]
            
            for i in range(10):
                pass_time = datetime.utcnow() + timedelta(minutes=random.randint(-120, 360))
                db.add(SatellitePass(
                    satellite_name=random.choice(satellites),
                    pass_time=pass_time,
                    coverage_area={"type": "Polygon", "coordinates": [[[75, 20], [76, 20], [76, 21], [75, 21], [75, 20]]]},
                    status=statuses[i % 3],
                    organization_id=1
                ))

            # 4. Create Pest Alerts
            print("  - Creating Pest Alerts...")
            await db.execute(text("DELETE FROM pest_alerts"))
            
            pests = ["Fall Armyworm", "Pink Bollworm", "Locust", "Stem Borer"]
            severities = [PestSeverity.LOW, PestSeverity.MEDIUM, PestSeverity.HIGH]
            
            for i in range(25):
                db.add(PestAlert(
                    severity=random.choice(severities),
                    pest_type=random.choice(pests),
                    location_lat=20.5937 + random.uniform(-0.5, 0.5),
                    location_lng=78.9629 + random.uniform(-0.5, 0.5),
                    affected_area_ha=round(random.uniform(5.0, 150.0), 2),
                    confidence=round(random.uniform(0.75, 0.99), 2),
                    timestamp=datetime.utcnow() - timedelta(hours=random.randint(0, 48)),
                    organization_id=1,
                    description=f"Detected high probability swarm activity in Sector {i+1}"
                ))

            # 5. Create Edge Nodes
            print("  - Creating Edge Nodes...")
            await db.execute(text("DELETE FROM edge_nodes"))
            
            for i in range(5):
                db.add(EdgeNode(
                    node_id=f"EDGE-SN-{100+i}",
                    status="Online" if i < 4 else "Offline",
                    power_consumption_w=round(random.uniform(0.3, 0.8), 2),
                    lora_range_km=round(random.uniform(2.0, 5.0), 1),
                    location_lat=20.6 + random.uniform(-0.1, 0.1),
                    location_lng=79.0 + random.uniform(-0.1, 0.1),
                    last_ping=datetime.utcnow(),
                    organization_id=1
                ))

            # 6. Create Model Metrics
            print("  - Creating Model Metrics...")
            await db.execute(text("DELETE FROM model_metrics"))
            
            db.add(ModelMetrics(
                cnn_lstm_precision=0.92,
                cnn_lstm_f1=0.89,
                stari_rmse=0.15,
                last_training=datetime.utcnow() - timedelta(hours=4),
                recorded_at=datetime.utcnow()
            ))

            await db.commit()
            print("✅ Database seeded successfully with synthetic data!")
            print("\n📋 Login info (if needed):")
            print("  Email: admin@miyuani.com")
            print("  Password: admin123")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error: {e}")
            raise

if __name__ == "__main__":
    asyncio.run(quick_seed())
