"use client";

import React, { useState } from "react";
import { useCesium } from "resium";
import * as Cesium from "cesium";

interface ViralControlsProps {
    currentYear: number;
    compareYear?: number | null;
}

const ViralControls = ({ currentYear, compareYear }: ViralControlsProps) => {
    const { viewer } = useCesium();
    const [copied, setCopied] = useState(false);

    const handleShare = () => {
        if (!viewer) return;

        const camera = viewer.camera;
        const position = camera.positionCartographic;
        const lat = Cesium.Math.toDegrees(position.latitude).toFixed(4);
        const lon = Cesium.Math.toDegrees(position.longitude).toFixed(4);
        const height = position.height.toFixed(0);
        const heading = Cesium.Math.toDegrees(camera.heading).toFixed(2);
        const pitch = Cesium.Math.toDegrees(camera.pitch).toFixed(2);

        const params = new URLSearchParams();
        params.set("lat", lat);
        params.set("lon", lon);
        params.set("height", height);
        params.set("heading", heading);
        params.set("pitch", pitch);
        params.set("year", currentYear.toString());

        if (compareYear) {
            params.set("compare", compareYear.toString());
        }

        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        navigator.clipboard.writeText(url);

        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleRecord = () => {
        alert("🎥 Recording feature coming soon in V1! This will allow you to create time-lapse videos.");
    };

    return (
        <div className="absolute top-4 right-4 z-[100] flex gap-2">
            <button
                onClick={handleShare}
                className={`${copied ? 'bg-green-600' : 'bg-green-500 hover:bg-green-600'} text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2`}
            >
                <span>{copied ? '✓' : '🔗'}</span> {copied ? 'Copied!' : 'Share View'}
            </button>
            <button
                onClick={handleRecord}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-all hover:scale-105 flex items-center gap-2"
            >
                <span>🔴</span> Record Story
            </button>
        </div>
    );
};

export default ViralControls;
