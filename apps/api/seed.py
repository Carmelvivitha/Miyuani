"""
Database seeding script to populate the database with initial data
Run with: python seed.py
"""
import asyncio
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from database import AsyncSessionLocal, init_db
from db_models import (
    User, Organization, SatellitePass, PestAlert, EdgeNode, ModelMetrics,
    UserRole, PestSeverity, SatelliteStatus
)
from auth import get_password_hash


async def seed_database():
    """Seed the database with sample data"""
    print("🌱 Starting database seeding...")
    
    # Initialize database
    await init_db()
    
    async with AsyncSessionLocal() as db:
        try:
            # Create default organization
            print("Creating organizations...")
            org1 = Organization(
                name="Miyuani Research Institute",
                settings={"timezone": "Asia/Kolkata"}
            )
            db.add(org1)
            await db.flush()
            
            # Create users
            print("Creating users...")
            admin_user = User(
                email="admin@miyuani.com",
                username="admin",
                hashed_password=get_password_hash("admin123"),
                full_name="System Administrator",
                role=UserRole.ADMIN,
                organization_id=org1.id,
                is_active=True
            )
            
            analyst_user = User(
                email="analyst@miyuani.com",
                username="analyst",
                hashed_password=get_password_hash("analyst123"),
                full_name="Data Analyst",
                role=UserRole.ANALYST,
                organization_id=org1.id,
                is_active=True
            )
            
            viewer_user = User(
                email="viewer@miyuani.com",
                username="viewer",
                hashed_password=get_password_hash("viewer123"),
                full_name="Guest Viewer",
                role=UserRole.VIEWER,
                organization_id=org1.id,
                is_active=True
            )
            
            db.add_all([admin_user, analyst_user, viewer_user])
            await db.flush()
            
            # Create satellite passes
            print("Creating satellite passes...")
            satellites = [
                {"name": "ISRO Resourcesat-2", "lat": 22.0, "lng": 79.0},
                {"name": "Sentinel-2", "lat": 27.0, "lng": 77.0},
                {"name": "Landsat-9", "lat": 32.0, "lng": 75.0}
            ]
            
            for i, sat_data in enumerate(satellites):
                satellite_pass = SatellitePass(
                    satellite_name=sat_data["name"],
                    pass_time=datetime.utcnow() + timedelta(hours=i),
                    coverage_area=[
                        {"lat": sat_data["lat"] + 1, "lng": sat_data["lng"]},
                        {"lat": sat_data["lat"], "lng": sat_data["lng"] + 1},
                        {"lat": sat_data["lat"] - 1, "lng": sat_data["lng"]},
                        {"lat": sat_data["lat"], "lng": sat_data["lng"] - 1}
                    ],
                    status=SatelliteStatus.ACTIVE,
                    organization_id=org1.id
                )
                db.add(satellite_pass)
            
            # Create pest alerts
            print("Creating pest alerts...")
            pest_data = [
                {"pest": "Locust", "lat": 26.9, "lng": 75.8, "severity": PestSeverity.HIGH},
                {"pest": "Fall Armyworm", "lat": 19.1, "lng": 74.7, "severity": PestSeverity.MEDIUM},
                {"pest": "Stem Borer", "lat": 16.5, "lng": 80.6, "severity": PestSeverity.LOW}
            ]
            
            for pest in pest_data:
                alert = PestAlert(
                    severity=pest["severity"],
                    pest_type=pest["pest"],
                    location_lat=pest["lat"],
                    location_lng=pest["lng"],
                    affected_area_ha=100.0 + (int(pest["severity"] == PestSeverity.HIGH) * 100),
                    confidence=0.85,
                    organization_id=org1.id,
                    description=f"{pest['pest']} outbreak detected in the region"
                )
                db.add(alert)
            
            # Create edge nodes
            print("Creating edge nodes...")
            node_locations = [
                {"lat": 28.61, "lng": 77.20, "name": "Delhi"},
                {"lat": 18.52, "lng": 73.85, "name": "Pune"},
                {"lat": 12.97, "lng": 77.59, "name": "Bangalore"},
                {"lat": 23.02, "lng": 72.57, "name": "Ahmedabad"},
                {"lat": 25.59, "lng": 85.13, "name": "Patna"}
            ]
            
            for i, loc in enumerate(node_locations):
                edge_node = EdgeNode(
                    node_id=f"edge-{i+1}",
                    status="Online",
                    power_consumption_w=0.42,
                    lora_range_km=3.5,
                    location_lat=loc["lat"],
                    location_lng=loc["lng"],
                    organization_id=org1.id
                )
                db.add(edge_node)
            
            # Create model metrics
            print("Creating model metrics...")
            metrics = ModelMetrics(
                cnn_lstm_precision=0.87,
                cnn_lstm_f1=0.83,
                stari_rmse=0.15,
                last_training=datetime.utcnow()
            )
            db.add(metrics)
            
            # Commit all changes
            await db.commit()
            
            print("✅ Database seeded successfully!")
            print("\n📋 Test Credentials:")
            print("  Admin:   admin@miyuani.com / admin123")
            print("  Analyst: analyst@miyuani.com / analyst123")
            print("  Viewer:  viewer@miyuani.com / viewer123")
            
        except Exception as e:
            await db.rollback()
            print(f"❌ Error seeding database: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(seed_database())
