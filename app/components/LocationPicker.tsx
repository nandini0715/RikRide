'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix for default marker icon
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void
  initialPosition?: { lat: number; lng: number }
  markerColor?: 'green' | 'red'
}

function LocationMarker({ onLocationSelect, markerColor }: LocationPickerProps) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      
      // Reverse geocoding using Nominatim (free, no API key)
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(res => res.json())
        .then(data => {
          const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
          onLocationSelect({ lat, lng, address })
        })
        .catch(() => {
          // Fallback to coordinates if geocoding fails
          onLocationSelect({ 
            lat, 
            lng, 
            address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` 
          })
        })
    },
  })

  return null
}

export default function LocationPicker({
  onLocationSelect,
  initialPosition = { lat: 28.6139, lng: 77.2090 }, // Default: Delhi
  markerColor = 'green',
}: LocationPickerProps) {
  useEffect(() => {
    // Fix for SSR
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    })
  }, [])

  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden border-2 border-gray-300">
      <MapContainer
        center={[initialPosition.lat, initialPosition.lng]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onLocationSelect={onLocationSelect} markerColor={markerColor} />
      </MapContainer>
    </div>
  )
}
