from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from database import get_db
from db_models import SatellitePass, PestAlert, User
from models import SatellitePass as SatellitePassModel, PestAlert as PestAlertModel
from auth import get_current_user

router = APIRouter(
    prefix="/api/map",
    tags=["map"]
)


@router.get("/satellite-passes", response_model=List[SatellitePassModel])
async def get_satellite_passes(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all satellite passes for map visualization"""
    result = await db.execute(select(SatellitePass).limit(50))
    passes = result.scalars().all()
    
    return [
        {
            "id": str(p.id),
            "satellite_name": p.satellite_name,
            "pass_time": p.pass_time.isoformat(),
            "coverage_area": p.coverage_area,
            "status": p.status.value
        }
        for p in passes
    ]


@router.get("/pest-alerts", response_model=List[PestAlertModel])
async def get_pest_alerts(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all pest alerts for map visualization"""
    result = await db.execute(select(PestAlert).limit(100))
    alerts = result.scalars().all()
    
    return [
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

