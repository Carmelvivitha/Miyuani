
export const API_BASE_URL = "http://localhost:8000";

export interface GeoPoint {
    lat: number;
    lng: number;
}

export interface SatellitePass {
    id: string;
    satellite_name: string;
    pass_time: string; // ISO string
    coverage_area: GeoPoint[];
    status: string;
}

export interface PestAlert {
    id: string;
    severity: string;
    pest_type: string;
    location: GeoPoint;
    affected_area_ha: number;
    timestamp: string;
    confidence: number;
}

export interface Stats {
    active_passes: number;
    pest_alerts: number;
    critical_regions: number;
    analyzed_area_ha: number;
    analyzed_area_growth: number;
    active_models: number;
    model_names: string[];
}

export interface EdgeNode {
    id: string;
    status: string;
    power_consumption_w: number;
    lora_range_km: number;
    location: GeoPoint;
    last_ping: string; // ISO datetime
}

export interface ModelMetrics {
    cnn_lstm_precision: number;
    cnn_lstm_f1: number;
    stari_rmse: number;
    last_training: string; // ISO datetime
}

export interface DashboardData {
    stats: Stats;
    passes: SatellitePass[];
    alerts: PestAlert[];
    edge_nodes: EdgeNode[];
    model_metrics: ModelMetrics;
}

export async function getDashboardData(): Promise<DashboardData> {
    try {
        const token = localStorage.getItem("accessToken");
        const headers: HeadersInit = {
            'Content-Type': 'application/json'
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch(`${API_BASE_URL}/api/dashboard/data`, {
            cache: 'no-store',
            headers
        });

        if (!res.ok) {
            if (res.status === 401) {
                // Unauthorized - redirect to login
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
            throw new Error("Failed to fetch data");
        }
        return await res.json();
    } catch (error) {
        console.error("API Error:", error);
        // Return dummy fallback to prevent crash while backend is offline
        return {
            stats: {
                active_passes: 0,
                pest_alerts: 0,
                critical_regions: 0,
                analyzed_area_ha: 0,
                analyzed_area_growth: 0,
                active_models: 0,
                model_names: []
            },
            passes: [],
            alerts: [],
            edge_nodes: [],
            model_metrics: {
                cnn_lstm_precision: 0,
                cnn_lstm_f1: 0,
                stari_rmse: 0,
                last_training: new Date().toISOString()
            }
        };
    }
}

// Alias for compatibility
export const fetchDashboardData = getDashboardData;
