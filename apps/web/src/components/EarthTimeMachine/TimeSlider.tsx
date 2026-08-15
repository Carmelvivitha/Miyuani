"use client";

import React, { useState } from "react";
import * as Slider from "@radix-ui/react-slider";

interface TimeSliderProps {
    minYear: number;
    maxYear: number;
    currentYear: number;
    onYearChange: (year: number) => void;
}

const TimeSlider = ({ minYear, maxYear, currentYear, onYearChange }: TimeSliderProps) => {
    return (
        <div className="flex flex-col items-center w-full max-w-md bg-black/60 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-2xl">
            <h2 className="text-white text-lg font-mono mb-4 tracking-widest uppercase">Select Year</h2>
            <div className="flex items-center w-full gap-4">
                <span className="text-white/70 font-mono text-sm">{minYear}</span>
                <Slider.Root
                    className="relative flex items-center select-none touch-none w-full h-5"
                    value={[currentYear]}
                    max={maxYear}
                    min={minYear}
                    step={1}
                    onValueChange={(value) => onYearChange(value[0])}
                >
                    <Slider.Track className="bg-white/20 relative grow rounded-full h-[3px]">
                        <Slider.Range className="absolute bg-blue-500 rounded-full h-full" />
                    </Slider.Track>
                    <Slider.Thumb
                        className="block w-6 h-6 bg-white border-2 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)] rounded-full hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all cursor-pointer"
                        aria-label="Year"
                    />
                </Slider.Root>
                <span className="text-white/70 font-mono text-sm">{maxYear}</span>
            </div>
            <div className="mt-4 text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300 font-mono">
                {currentYear}
            </div>
        </div>
    );
};

export default TimeSlider;
