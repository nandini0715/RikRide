'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'

interface Location {
  lat: number
  lng: number
  address: string
}

interface RideMapPickerProps {
  onPickupSelect: (location: Location | null) => void
  onDropSelect: (location: Location | null) => void
  pickup: Location | null
  drop: Location | null
}

interface PlaceSuggestion {
  description: string
  place_id: string
}

export default function RideMapPicker({ 
  onPickupSelect, 
  onDropSelect, 
  pickup, 
  drop 
}: RideMapPickerProps) {
  const [pickupSearch, setPickupSearch] = useState('')
  const [dropSearch, setDropSearch] = useState('')
  const [pickupSuggestions, setPickupSuggestions] = useState<PlaceSuggestion[]>([])
  const [dropSuggestions, setDropSuggestions] = useState<PlaceSuggestion[]>([])
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [loadingPickup, setLoadingPickup] = useState(false)
  const [loadingDrop, setLoadingDrop] = useState(false)

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lng: longitude })
        },
        (error) => {
          console.error('Error getting location:', error)
        }
      )
    }
  }, [])

  // Search for pickup locations using Nominatim (free, no API key)
  const searchPickupLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setPickupSuggestions([])
      return
    }

    setLoadingPickup(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      )
      const data = await response.json()
      
      const suggestions = data.map((item: any) => ({
        description: item.display_name,
        place_id: item.place_id,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }))
      
      setPickupSuggestions(suggestions)
    } catch (error) {
      console.error('Error searching location:', error)
      setPickupSuggestions([])
    } finally {
      setLoadingPickup(false)
    }
  }

  // Search for drop locations using Nominatim
  const searchDropLocation = async (query: string) => {
    if (!query || query.length < 3) {
      setDropSuggestions([])
      return
    }

    setLoadingDrop(true)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`
      )
      const data = await response.json()
      
      const suggestions = data.map((item: any) => ({
        description: item.display_name,
        place_id: item.place_id,
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
      }))
      
      setDropSuggestions(suggestions)
    } catch (error) {
      console.error('Error searching location:', error)
      setDropSuggestions([])
    } finally {
      setLoadingDrop(false)
    }
  }

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (pickupSearch && !pickup) {
        searchPickupLocation(pickupSearch)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [pickupSearch, pickup])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (dropSearch && !drop) {
        searchDropLocation(dropSearch)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [dropSearch, drop])

  const handlePickupSelect = (suggestion: any) => {
    onPickupSelect({
      lat: suggestion.lat,
      lng: suggestion.lng,
      address: suggestion.description,
    })
    setPickupSearch(suggestion.description)
    setPickupSuggestions([])
  }

  const handleDropSelect = (suggestion: any) => {
    onDropSelect({
      lat: suggestion.lat,
      lng: suggestion.lng,
      address: suggestion.description,
    })
    setDropSearch(suggestion.description)
    setDropSuggestions([])
  }

  const handleUseCurrentLocation = async () => {
    if (!userLocation) return

    setLoadingPickup(true)
    try {
      // Reverse geocode to get address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${userLocation.lat}&lon=${userLocation.lng}`
      )
      const data = await response.json()
      const address = data.display_name || 'Current Location'

      onPickupSelect({
        lat: userLocation.lat,
        lng: userLocation.lng,
        address: address,
      })
      setPickupSearch(address)
    } catch (error) {
      console.error('Error getting address:', error)
      onPickupSelect({
        lat: userLocation.lat,
        lng: userLocation.lng,
        address: 'Current Location',
      })
      setPickupSearch('Current Location')
    } finally {
      setLoadingPickup(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Pickup Location Search */}
      <div className="space-y-2">
        <Label htmlFor="pickup-search" className="text-green-800 font-semibold">
          Pickup Location
        </Label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Input
              id="pickup-search"
              placeholder="Search for pickup location..."
              value={pickup ? pickup.address : pickupSearch}
              onChange={(e) => {
                setPickupSearch(e.target.value)
                if (pickup) onPickupSelect(null)
              }}
              disabled={loadingPickup}
            />
            {pickupSuggestions.length > 0 && !pickup && (
              <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                {pickupSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.place_id}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 border-b last:border-b-0"
                    onClick={() => handlePickupSelect(suggestion)}
                  >
                    {suggestion.description}
                  </button>
                ))}
              </div>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUseCurrentLocation}
            disabled={!userLocation || loadingPickup}
            className="whitespace-nowrap"
          >
            {loadingPickup ? '...' : '📍 Current'}
          </Button>
        </div>
      </div>

      {/* Drop Location Search */}
      <div className="space-y-2">
        <Label htmlFor="drop-search" className="text-red-800 font-semibold">
          Drop Location
        </Label>
        <div className="relative">
          <Input
            id="drop-search"
            placeholder="Search for drop location..."
            value={drop ? drop.address : dropSearch}
            onChange={(e) => {
              setDropSearch(e.target.value)
              if (drop) onDropSelect(null)
            }}
            disabled={loadingDrop}
          />
          {dropSuggestions.length > 0 && !drop && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {dropSuggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 border-b last:border-b-0"
                  onClick={() => handleDropSelect(suggestion)}
                >
                  {suggestion.description}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Selected Locations Display */}
      {pickup && (
        <Card className="p-3 bg-green-50 border-green-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Label className="text-green-800 font-semibold text-xs">Pickup Location</Label>
              <p className="text-sm text-green-700 mt-1">{pickup.address}</p>
              <p className="text-xs text-green-600 mt-1">
                📍 {pickup.lat.toFixed(4)}, {pickup.lng.toFixed(4)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onPickupSelect(null)
                setPickupSearch('')
              }}
              className="text-green-700 hover:text-green-900 h-6 px-2"
            >
              ✕
            </Button>
          </div>
        </Card>
      )}

      {drop && (
        <Card className="p-3 bg-red-50 border-red-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <Label className="text-red-800 font-semibold text-xs">Drop Location</Label>
              <p className="text-sm text-red-700 mt-1">{drop.address}</p>
              <p className="text-xs text-red-600 mt-1">
                📍 {drop.lat.toFixed(4)}, {drop.lng.toFixed(4)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onDropSelect(null)
                setDropSearch('')
              }}
              className="text-red-700 hover:text-red-900 h-6 px-2"
            >
              ✕
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}