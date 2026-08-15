'use client'

import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useEffect } from 'react'

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

interface PestMapProps {
    alerts: PestAlert[]
}

const getSeverityColor = (severity: string) => {
    switch (severity) {
        case 'High': return '#dc2626'
        case 'Medium': return '#f59e0b'
        case 'Low': return '#10b981'
        default: return '#6b7280'
    }
}

const PestMap = ({ alerts }: PestMapProps) => {
    return (
        <MapContainer
            center={[20.5937, 78.9629]}
            zoom={8}
            style={{ height: '100%', width: '100%' }}
        >
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {alerts.map(alert => (
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
    )
}

export default PestMap
