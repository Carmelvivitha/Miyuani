
"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Popup, Polygon, CircleMarker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
// import L from "leaflet"; // Remove mock top-level import to avoid SSR crash if possible, or handle carefully
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SatellitePass, PestAlert } from "@/lib/api";

interface SatelliteMapProps {
    passes?: SatellitePass[];
    alerts?: PestAlert[];
}

export default function SatelliteMap({ passes = [], alerts = [] }: SatelliteMapProps) {
    const [selectedCrop, setSelectedCrop] = useState("rice");
    const [selectedAlgo, setSelectedAlgo] = useState("ndvi");
    const position: [number, number] = [20.5937, 78.9629]; // Center of India

    useEffect(() => {
        // Fix Leaflet marker icon issue in Next.js strictly on client side
        // This ensures 'window' is available and Leaflet doesn't crash SSR
        import("leaflet").then((L) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const iconDefault = L.Icon.Default.prototype as any;
            delete iconDefault._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });
        });
    }, []);

    return (
        <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-slate-800">

            {/* Floating Analysis Panel */}
            <div className="absolute top-4 right-4 z-[400] w-80">
                <Card className="bg-slate-900/90 backdrop-blur border-slate-700 text-white shadow-xl">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-emerald-400">Analysis Configuration</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs uppercase text-slate-400 font-bold">Target Crop</label>
                            <Select value={selectedCrop} onValueChange={setSelectedCrop}>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                    <SelectValue placeholder="Select Crop" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                    <SelectItem value="rice">Rice (Paddy)</SelectItem>
                                    <SelectItem value="wheat">Wheat</SelectItem>
                                    <SelectItem value="cotton">Cotton</SelectItem>
                                    <SelectItem value="sugarcane">Sugarcane</SelectItem>
                                    <SelectItem value="maize">Maize</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase text-slate-400 font-bold">Algorithm / Model</label>
                            <Select value={selectedAlgo} onValueChange={setSelectedAlgo}>
                                <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                                    <SelectValue placeholder="Select Model" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                                    <SelectItem value="ndvi">NDVI (Vegetation Index)</SelectItem>
                                    <SelectItem value="ndre">NDRE (Red Edge)</SelectItem>
                                    <SelectItem value="savi">SAVI (Soil Adjusted)</SelectItem>
                                    <SelectItem value="pest_cnn">Pest Detection CNN (V2)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                            Run Analysis
                        </Button>
                    </CardContent>
                </Card>
            </div>

            <MapContainer
                center={position}
                zoom={5}
                style={{ height: "100%", width: "100%" }}
            >
                {/* Esri Satellite Layer */}
                <TileLayer
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Satellite Imagery'
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />

                {/* Satellite Passes - Blue Rectangles */}
                {passes.map((pass) => (
                    <Polygon
                        key={pass.id}
                        positions={pass.coverage_area.map(p => [p.lat, p.lng])}
                        pathOptions={{ color: 'cyan', weight: 1, fillOpacity: 0.2 }}
                    >
                        <Popup>
                            <div className="text-slate-900">
                                <strong>{pass.satellite_name}</strong><br />
                                {new Date(pass.pass_time).toLocaleString()}<br />
                                Status: {pass.status}
                            </div>
                        </Popup>
                    </Polygon>
                ))}

                {/* Pest Alerts - Red Circles */}
                {alerts.map((alert) => (
                    <CircleMarker
                        key={alert.id}
                        center={[alert.location.lat, alert.location.lng]}
                        pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.6 }}
                        radius={10 + (alert.confidence * 10)}
                    >
                        <Popup>
                            <div className="text-slate-900">
                                <strong className="text-red-600">PEST ALERT: {alert.pest_type}</strong><br />
                                Severity: {alert.severity}<br />
                                Area: {alert.affected_area_ha.toFixed(1)} ha<br />
                                Confidence: {(alert.confidence * 100).toFixed(0)}%
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}

            </MapContainer>
        </div>
    );
}
