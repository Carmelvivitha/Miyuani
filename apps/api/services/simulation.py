import random
from datetime import datetime, timedelta
from typing import List
from models import SatellitePass, PestAlert, GeoPoint, Stats, EdgeNode, ModelMetrics

class SimulationEngine:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(SimulationEngine, cls).__new__(cls)
            cls._instance.initialized = False
        return cls._instance

    def __init__(self):
        if self.initialized:
            return
        
        self.passes: List[SatellitePass] = []
        self.alerts: List[PestAlert] = []
        self.edge_nodes: List[EdgeNode] = []
        self.metrics = ModelMetrics(
            cnn_lstm_precision=0.87,
            cnn_lstm_f1=0.83,
            stari_rmse=0.15,
            last_training=datetime.now()
        )
        self.analyzed_area = 850.5
        self.last_update = datetime.now()
        
        self._init_simulation()
        self.initialized = True

    def _init_simulation(self):
        # Initial Satellites
        satellites = ["NOAA-20", "Sentinel-2", "Landsat-9"]
        base_lat = 22.0
        base_lng = 79.0
        
        for i, sat in enumerate(satellites):
            self.passes.append(self._create_satellite_pass(
                f"sat-{i}", sat, 
                base_lat + (i * 5), 
                base_lng - (i * 2)
            ))

        # Initial Pest Alerts - Hardcoded to valid farming regions
        pest_data = [
            {"pest": "Locust", "lat": 26.9, "lng": 75.8}, # Rajasthan (Locust prone)
            {"pest": "Fall Armyworm", "lat": 19.1, "lng": 74.7}, # Maharashtra (Maize/Sugarcane)
            {"pest": "Stem Borer", "lat": 16.5, "lng": 80.6}, # Andhra Pradesh (Rice)
        ]
        
        for i, p in enumerate(pest_data):
            self.alerts.append(self._create_pest_alert(
                f"alert-{i}", p["pest"],
                p["lat"],
                p["lng"]
            ))

        # Initial EdgeSentinel Nodes
        node_locations = [
            {"lat": 28.61, "lng": 77.20}, # Delhi (Hub)
            {"lat": 18.52, "lng": 73.85}, # Pune
            {"lat": 12.97, "lng": 77.59}, # Bangalore
            {"lat": 23.02, "lng": 72.57}, # Ahmedabad
            {"lat": 25.59, "lng": 85.13}, # Patna
        ]
        
        for i, loc in enumerate(node_locations):
            self.edge_nodes.append(EdgeNode(
                id=f"edge-{i+1}",
                status="Online",
                power_consumption_w=random.uniform(0.3, 0.48), # < 0.5 W spec
                lora_range_km=random.uniform(2.1, 5.0), # > 2 km spec
                location=GeoPoint(lat=loc["lat"], lng=loc["lng"]),
                last_ping=datetime.now()
            ))

    def _create_satellite_pass(self, id: str, name: str, lat: float, lng: float) -> SatellitePass:
        # Create a diamond shape polygon
        return SatellitePass(
            id=id,
            satellite_name=name,
            pass_time=datetime.now(),
            coverage_area=[
                GeoPoint(lat=lat + 1, lng=lng),
                GeoPoint(lat=lat, lng=lng + 1),
                GeoPoint(lat=lat - 1, lng=lng),
                GeoPoint(lat=lat, lng=lng - 1),
            ],
            status="Active"
        )

    def _create_pest_alert(self, id: str, pest: str, lat: float, lng: float) -> PestAlert:
        return PestAlert(
            id=id,
            severity="Medium",
            pest_type=pest,
            location=GeoPoint(lat=lat, lng=lng),
            affected_area_ha=random.uniform(50, 150),
            timestamp=datetime.now(),
            confidence=0.85
        )

    def update(self):
        """Advance the simulation"""
        now = datetime.now()
        elapsed = (now - self.last_update).total_seconds()
        
        # Don't update too frequently
        if elapsed < 2:
            return

        # Move Satellites (Orbit Simulation - Moving South-West)
        speed = 0.05 # degrees per update
        for p in self.passes:
            # Update center roughly
            lat_shift = -speed
            lng_shift = -speed * 0.2
            
            new_area = []
            for point in p.coverage_area:
                point.lat += lat_shift
                point.lng += lng_shift
                
                # Wrap around logic (simple)
                if point.lat < 8: point.lat = 35 # Reset to North India
            
            p.pass_time = now

        # Evolve Pests
        for alert in self.alerts:
            # Random fluctuation
            change = random.uniform(-2, 5)
            alert.affected_area_ha = max(0, alert.affected_area_ha + change)
            
            # Severity based on area
            if alert.affected_area_ha > 200:
                alert.severity = "High"
            elif alert.affected_area_ha < 50:
                alert.severity = "Low"
            else:
                alert.severity = "Medium"
        
        # Update Edge Nodes Telemetry
        for node in self.edge_nodes:
            # Fluctuate power slightly, keep strict < 0.5W
            node.power_consumption_w = random.uniform(0.35, 0.49)
            node.last_ping = now

        # Evolve Model Metrics (maintain high precision specs)
        self.metrics.cnn_lstm_precision = 0.85 + random.uniform(0.0, 0.05) # >= 0.85
        self.metrics.cnn_lstm_f1 = 0.80 + random.uniform(0.0, 0.08) # >= 0.80
        self.metrics.stari_rmse = 0.10 + random.uniform(0.0, 0.09) # < 0.20

        # Grow analyzed area
        self.analyzed_area += 0.1

        self.last_update = now

    def get_stats(self) -> Stats:
        self.update() # Trigger update on fetch
        return Stats(
            active_passes=len(self.passes),
            pest_alerts=len(self.alerts),
            critical_regions=sum(1 for a in self.alerts if a.severity == "High"),
            analyzed_area_ha=self.analyzed_area,
            analyzed_area_growth=12.5, # mock daily growth
            active_models=3,
            model_names=["NDVI", "CNN-Pest", "SWI"]
        )

    def get_passes(self) -> List[SatellitePass]:
        self.update()
        return self.passes

    def get_alerts(self) -> List[PestAlert]:
        self.update()
        return self.alerts
    
    def get_edge_nodes(self) -> List[EdgeNode]:
        self.update()
        return self.edge_nodes

    def get_metrics(self) -> ModelMetrics:
        self.update()
        return self.metrics

simulation = SimulationEngine()
