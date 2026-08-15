"use client";

import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
import TimeSlider from "./TimeSlider";

// Dynamically import CesiumViewer with ssr: false to prevent server-side errors
const CesiumViewer = dynamic(() => import("./CesiumViewer"), {
    ssr: false,
    loading: () => <div className="h-screen w-full bg-slate-900 flex items-center justify-center text-white">Initializing 3D Engine...</div>
});

const EarthTimeMachine = () => {
    const [currentYear, setCurrentYear] = useState(2024);
    const [isCompareMode, setIsCompareMode] = useState(false);
    const [compareYear, setCompareYear] = useState(1990);

    // Parse URL parameters on mount
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const yearParam = params.get("year");
        const compareParam = params.get("compare");

        if (yearParam) {
            const year = parseInt(yearParam);
            if (year >= 1984 && year <= 2024) {
                setCurrentYear(year);
            }
        }

        if (compareParam) {
            const year = parseInt(compareParam);
            if (year >= 1984 && year <= 2024) {
                setCompareYear(year);
                setIsCompareMode(true);
            }
        }
    }, []);

    return (
        <div className="w-full h-screen relative overflow-hidden">
            <CesiumViewer
                currentYear={currentYear}
                compareYear={isCompareMode ? compareYear : undefined}
            />

            {/* UI Overlay - Increased z-index to stay above Cesium controls */}
            <div className="absolute top-4 left-4 z-[100] p-4 rounded-lg text-white backdrop-blur-md bg-black/60 border border-white/20 max-w-sm shadow-xl">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">Invisible Earth</h1>
                <p className="text-xs opacity-70 mb-4">Viral Prototype: Time Machine</p>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsCompareMode(!isCompareMode)}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${isCompareMode ? 'bg-blue-600 shadow-lg shadow-blue-500/50' : 'bg-white/10 hover:bg-white/20'}`}
                    >
                        {isCompareMode ? "Exit Compare" : `Compare vs ${compareYear}`}
                    </button>
                </div>
            </div>

            {/* Time Slider - Bottom center with high z-index */}
            <div className="absolute bottom-10 left-0 w-full flex justify-center z-[100] px-4 pointer-events-none">
                <div className="pointer-events-auto">
                    <TimeSlider
                        minYear={1984}
                        maxYear={2024}
                        currentYear={currentYear}
                        onYearChange={setCurrentYear}
                    />
                </div>
            </div>
        </div>
    );
};

export default EarthTimeMachine;
