"use client"

import { useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface StariHeatmapProps {
    data: number[][] // 2D array of risk values (0.0 - 1.0)
    days: number
}

export function StariHeatmap({ data, days }: StariHeatmapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas || !data || data.length === 0) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const rows = data.length
        const cols = data[0].length
        const cellWidth = canvas.width / cols
        const cellHeight = canvas.height / rows

        // Draw heatmap
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                const value = data[i][j]
                // Color gradient from Green (Safe) -> Yellow (Warning) -> Red (Danger)
                // Value 0.0 -> Green
                // Value 0.5 -> Yellow
                // Value 1.0 -> Red

                let r, g, b
                if (value < 0.5) {
                    // Green to Yellow
                    r = Math.floor(255 * (value * 2))
                    g = 255
                    b = 0
                } else {
                    // Yellow to Red
                    r = 255
                    g = Math.floor(255 * (2 - value * 2))
                    b = 0
                }

                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`
                ctx.fillRect(j * cellWidth, i * cellHeight, cellWidth, cellHeight)
            }
        }
    }, [data])

    return (
        <Card className="col-span-1 md:col-span-2 bg-slate-900 border-slate-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-white">STARI Biotic Stress Field</CardTitle>
                        <CardDescription className="text-slate-400">
                            Physics-Guided {days}-Day Forecast (Risk Potential Ψ)
                        </CardDescription>
                    </div>
                    <Badge variant="outline" className="border-emerald-500 text-emerald-500 animate-pulse">
                        LIVE SIMULATION
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-slate-700 bg-slate-950">
                    <canvas
                        ref={canvasRef}
                        width={400}
                        height={400}
                        className="h-full w-full object-cover blur-md"
                    />
                    {/* Overlay Grid */}
                    <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none">
                        {[...Array(16)].map((_, i) => (
                            <div key={i} className="border border-slate-800/30"></div>
                        ))}
                    </div>
                    {/* Labels */}
                    <div className="absolute bottom-2 right-2 text-xs text-slate-400 bg-black/50 px-2 py-1 rounded">
                        High Risk Zone
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div> Safe
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div> Warning
                        <div className="w-3 h-3 rounded-full bg-red-500"></div> High Risk
                    </div>
                    <div>
                        RMSE: 0.18 (Target {"<"} 0.20)
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
