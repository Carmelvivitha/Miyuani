'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/marker-icon-2x.png',
    iconUrl: '/marker-icon.png',
    shadowUrl: '/marker-shadow.png',
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
    useState(() => {
        fetch('http://localhost:8000/api/dashboard/data')
            .then(res => res.json())
            .then(data => {
                setAlerts(data.alerts || [])
                setLoading(false)
            })
            .catch(() => setLoading(false))
    })

    const filteredAlerts = filter === 'all'
        ? alerts
        : alerts.filter(a => a.severity === filter)

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'High': return '#dc2626'
            case 'Medium': return '#f59e0b'
            case 'Low': return '#10b981'
            default: return '#6b7280'
        }
    }

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
                    <MapContainer
                        center={[20.5937, 78.9629]}
                        zoom={8}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {filteredAlerts.map(alert => (
                            <Circle
                                key={alert.id}
                                center={[alert.location.lat, alert.location.lng]}
                                radius={alert.affected_area_ha * 100}
                                pathOptions={{
                                    color: getSeverityColor(alert.severity),
                                    fillColor: getSeverityColor(alert.severity),
                                    fillOpacity: 0.3
                                }}
                            >
                                <Popup>
                                    <div className="p-2">
                                        <h3 className="font-bold text-lg mb-2">{alert.pest_type}</h3>
                                        <p className="text-sm"><strong>Severity:</strong> {alert.severity}</p>
                                        <p className="text-sm"><strong>Affected Area:</strong> {alert.affected_area_ha} ha</p>
                                        <p className="text-sm"><strong>Confidence:</strong> {(alert.confidence * 100).toFixed(1)}%</p>
                                        <p className="text-sm text-gray-600">{new Date(alert.timestamp).toLocaleString()}</p>
                                    </div>
                                </Popup>
                            </Circle>
                        ))}
                    </MapContainer>
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
