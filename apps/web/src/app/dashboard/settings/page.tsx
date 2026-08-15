'use client'

import { useState } from 'react'
import { Save, User, Bell, Database, Map, Wifi } from 'lucide-react'

export default function SettingsPage() {
    const [settings, setSettings] = useState({
        notifications: {
            email: true,
            sms: false,
            push: true,
            criticalOnly: false
        },
        map: {
            defaultZoom: 8,
            showSatellitePaths: true,
            showEdgeNodes: true,
            heatmapOpacity: 70
        },
        data: {
            autoSync: true,
            syncInterval: 15,
            retentionDays: 90
        },
        user: {
            name: 'Admin User',
            email: 'admin@miyuani.com',
            organization: 'Miyuani Research Institute'
        }
    })

    const [saved, setSaved] = useState(false)

    const handleSave = () => {
        // Simulate save
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Configure your Miyuani platform preferences</p>
            </div>

            <div className="space-y-6">
                {/* User Profile */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">User Profile</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                            <input
                                type="text"
                                value={settings.user.name}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    user: { ...settings.user, name: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input
                                type="email"
                                value={settings.user.email}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    user: { ...settings.user, email: e.target.value }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Organization</label>
                            <input
                                type="text"
                                value={settings.user.organization}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                                disabled
                            />
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Notifications</h2>
                    </div>
                    <div className="space-y-3">
                        {[
                            { key: 'email', label: 'Email Alerts' },
                            { key: 'sms', label: 'SMS Alerts (Premium)' },
                            { key: 'push', label: 'Push Notifications' },
                            { key: 'criticalOnly', label: 'Only Critical Severity' }
                        ].map(({ key, label }) => (
                            <label key={key} className="flex items-center justify-between py-2">
                                <span className="text-gray-700">{label}</span>
                                <input
                                    type="checkbox"
                                    checked={settings.notifications[key as keyof typeof settings.notifications]}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        notifications: {
                                            ...settings.notifications,
                                            [key]: e.target.checked
                                        }
                                    })}
                                    className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                {/* Map Preferences */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Map className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Map Preferences</h2>
                    </div>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Default Zoom Level: {settings.map.defaultZoom}
                            </label>
                            <input
                                type="range"
                                min="5"
                                max="15"
                                value={settings.map.defaultZoom}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    map: { ...settings.map, defaultZoom: parseInt(e.target.value) }
                                })}
                                className="w-full"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Heatmap Opacity: {settings.map.heatmapOpacity}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={settings.map.heatmapOpacity}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    map: { ...settings.map, heatmapOpacity: parseInt(e.target.value) }
                                })}
                                className="w-full"
                            />
                        </div>
                        <div className="space-y-2">
                            {[
                                { key: 'showSatellitePaths', label: 'Show Satellite Paths' },
                                { key: 'showEdgeNodes', label: 'Show EdgeSentinel Nodes' }
                            ].map(({ key, label }) => (
                                <label key={key} className="flex items-center justify-between py-2">
                                    <span className="text-gray-700">{label}</span>
                                    <input
                                        type="checkbox"
                                        checked={settings.map[key as keyof typeof settings.map] as boolean}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            map: {
                                                ...settings.map,
                                                [key]: e.target.checked
                                            }
                                        })}
                                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Data Sync */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Database className="w-6 h-6 text-blue-600" />
                        <h2 className="text-xl font-bold text-gray-900">Data Synchronization</h2>
                    </div>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between py-2">
                            <span className="text-gray-700">Auto-sync with EdgeSentinel Network</span>
                            <input
                                type="checkbox"
                                checked={settings.data.autoSync}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    data: { ...settings.data, autoSync: e.target.checked }
                                })}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                        </label>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Sync Interval (minutes)
                            </label>
                            <select
                                value={settings.data.syncInterval}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    data: { ...settings.data, syncInterval: parseInt(e.target.value) }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={5}>5 minutes</option>
                                <option value={15}>15 minutes</option>
                                <option value={30}>30 minutes</option>
                                <option value={60}>1 hour</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Data Retention (days)
                            </label>
                            <select
                                value={settings.data.retentionDays}
                                onChange={(e) => setSettings({
                                    ...settings,
                                    data: { ...settings.data, retentionDays: parseInt(e.target.value) }
                                })}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value={30}>30 days</option>
                                <option value={60}>60 days</option>
                                <option value={90}>90 days</option>
                                <option value={180}>180 days</option>
                                <option value={365}>1 year</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Save Button */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleSave}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        Save Settings
                    </button>
                    {saved && (
                        <span className="text-green-600 font-medium">✓ Settings saved successfully</span>
                    )}
                </div>
            </div>
        </div>
    )
}
