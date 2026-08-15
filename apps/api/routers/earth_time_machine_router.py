"""
Earth Time Machine API Router

Provides endpoints for accessing historical satellite imagery
and change detection analytics.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Optional, List
from pydantic import BaseModel, Field
from services.earth_engine_service import EarthEngineService
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/earth-time-machine", tags=["Earth Time Machine"])

# Initialize Earth Engine service (will need credentials)
try:
    ee_service = EarthEngineService()
except Exception as e:
    logger.warning(f"Earth Engine not initialized: {e}")
    ee_service = None


# Request/Response Models
class ImageryRequest(BaseModel):
    year: int = Field(..., ge=1985, le=2025, description="Year (1985-2025)")
    lat: float = Field(..., ge=-90, le=90, description="Latitude")
    lon: float = Field(..., ge=-180, le=180, description="Longitude")
    zoom: int = Field(12, ge=1, le=18, description="Map zoom level")


class ImageryResponse(BaseModel):
    tile_url: str
    year: int
    collection: str
    image_count: int
    bbox: dict


class TimelineResponse(BaseModel):
    timeline: List[dict]
    location: dict
    total_years: int


class ChangeDetectionRequest(BaseModel):
    lat: float
    lon: float
    year_start: int = Field(..., ge=1985, le=2024)
    year_end: int = Field(..., ge=1986, le=2025)
    zoom: int = Field(12, ge=1, le=18)


class ChangeDetectionResponse(BaseModel):
    year_start: int
    year_end: int
    new_urban_area_km2: float
    change_detected: bool


# Endpoints

@router.get("/health")
async def health_check():
    """Check if Earth Engine is initialized"""
    return {
        "status": "ok" if ee_service else "error",
        "earth_engine_initialized": ee_service is not None
    }


@router.post("/imagery", response_model=ImageryResponse)
async def get_imagery_for_year(request: ImageryRequest):
    """
    Get satellite imagery tile URL for specific year and location
    
    Returns tile URL that can be loaded in Leaflet/Cesium/MapLibre
    """
    if not ee_service:
        raise HTTPException(
            status_code=503,
            detail="Earth Engine service not initialized. Please configure credentials."
        )
    
    try:
        # Calculate bounding box from center point and zoom
        bbox = ee_service._calculate_bbox(request.lat, request.lon, request.zoom)
        
        # Get imagery from Earth Engine
        tile_data = ee_service.get_landsat_composite(request.year, bbox)
        
        return ImageryResponse(**tile_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error fetching imagery: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch satellite imagery")


@router.get("/timeline", response_model=TimelineResponse)
async def get_location_timeline(
    lat: float = Query(..., ge=-90, le=90),
    lon: float = Query(..., ge=-180, le=180),
    start_year: int = Query(1985, ge=1985, le=2024),
    end_year: int = Query(2024, ge=1986, le=2025),
    zoom: int = Query(12, ge=1, le=18)
):
    """
    Pre-generate all tile URLs for timeline animation
    
    Returns array of tile URLs for smooth year-by-year scrubbing
    """
    if not ee_service:
        raise HTTPException(
            status_code=503,
            detail="Earth Engine service not initialized"
        )
    
    if start_year >= end_year:
        raise HTTPException(
            status_code=400,
            detail="start_year must be less than end_year"
        )
    
    try:
        timeline = ee_service.get_timeline_tiles(lat, lon, start_year, end_year, zoom)
        
        return TimelineResponse(
            timeline=timeline,
            location={"lat": lat, "lon": lon, "zoom": zoom},
            total_years=len(timeline)
        )
        
    except Exception as e:
        logger.error(f"Error generating timeline: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate timeline")


@router.post("/analyze-change", response_model=ChangeDetectionResponse)
async def analyze_change(request: ChangeDetectionRequest):
    """
    Compute change metrics between two years
    
    Returns:
    - Urban growth area (km²)
    - Whether significant change was detected
    """
    if not ee_service:
        raise HTTPException(
            status_code=503,
            detail="Earth Engine service not initialized"
        )
    
    if request.year_start >= request.year_end:
        raise HTTPException(
            status_code=400,
            detail="year_start must be less than year_end"
        )
    
    try:
        bbox = ee_service._calculate_bbox(request.lat, request.lon, request.zoom)
        metrics = ee_service.detect_urban_growth(
            request.year_start,
            request.year_end,
            bbox
        )
        
        if 'error' in metrics:
            raise HTTPException(status_code=500, detail=metrics['error'])
        
        return ChangeDetectionResponse(**metrics)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error analyzing change: {e}")
        raise HTTPException(status_code=500, detail="Failed to analyze change")


@router.get("/popular-locations")
async def get_popular_locations():
    """
    Get curated list of interesting locations to showcase
    
    These are locations with dramatic visible changes over time
    """
    return {
        "locations": [
            {
                "name": "Dubai, UAE",
                "description": "Desert to megacity transformation",
                "lat": 25.2048,
                "lon": 55.2708,
                "category": "urban_growth",
                "recommended_years": [1990, 2024]
            },
            {
                "name": "Amazon Rainforest, Brazil",
                "description": "Deforestation monitoring",
                "lat": -3.4653,
                "lon": -62.2159,
                "category": "deforestation",
                "recommended_years": [1985, 2024]
            },
            {
                "name": "Las Vegas, Nevada",
                "description": "Urban expansion in desert",
                "lat": 36.1699,
                "lon": -115.1398,
                "category": "urban_growth",
                "recommended_years": [1985, 2024]
            },
            {
                "name": "Aral Sea, Kazakhstan",
                "description": "Disappearing water body",
                "lat": 45.0,
                "lon": 60.0,
                "category": "water_change",
                "recommended_years": [1985, 2024]
            },
            {
                "name": "Shanghai, China",
                "description": "Rapid urbanization",
                "lat": 31.2304,
                "lon": 121.4737,
                "category": "urban_growth",
                "recommended_years": [1990, 2024]
            }
        ]
    }
