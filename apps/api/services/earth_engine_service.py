"""
Google Earth Engine Service for Earth Time Machine

Provides access to Landsat satellite imagery archives (1985-2025)
and change detection algorithms for geospatial analysis.
"""

import ee
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class EarthEngineService:
    """Service for interacting with Google Earth Engine API"""
    
    def __init__(self, credentials_path: Optional[str] = None):
        """
        Initialize Earth Engine with service account credentials
        
        Args:
            credentials_path: Path to service account JSON key file
        """
        try:
            if credentials_path:
                credentials = ee.ServiceAccountCredentials(
                    email=None,  # Will be read from JSON
                    key_file=credentials_path
                )
                ee.Initialize(credentials)
            else:
                # Try to initialize with default credentials
                ee.Initialize()
            
            logger.info("Google Earth Engine initialized successfully")
        except Exception as e:
            logger.error(f"Failed to initialize Earth Engine: {e}")
            raise
    
    def get_landsat_composite(
        self, 
        year: int, 
        bbox: Dict[str, float],
        cloud_threshold: int = 20
    ) -> Dict:
        """
        Get cloud-free Landsat composite for a specific year
        
        Args:
            year: Year (1985-2025)
            bbox: {"west": lon, "south": lat, "east": lon, "north": lat}
            cloud_threshold: Maximum cloud cover percentage
            
        Returns:
            Dictionary with tile_url and metadata
        """
        try:
            # Select appropriate Landsat collection based on year
            collection_id = self._get_landsat_collection(year)
            
            # Define date range
            start_date = f'{year}-01-01'
            end_date = f'{year}-12-31'
            
            # Create geometry from bounding box
            geometry = ee.Geometry.Rectangle([
                bbox['west'], bbox['south'], 
                bbox['east'], bbox['north']
            ])
            
            # Load and filter collection
            collection = ee.ImageCollection(collection_id) \
                .filterDate(start_date, end_date) \
                .filterBounds(geometry) \
                .filter(ee.Filter.lt('CLOUD_COVER', cloud_threshold))
            
            # Get median composite (removes clouds)
            composite = collection.median().clip(geometry)
            
            # Apply visualization parameters for true color
            vis_params = self._get_visualization_params(collection_id)
            
            # Get map tile URL
            map_id = composite.getMapId(vis_params)
            
            return {
                'tile_url': map_id['tile_fetcher'].url_format,
                'year': year,
                'collection': collection_id,
                'image_count': collection.size().getInfo(),
                'bbox': bbox
            }
            
        except Exception as e:
            logger.error(f"Error getting Landsat composite for year {year}: {e}")
            raise
    
    def _get_landsat_collection(self, year: int) -> str:
        """Select appropriate Landsat collection based on year"""
        if year < 1984:
            raise ValueError("Landsat data not available before 1984")
        elif year < 2013:
            return 'LANDSAT/LT05/C02/T1_L2'  # Landsat 5 (1984-2012)
        elif year < 2022:
            return 'LANDSAT/LC08/C02/T1_L2'  # Landsat 8 (2013-2021)
        else:
            return 'LANDSAT/LC09/C02/T1_L2'  # Landsat 9 (2021+)
    
    def _get_visualization_params(self, collection_id: str) -> Dict:
        """Get visualization parameters for true color RGB"""
        if 'LT05' in collection_id or 'LE07' in collection_id:
            # Landsat 5/7
            return {
                'bands': ['SR_B3', 'SR_B2', 'SR_B1'],  # RGB
                'min': 0,
                'max': 3000,
                'gamma': 1.4
            }
        else:
            # Landsat 8/9
            return {
                'bands': ['SR_B4', 'SR_B3', 'SR_B2'],  # RGB
                'min': 0,
                'max': 3000,
                'gamma': 1.4
            }
    
    def get_timeline_tiles(
        self,
        lat: float,
        lon: float,
        start_year: int = 1985,
        end_year: int = 2024,
        zoom: int = 12
    ) -> List[Dict]:
        """
        Pre-generate tile URLs for all years in timeline
        
        Args:
            lat: Latitude of center point
            lon: Longitude of center point
            start_year: Starting year
            end_year: Ending year
            zoom: Map zoom level
            
        Returns:
            List of dictionaries with year and tile_url
        """
        bbox = self._calculate_bbox(lat, lon, zoom)
        timeline = []
        
        for year in range(start_year, end_year + 1):
            try:
                tile_data = self.get_landsat_composite(year, bbox)
                timeline.append({
                    'year': year,
                    'tile_url': tile_data['tile_url'],
                    'image_count': tile_data['image_count']
                })
            except Exception as e:
                logger.warning(f"Failed to get imagery for year {year}: {e}")
                # Continue with other years
                continue
        
        return timeline
    
    def _calculate_bbox(
        self, 
        lat: float, 
        lon: float, 
        zoom: int
    ) -> Dict[str, float]:
        """
        Calculate bounding box from center point and zoom level
        
        Approximate calculation for web mercator
        """
        # Degrees per pixel at this zoom level
        degrees_per_pixel = 360 / (256 * (2 ** zoom))
        
        # Assume 512x512 pixel viewport
        viewport_size = 512
        delta = (viewport_size / 2) * degrees_per_pixel
        
        return {
            'west': lon - delta,
            'south': lat - delta,
            'east': lon + delta,
            'north': lat + delta
        }
    
    def detect_urban_growth(
        self,
        year_start: int,
        year_end: int,
        bbox: Dict[str, float]
    ) -> Dict:
        """
        Detect urban expansion between two years using NDBI
        
        NDBI = (SWIR - NIR) / (SWIR + NIR)
        Higher values indicate built-up areas
        """
        try:
            # Get composites for both years
            start_composite = self._get_composite_for_analysis(year_start, bbox)
            end_composite = self._get_composite_for_analysis(year_end, bbox)
            
            # Calculate NDBI for both years
            ndbi_start = self._calculate_ndbi(start_composite, year_start)
            ndbi_end = self._calculate_ndbi(end_composite, year_end)
            
            # Threshold for urban areas
            urban_threshold = 0.1
            urban_start = ndbi_start.gt(urban_threshold)
            urban_end = ndbi_end.gt(urban_threshold)
            
            # Calculate new urban areas
            new_urban = urban_end.subtract(urban_start).gt(0)
            
            # Calculate area in km²
            geometry = ee.Geometry.Rectangle([
                bbox['west'], bbox['south'], 
                bbox['east'], bbox['north']
            ])
            
            area_stats = new_urban.multiply(ee.Image.pixelArea()).reduceRegion(
                reducer=ee.Reducer.sum(),
                geometry=geometry,
                scale=30,  # 30m Landsat resolution
                maxPixels=1e9
            )
            
            new_urban_area_km2 = area_stats.getInfo().get('nd', 0) / 1e6
            
            return {
                'year_start': year_start,
                'year_end': year_end,
                'new_urban_area_km2': round(new_urban_area_km2, 2),
                'change_detected': new_urban_area_km2 > 0
            }
            
        except Exception as e:
            logger.error(f"Error detecting urban growth: {e}")
            return {
                'error': str(e),
                'year_start': year_start,
                'year_end': year_end
            }
    
    def _get_composite_for_analysis(self, year: int, bbox: Dict) -> ee.Image:
        """Get Landsat composite for analysis (not visualization)"""
        collection_id = self._get_landsat_collection(year)
        geometry = ee.Geometry.Rectangle([
            bbox['west'], bbox['south'], 
            bbox['east'], bbox['north']
        ])
        
        collection = ee.ImageCollection(collection_id) \
            .filterDate(f'{year}-01-01', f'{year}-12-31') \
            .filterBounds(geometry) \
            .filter(ee.Filter.lt('CLOUD_COVER', 20))
        
        return collection.median().clip(geometry)
    
    def _calculate_ndbi(self, image: ee.Image, year: int) -> ee.Image:
        """Calculate Normalized Difference Built-up Index"""
        collection_id = self._get_landsat_collection(year)
        
        if 'LT05' in collection_id or 'LE07' in collection_id:
            # Landsat 5/7: SWIR1=B5, NIR=B4
            return image.normalizedDifference(['SR_B5', 'SR_B4'])
        else:
            # Landsat 8/9: SWIR1=B6, NIR=B5
            return image.normalizedDifference(['SR_B6', 'SR_B5'])
