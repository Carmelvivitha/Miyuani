"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wifi, Battery, Activity, AlertTriangle } from 'lucide-react'

interface EdgeNodeProps {
    nodes: any[]
}

export function EdgeSentinelSwarm({ nodes }: EdgeNodeProps) {
    const onlineCount = nodes.filter(n => n.status === 'Online').length
    const totalCount = nodes.length

    return (
        <Card className="col-span-1 bg-slate-900 border-slate-800">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white">EdgeSentinel Swarm</CardTitle>
                    <Badge variant={onlineCount === totalCount ? "default" : "secondary"}>
                        {onlineCount} / {totalCount} Active
                    </Badge>
                </div>
                <CardDescription className="text-slate-400">
                    Real-time IoT Sensor Fusion Network
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {nodes.map((node) => (
                        <div key={node.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-950/50 border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-full ${node.status === 'Online' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                    <Wifi className="h-4 w-4" />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{node.id}</div>
                                    <div className="text-xs text-slate-500">LoRaWAN • {node.lora_range_km}km</div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="flex items-center gap-1 text-sm text-emerald-400">
                                    <Battery className="h-3 w-3" />
                                    {85 + Math.floor(Math.random() * 10)}%
                                </div>
                                <div className="text-xs text-slate-500">{node.power_consumption_w}W</div>
                            </div>
                        </div>
                    ))}

                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                            <div className="text-xs text-slate-500 mb-1">Avg Temp</div>
                            <div className="text-lg font-bold text-white">26.5°C</div>
                        </div>
                        <div className="p-3 bg-slate-950 rounded border border-slate-800 text-center">
                            <div className="text-xs text-slate-500 mb-1">Humidity</div>
                            <div className="text-lg font-bold text-blue-400">82%</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

