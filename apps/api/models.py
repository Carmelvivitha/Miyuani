from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Stats(BaseModel):
    active_passes: int
    pest_alerts: int
    critical_regions: int
    analyzed_area_ha: float
    analyzed_area_growth: float
    active_models: int
    model_names: List[str]

class GeoPoint(BaseModel):
    lat: float
    lng: float

class SatellitePass(BaseModel):
    id: str
    satellite_name: str
    pass_time: datetime
    coverage_area: List[GeoPoint]
    status: str  # e.g., "Active", "Completed", "Scheduled"

class PestAlert(BaseModel):
    id: str
    severity: str  # "High", "Medium", "Low"
    pest_type: str
    location: GeoPoint
    affected_area_ha: float
    timestamp: datetime
    confidence: float

class EdgeNode(BaseModel):
    id: str
    status: str # "Online", "Offline"
    power_consumption_w: float
    lora_range_km: float
    location: GeoPoint
    last_ping: datetime

class ModelMetrics(BaseModel):
    cnn_lstm_precision: float
    cnn_lstm_f1: float
    stari_rmse: float
    last_training: datetime

class DashboardData(BaseModel):
    stats: Stats
    passes: List[SatellitePass]
    alerts: List[PestAlert]
    edge_nodes: List[EdgeNode]
    model_metrics: ModelMetrics
