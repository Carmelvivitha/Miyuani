"""
EdgeSentinel IoT Service
Handles data fusion from ground-based IoT nodes (EdgeSentinel units).
Simulates LoRa gateway ingestion and data processing.
"""

from typing import Dict, List
from datetime import datetime
import random

class EdgeSentinelService:
    def __init__(self):
        self.nodes = {} # simulated in-memory store for active nodes
        
    def register_node(self, node_id: str, location: Dict[str, float]):
        """Register a new EdgeSentinel node"""
        self.nodes[node_id] = {
            "id": node_id,
            "location": location,
            "status": "Online",
            "last_ping": datetime.utcnow()
        }
        
    def ingest_telemetry(self, node_id: str, telemetry: Dict):
        """Process incoming LoRa packet"""
        if node_id in self.nodes:
            self.nodes[node_id]["last_data"] = telemetry
            self.nodes[node_id]["last_ping"] = datetime.utcnow()
            return True
        return False
        
    def get_aggregated_weather(self) -> Dict[str, float]:
        """
        Fusion: Aggregate ground truth weather data to calibrate satellite models
        """
        # In a real system, this would average data from nodes in the ROI
        # For prototype, we generate realistic data based on Indian crop zones
        
        # Simulate conditions typical for Rice Blast (High humidity, moderate temp)
        return {
            "temperature": 26.5 + random.uniform(-2, 2),
            "humidity": 82.0 + random.uniform(-5, 5),
            "soil_moisture": 45.0 + random.uniform(-10, 10),
            "leaf_wetness": 0.8  # 0-1 scale
        }
        
    def get_swarm_status(self) -> List[Dict]:
        """Get status of the entire EdgeSentinel swarm"""
        # Return mock data for the dashboard if empty
        if not self.nodes:
            return [
                {"id": "ES-001", "lat": 22.5, "lng": 79.5, "status": "Online", "battery": 85},
                {"id": "ES-002", "lat": 22.8, "lng": 79.2, "status": "Online", "battery": 92},
                {"id": "ES-003", "lat": 22.3, "lng": 79.8, "status": "Online", "battery": 78},
                {"id": "ES-004", "lat": 22.6, "lng": 79.1, "status": "Maintenance", "battery": 15},
                {"id": "ES-005", "lat": 23.0, "lng": 80.0, "status": "Online", "battery": 95}
            ]
        return list(self.nodes.values())

# Singleton instance
edge_sentinel = EdgeSentinelService()
