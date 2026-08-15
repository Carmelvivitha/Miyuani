'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import the map component with SSR disabled
const PestMap = dynamic(() => import('@/components/PestMap'), {
    ssr: false,
    loading: () => (
        <div className="h-full flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading map engine...</p>
            </div>
        </div>
    )
})

interface PestAlert {
    id: string
    severity: 'High' | 'Medium' | 'Low'
    pest_type: string
    location: { lat: number; lng: number }
    affected_area_ha: number
    timestamp: string
    confidence: number
}

export default function PestMapsPage() {
    const [alerts, setAlerts] = useState<PestAlert[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'all' | 'High' | 'Medium' | 'Low'>('all')

    // Fetch pest alerts from API
    useEffect(() => {
        fetch('http://localhost:8000/api/dashboard/data')
            .then(res => res.json())
            .then(data => {
                setAlerts(data.alerts || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const filteredAlerts = filter === 'all'
        ? alerts
        : alerts.filter(a => a.severity === filter)

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Pest Outbreak Maps</h1>
                <p className="text-gray-600">Real-time geospatial visualization of pest threats</p>
            </div>

            {/* Filter Controls */}
            <div className="bg-white rounded-lg shadow p-4 mb-6">
                <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-700">Filter by Severity:</span>
                    {(['all', 'High', 'Medium', 'Low'] as const).map(level => (
                        <button
                            key={level}
                            onClick={() => setFilter(level)}
                            className={`px-4 py-2 rounded-lg transition ${filter === level
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            {level}
                        </button>
                    ))}
                    <span className="ml-auto text-sm text-gray-600">
                        Showing {filteredAlerts.length} of {alerts.length} alerts
                    </span>
                </div>
            </div>

            {/* Map Container */}
            <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
                {loading ? (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading pest data...</p>
                        </div>
                    </div>
                ) : (
                    <PestMap alerts={filteredAlerts} />
                )}
            </div>

            {/* Legend */}
            <div className="bg-white rounded-lg shadow p-4 mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Legend</h3>
                <div className="flex gap-6">
                    {[
                        { label: 'High Severity', color: '#dc2626' },
                        { label: 'Medium Severity', color: '#f59e0b' },
                        { label: 'Low Severity', color: '#10b981' }
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 rounded-full"
                                style={{ backgroundColor: item.color, opacity: 0.3, border: `2px solid ${item.color}` }}
                            />
                            <span className="text-sm text-gray-700">{item.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
