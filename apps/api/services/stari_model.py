"""
STARI Model (Spatio-Temporal Anisotropic Reaction-Infiltration) Service
Implements the core physics-informed AI framework for Miyuani.

Governing Equation:
∂Ψ/∂t = ∇ · (T(Φ_EO) ∇Ψ - V(W_grid) Ψ) + G(Ψ, Θ_IoT, Φ_EO) + S(x, y, t)

Variables:
- Ψ (Psi): Biotic Stress Potential Field (Risk)
- T(Φ_EO): Diffusion Tensor (anisotropic spread based on satellite veg index)
- V(W_grid): Advection Velocity Field (wind influence)
- G(...): Reaction/Growth term (pest reproduction rate)
"""

import numpy as np
from datetime import datetime
import asyncio
from typing import List, Dict, Tuple

class STARIModel:
    def __init__(self, grid_size: Tuple[int, int] = (100, 100)):
        self.grid_size = grid_size
        self.psi_field = np.zeros(grid_size)  # Initial stress potential is zero
        
    async def run_simulation(
        self, 
        initial_outbreaks: List[Dict], 
        wind_vector: Tuple[float, float],
        vegetation_index_map: np.ndarray,
        iot_data: Dict[str, float],
        days: int = 7
    ) -> Dict[str, any]:
        """
        Run the STARI simulation to forecast stress propagation.
        
        Args:
            initial_outbreaks: List of {x, y, intensity} dicts
            wind_vector: (u, v) wind components in m/s
            vegetation_index_map: 2D numpy array of NDVI/LAI (0.0-1.0)
            iot_data: Dict with 'temperature', 'humidity' from EdgeSentinel
            days: Forecast horizon
            
        Returns:
            Dict containing forecast frames and risk metrics
        """
        # 1. Initialize Field (S term)
        self.psi_field = np.zeros(self.grid_size)
        for outbreak in initial_outbreaks:
            x, y = int(outbreak['x']), int(outbreak['y'])
            if 0 <= x < self.grid_size[0] and 0 <= y < self.grid_size[1]:
                self.psi_field[x, y] = outbreak['intensity']

        # 2. Compute Parameters
        # Growth Rate r(Θ_IoT) - simple epidemiological model based on temp/humidity
        temp = iot_data.get('temperature', 25.0)
        humid = iot_data.get('humidity', 60.0)
        
        # Pest growth optimum (e.g., for fungal blast)
        r_growth = 0.1
        if 20 <= temp <= 30 and humid > 80:
            r_growth = 0.3 # Optimal conditions
        elif temp > 35 or humid < 40:
            r_growth = 0.05 # Inhibited
            
        # Advection (Wind) V(W_grid)
        u, v = wind_vector
        
        # 3. Time Stepping (Finite Difference Method)
        dt = 0.1 # Time step
        steps = int(days / dt)
        
        frames = []
        
        # Simulation Loop
        current_field = self.psi_field.copy()
        
        for step in range(steps):
            # Compute gradients for Diffusion (∇Ψ)
            grad_x = np.gradient(current_field, axis=0)
            grad_y = np.gradient(current_field, axis=1)
            
            # Anisotropic Diffusion Tensor T(Φ_EO)
            # Diffusion is higher in dense vegetation (high NDVI)
            diffusion_coeff = 0.2 * vegetation_index_map
            
            # Diffusion Term: ∇ · (T ∇Ψ)
            diff_term = np.gradient(diffusion_coeff * grad_x, axis=0) + \
                        np.gradient(diffusion_coeff * grad_y, axis=1)
            
            # Advection Term: - ∇ · (V Ψ) - Wind carries the spores
            adv_term = -(u * grad_x + v * grad_y)
            
            # Reaction Term: G(Ψ) = r * Ψ * (1 - Ψ/K) (Logistic growth)
            # Carrying capacity K is proportional to vegetation density
            K = vegetation_index_map + 0.1 
            reaction_term = r_growth * current_field * (1 - current_field / K)
            
            # Update Field
            delta_psi = (diff_term + adv_term + reaction_term) * dt
            current_field += delta_psi
            
            # Clip values to valid range [0, 1]
            current_field = np.clip(current_field, 0, 1)
            
            # Save frame every day (1/dt steps)
            if step % int(1/dt) == 0:
                frames.append(current_field.copy().tolist())
                
        return {
            "forecast_days": days,
            "risk_heatmap": current_field.tolist(),
            "growth_rate": r_growth,
            "max_risk": float(current_field.max()),
            "affected_area_percentage": float(np.mean(current_field > 0.3) * 100)
        }

# Singleton instance for the application
stari_engine = STARIModel()
