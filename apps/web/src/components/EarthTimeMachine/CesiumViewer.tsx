"use client";

import React, { useEffect, useState, useRef } from "react";
import { Viewer, Entity, ImageryLayer } from "resium";
import * as Cesium from "cesium";
import "cesium/Build/Cesium/Widgets/widgets.css";
import ViralControls from "./ViralControls";

// Ensure CESIUM_BASE_URL is set before Cesium loads
if (typeof window !== "undefined") {
    (window as any).CESIUM_BASE_URL = "/cesium";
    if (process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN) {
        Cesium.Ion.defaultAccessToken = process.env.NEXT_PUBLIC_CESIUM_ION_TOKEN;
    }
}

interface CesiumViewerProps {
    currentYear: number;
    compareYear?: number | null;
}

const CesiumViewer = ({ currentYear, compareYear }: CesiumViewerProps) => {
    const [isMounted, setIsMounted] = useState(false);
    const viewerRef = useRef<Cesium.Viewer | null>(null);
    const [sliderPosition, setSliderPosition] = useState(0.5);
    const [error, setError] = useState<string | null>(null);

    // Imagery providers
    const [currentProvider, setCurrentProvider] = useState<Cesium.ImageryProvider | undefined>(undefined);
    const [compareProvider, setCompareProvider] = useState<Cesium.ImageryProvider | undefined>(undefined);

    // Load imagery providers based on year
    useEffect(() => {
        setIsMounted(true);

        const loadProviders = async () => {
            try {
                // Use OpenStreetMap as the primary provider (no token required)
                const current = new Cesium.OpenStreetMapImageryProvider({
                    url: 'https://tile.openstreetmap.org/'
                });
                setCurrentProvider(current);

                // For comparison, use Natural Earth II (built into Cesium)
                const compare = new Cesium.TileMapServiceImageryProvider({
                    url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII')
                });
                setCompareProvider(compare);

            } catch (error) {
                console.error("Error loading imagery providers:", error);
                setError("Failed to load satellite imagery. Please refresh the page.");
            }
        };

        loadProviders();
    }, []);

    // Update split position when in compare mode
    useEffect(() => {
        if (viewerRef.current && compareYear) {
            const scene = viewerRef.current.scene;
            scene.splitPosition = sliderPosition;
        }
    }, [compareYear, sliderPosition]);

    // Restore camera position from URL parameters
    useEffect(() => {
        if (!viewerRef.current) return;

        const params = new URLSearchParams(window.location.search);
        const lat = params.get("lat");
        const lon = params.get("lon");
        const height = params.get("height");
        const heading = params.get("heading");
        const pitch = params.get("pitch");

        if (lat && lon && height) {
            const camera = viewerRef.current.camera;
            camera.setView({
                destination: Cesium.Cartesian3.fromDegrees(
                    parseFloat(lon),
                    parseFloat(lat),
                    parseFloat(height)
                ),
                orientation: {
                    heading: heading ? Cesium.Math.toRadians(parseFloat(heading)) : 0,
                    pitch: pitch ? Cesium.Math.toRadians(parseFloat(pitch)) : Cesium.Math.toRadians(-90),
                    roll: 0
                }
            });
        }
    }, [isMounted]);

    if (!isMounted) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-b from-slate-900 to-black text-white">
                <div className="text-center">
                    <div className="text-2xl font-bold mb-2">Loading Earth...</div>
                    <div className="text-sm opacity-70">Initializing 3D Globe Engine</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-screen bg-gradient-to-b from-red-900 to-black text-white">
                <div className="text-center p-8 bg-red-500/20 rounded-lg border border-red-500/50">
                    <div className="text-2xl font-bold mb-2">⚠️ Error</div>
                    <div className="text-sm">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <Viewer
            full
            ref={(e) => {
                if (e && e.cesiumElement) viewerRef.current = e.cesiumElement;
            }}
            timeline={false}
            animation={false}
            baseLayerPicker={false}
            fullscreenButton={false}
            vrButton={false}
            geocoder={false}
            homeButton={false}
            infoBox={false}
            sceneModePicker={false}
            selectionIndicator={false}
            navigationHelpButton={false}
            navigationInstructionsInitiallyVisible={false}
        >
            {/* Current Year Layer */}
            {currentProvider && (
                <ImageryLayer
                    imageryProvider={currentProvider}
                    splitDirection={compareYear ? Cesium.SplitDirection.LEFT : Cesium.SplitDirection.NONE}
                />
            )}

            {/* Compare Year Layer (only in compare mode) */}
            {compareYear && compareProvider && (
                <ImageryLayer
                    imageryProvider={compareProvider}
                    splitDirection={Cesium.SplitDirection.RIGHT}
                />
            )}

            {/* Split Slider UI */}
            {compareYear && (
                <>
                    {/* Year labels - Positioned below the top buttons to avoid overlap */}
                    <div className="absolute top-24 left-8 z-[100] bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-blue-500/50 shadow-lg">
                        <div className="text-white font-mono text-lg font-bold">{currentYear}</div>
                        <div className="text-white/60 text-xs">Current</div>
                    </div>
                    <div className="absolute top-24 right-8 z-[100] bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-green-500/50 shadow-lg">
                        <div className="text-white font-mono text-lg font-bold">{compareYear}</div>
                        <div className="text-white/60 text-xs">Compare</div>
                    </div>

                    {/* Draggable slider - Lower z-index than labels */}
                    <div
                        className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-[60] hover:w-2 transition-all shadow-lg"
                        style={{ left: `${sliderPosition * 100}%` }}
                        onMouseDown={(e) => {
                            const handleMouseMove = (moveEvent: MouseEvent) => {
                                const newPos = moveEvent.clientX / window.innerWidth;
                                setSliderPosition(Math.max(0, Math.min(1, newPos)));
                            };
                            const handleMouseUp = () => {
                                window.removeEventListener("mousemove", handleMouseMove);
                                window.removeEventListener("mouseup", handleMouseUp);
                            };
                            window.addEventListener("mousemove", handleMouseMove);
                            window.addEventListener("mouseup", handleMouseUp);
                        }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-xl text-black font-bold border-2 border-gray-300">
                            ↔
                        </div>
                    </div>
                </>
            )}

            {/* Example marker - Tokyo */}
            <Entity
                name="Tokyo, Japan"
                position={Cesium.Cartesian3.fromDegrees(139.767052, 35.681167, 100)}
                point={{ pixelSize: 10, color: Cesium.Color.RED }}
            />

            <ViralControls currentYear={currentYear} compareYear={compareYear} />
        </Viewer>
    );
};

export default CesiumViewer;
