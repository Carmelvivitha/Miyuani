from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import List
from datetime import datetime
import numpy as np

from database import get_db
from db_models import SatellitePass, PestAlert, EdgeNode, ModelMetrics, User, PestSeverity
from models import DashboardData, Stats
from auth import get_current_user

# Deep Tech Services
from services.stari_model import stari_engine
from services.edge_sentinel import edge_sentinel

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"]
)


@router.get("/data", response_model=DashboardData)
async def get_dashboard_data(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Aggregated endpoint to get all dashboard data
    Requires authentication
    """
    # Get stats
    passes_count = await db.scalar(select(func.count(SatellitePass.id)))
    alerts_count = await db.scalar(select(func.count(PestAlert.id)))
    critical_count = await db.scalar(
        select(func.count(PestAlert.id)).where(PestAlert.severity == PestSeverity.HIGH)
    )
    
    # Get satellite passes
    passes_result = await db.execute(select(SatellitePass).limit(10))
    passes = passes_result.scalars().all()
    
    # Get pest alerts
    alerts_result = await db.execute(select(PestAlert).limit(50))
    alerts = alerts_result.scalars().all()
    
    # Get edge nodes - Fused with real-time service
    # We combine DB registered nodes with live telemetry from EdgeSentinel service
    live_nodes = edge_sentinel.get_swarm_status()
    
    # Get latest model metrics
    metrics_result = await db.execute(
        select(ModelMetrics).order_by(ModelMetrics.recorded_at.desc()).limit(1)
    )
    metrics = metrics_result.scalar_one_or_none()
    
    # Build stats
    stats = Stats(
        active_passes=passes_count or 0,
        pest_alerts=alerts_count or 0,
        critical_regions=critical_count or 0,
        analyzed_area_ha=850.7,  # Could be calculated from actual data
        analyzed_area_growth=12.5,
        active_models=3,
        model_names=["STARI-PDE", "CNN-LSTM", "EdgeFusion"] # Updated model names
    )
    
    # Convert passes to response format
    passes_data = []
    for p in passes:
        # Helper to convert GeoJSON to Pydantic model
        points = []
        if isinstance(p.coverage_area, dict) and "coordinates" in p.coverage_area:
            # Assuming Polygon with single ring: [[[lng, lat], ...]]
            coords = p.coverage_area["coordinates"][0]
            points = [{"lat": c[1], "lng": c[0]} for c in coords]
            
        passes_data.append({
            "id": str(p.id),
            "satellite_name": p.satellite_name,
            "pass_time": p.pass_time.isoformat(),
            "coverage_area": points,
            "status": p.status.value
        })
    
    # Convert alerts to response format
    alerts_data = [
        {
            "id": str(a.id),
            "severity": a.severity.value,
            "pest_type": a.pest_type,
            "location": {"lat": a.location_lat, "lng": a.location_lng},
            "affected_area_ha": a.affected_area_ha,
            "timestamp": a.timestamp.isoformat(),
            "confidence": a.confidence
        }
        for a in alerts
    ]
    
    # Convert nodes to response format - Use live service data structure
    nodes_data = [
        {
            "id": n.get("id", "unknown"),
            "status": n.get("status", "Offline"),
            "power_consumption_w": 0.42, # Mock live value
            "lora_range_km": 3.5,
            "location": {"lat": n.get("lat", 0), "lng": n.get("lng", 0)},
            "last_ping": datetime.utcnow().isoformat()
        }
        for n in live_nodes
    ]
    
    # Convert metrics to response format
    metrics_data = {
        "cnn_lstm_precision": metrics.cnn_lstm_precision if metrics else 0.88, # Updated target from paper
        "cnn_lstm_f1": metrics.cnn_lstm_f1 if metrics else 0.85,
        "stari_rmse": metrics.stari_rmse if metrics else 0.18, # Updated target < 0.20
        "last_training": metrics.last_training.isoformat() if metrics else datetime.utcnow().isoformat()
    }
    
    return {
        "stats": stats,
        "passes": passes_data,
        "alerts": alerts_data,
        "edge_nodes": nodes_data,
        "model_metrics": metrics_data
    }

@router.get("/stari-forecast")
async def get_stari_forecast(
    current_user: User = Depends(get_current_user)
):
    """
    Get 7-day forecast from STARI Physics-Informed AI Model
    """
    # 1. Get real-time data fusion
    weather = edge_sentinel.get_aggregated_weather()
    
    # 2. Mock satellite vegetation index (NDVI) for a 20x20 grid
    # In production this comes from Bhuvan/Sentinel-2
    veg_map = np.random.rand(100, 100) * 0.8 + 0.2 # Dense vegetation (0.2-1.0)
    
    # 3. Define an initial outbreak cluster
    outbreaks = [{"x": 10, "y": 10, "intensity": 0.9}]
    
    # 4. Run STARI Simulation
    forecast = await stari_engine.run_simulation(
        initial_outbreaks=outbreaks,
        wind_vector=(1.5, 0.5), # NE wind
        vegetation_index_map=veg_map,
        iot_data=weather,
        days=7
    )
    
    return forecast


@router.get("/stats", response_model=Stats)
async def get_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get dashboard statistics"""
    passes_count = await db.scalar(select(func.count(SatellitePass.id)))
    alerts_count = await db.scalar(select(func.count(PestAlert.id)))
    critical_count = await db.scalar(
        select(func.count(PestAlert.id)).where(PestAlert.severity == PestSeverity.HIGH)
    )
    
    return Stats(
        active_passes=passes_count or 0,
        pest_alerts=alerts_count or 0,
        critical_regions=critical_count or 0,
        analyzed_area_ha=850.7,
        analyzed_area_growth=12.5,
        active_models=3,
        model_names=["NDVI", "CNN-Pest", "SWI"]
    )

