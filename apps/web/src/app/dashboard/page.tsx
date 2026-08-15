"use client";

import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Bug, Leaf, TrendingUp } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { fetchDashboardData, DashboardData } from "@/lib/api";

// Dynamically import Map to avoid SSR issues with Leaflet
const SatelliteMap = dynamic(() => import("@/components/satellite-map"), {
    ssr: false,
    loading: () => <div className="h-[600px] w-full bg-slate-900 animate-pulse rounded-xl flex items-center justify-center text-slate-500">Loading Satellite Data...</div>
});

import { StariHeatmap } from "@/components/stari-heatmap";
import { EdgeSentinelSwarm } from "@/components/edge-sentinel";
// We need to access the raw API for custom endpoints not covered by fetchDashboardData
import axios from 'axios';
const API_URL = 'http://localhost:8000/api';
const api = axios.create({
    baseURL: API_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default function DashboardPage() {
    // Initial state with some safe defaults
    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [stariForecast, setStariForecast] = useState<any>(null);

    useEffect(() => {
        async function loadData() {
            try {
                // Use the imported function, do not redefine it
                const dashboardData = await fetchDashboardData();
                setData(dashboardData);

                // Fetch deep tech forecast
                const forecast = await api.get('/dashboard/stari-forecast').then(res => res.data).catch(() => null);
                setStariForecast(forecast);
            } catch (error) {
                console.error("Failed to load dashboard data", error);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const stats = data?.stats;

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/miyuani-logo.png" alt="Miyuani Logo" className="h-16 w-16 object-contain rounded-xl" />
                    <div>
                        <h2 className="text-4xl font-black tracking-tight text-gray-900" style={{ fontFamily: "'Space Grotesk', 'Inter', sans-serif", letterSpacing: "-0.02em" }}>
                            Miyuani
                        </h2>
                        <p className="text-sm font-semibold text-emerald-600 mt-1.5">
                            Smart Agriculture Through Space Technology
                        </p>
                    </div>
                </div>

                {/* Deep Tech Intelligence Section */}
                {data?.model_metrics && (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                        {/* Model Performance - CNN-LSTM & STARI */}
                        <Card className="col-span-1 md:col-span-2 bg-slate-900/50 backdrop-blur border-slate-800 text-slate-100">
                            <CardHeader>
                                <CardTitle className="text-xl flex items-center gap-2">
                                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Model Agents Performance
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-400">CNN-LSTM Spectral Precision</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-bold text-emerald-400">
                                                {(data.model_metrics.cnn_lstm_precision * 100).toFixed(1)}%
                                            </span>
                                            <span className="text-xs text-emerald-600 mb-1">Target ≥ 85%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-500"
                                                style={{ width: `${data.model_metrics.cnn_lstm_precision * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-400">CNN-LSTM F1 Score</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-bold text-emerald-400">
                                                {(data.model_metrics.cnn_lstm_f1 * 100).toFixed(1)}%
                                            </span>
                                            <span className="text-xs text-emerald-600 mb-1">Target ≥ 80%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-emerald-500 transition-all duration-500"
                                                style={{ width: `${data.model_metrics.cnn_lstm_f1 * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm text-slate-400">STARI EpiTwin RMSE</p>
                                        <div className="flex items-end gap-2">
                                            <span className="text-2xl font-bold text-sky-400">
                                                {data.model_metrics.stari_rmse.toFixed(3)}
                                            </span>
                                            <span className="text-xs text-sky-600 mb-1">Target &lt; 0.20</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-sky-500 transition-all duration-500"
                                                style={{ width: `${(1 - data.model_metrics.stari_rmse) * 100}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* STARI Heatmap Visualization */}
                        {stariForecast && (
                            <div className="col-span-1 md:col-span-3">
                                <StariHeatmap data={stariForecast.risk_heatmap} days={stariForecast.forecast_days} />
                            </div>
                        )}

                        {/* Edge Node Status */}
                        <div className="col-span-1 md:col-span-2">
                            <EdgeSentinelSwarm nodes={data.edge_nodes || []} />
                        </div>
                    </div>
                )}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Passes
                            </CardTitle>
                            <Activity className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.active_passes}</div>
                            <p className="text-xs text-muted-foreground">
                                Live Satellite Feeds
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pest Alerts
                            </CardTitle>
                            <Bug className="h-4 w-4 text-red-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.pest_alerts}</div>
                            <p className="text-xs text-muted-foreground">
                                {loading ? "..." : stats?.critical_regions} Critical Regions
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Analyzed Area
                            </CardTitle>
                            <Leaf className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.analyzed_area_ha.toFixed(1)} ha</div>
                            <p className="text-xs text-muted-foreground">
                                +{loading ? "..." : stats?.analyzed_area_growth.toFixed(1)} ha today
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Models Active
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats?.active_models || 3}</div>
                            <p className="text-xs text-muted-foreground">
                                {stats?.model_names.join(", ") || "NDVI, CNN, SWI"}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Satellite Map Section */}
                <div className="grid gap-4 custom-grid">
                    <Card className="col-span-full border-slate-200 shadow-sm">
                        <CardHeader>
                            <CardTitle>Live Satellite Feed & Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Pass data to map if needed, for now just rendering it */}
                            <SatelliteMap passes={data?.passes || []} alerts={data?.alerts || []} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
