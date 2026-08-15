'use client'

import { useState, useRef } from 'react'
import { Upload, FileImage, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface UploadResult {
    success: boolean
    message: string
    analysis?: {
        pest_detected: string
        confidence: number
        severity: 'High' | 'Medium' | 'Low'
        affected_area_ha: number
    }
}

export default function UploadScanPage() {
    const [file, setFile] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)
    const [result, setResult] = useState<UploadResult | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            setFile(selectedFile)
            setResult(null)

            // Create preview
            const reader = new FileReader()
            reader.onloadend = () => {
                setPreview(reader.result as string)
            }
            reader.readAsDataURL(selectedFile)
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)

        // Simulate API call with mock processing
        setTimeout(() => {
            // Mock analysis result
            const mockResult: UploadResult = {
                success: true,
                message: 'Image analyzed successfully',
                analysis: {
                    pest_detected: 'Fall Armyworm',
                    confidence: 0.87,
                    severity: 'High',
                    affected_area_ha: 25.3
                }
            }

            setResult(mockResult)
            setUploading(false)
        }, 2000)
    }

    const handleReset = () => {
        setFile(null)
        setPreview(null)
        setResult(null)
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    return (
        <div className="p-8">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload Drone/Satellite Scan</h1>
                <p className="text-gray-600">AI-powered pest detection from aerial imagery</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Upload Image</h2>

                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition ${preview ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
                            }`}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {preview ? (
                            <div>
                                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg mb-4" />
                                <p className="text-sm text-gray-600">{file?.name}</p>
                            </div>
                        ) : (
                            <div>
                                <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-lg font-medium text-gray-700 mb-2">Click to upload image</p>
                                <p className="text-sm text-gray-500">Supports: JPG, PNG, TIFF (Max 10MB)</p>
                            </div>
                        )}
                    </div>

                    {file && !result && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full mt-4 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Analyzing with CNN-LSTM...
                                </>
                            ) : (
                                <>
                                    <FileImage className="w-5 h-5" />
                                    Analyze Image
                                </>
                            )}
                        </button>
                    )}

                    {result && (
                        <button
                            onClick={handleReset}
                            className="w-full mt-4 bg-gray-600 text-white py-3 rounded-lg font-medium hover:bg-gray-700"
                        >
                            Upload New Image
                        </button>
                    )}
                </div>

                {/* Results Section */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Analysis Results</h2>

                    {!result ? (
                        <div className="flex items-center justify-center h-64 text-gray-400">
                            <div className="text-center">
                                <AlertCircle className="w-16 h-16 mx-auto mb-4" />
                                <p>Upload an image to see AI analysis</p>
                            </div>
                        </div>
                    ) : result.success ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-green-600 mb-4">
                                <CheckCircle className="w-6 h-6" />
                                <span className="font-medium">Analysis Complete</span>
                            </div>

                            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                                <div>
                                    <p className="text-sm text-gray-600">Detected Pest</p>
                                    <p className="text-lg font-bold text-gray-900">{result.analysis?.pest_detected}</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Confidence Level</p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(result.analysis?.confidence || 0) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-lg font-bold text-gray-900">
                                            {((result.analysis?.confidence || 0) * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Severity</p>
                                    <span
                                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${result.analysis?.severity === 'High'
                                                ? 'bg-red-100 text-red-800'
                                                : result.analysis?.severity === 'Medium'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-green-100 text-green-800'
                                            }`}
                                    >
                                        {result.analysis?.severity}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Estimated Affected Area</p>
                                    <p className="text-lg font-bold text-gray-900">
                                        {result.analysis?.affected_area_ha} hectares
                                    </p>
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                                <p className="text-sm text-blue-800">
                                    <strong>Recommended Action:</strong> Deploy localized pesticide application in affected zone.
                                    Monitor adjacent areas for spread using EdgeSentinel IoT network.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-red-600">
                            <AlertCircle className="w-6 h-6" />
                            <span>{result.message}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Supported Image Types */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
                <h3 className="font-bold text-gray-900 mb-3">Supported Imagery Sources</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { name: 'Drone RGB', desc: 'Standard visible light imagery' },
                        { name: 'Multispectral', desc: 'NDVI, NDRE, GNDVI indices' },
                        { name: 'Satellite', desc: 'Sentinel-2, Landsat-9 data' }
                    ].map(source => (
                        <div key={source.name} className="border border-gray-200 rounded-lg p-4">
                            <p className="font-medium text-gray-900">{source.name}</p>
                            <p className="text-sm text-gray-600">{source.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
