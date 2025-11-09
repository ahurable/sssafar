// components/admin/map-selector.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Check, X } from "lucide-react"

interface Location {
  lat: number
  lng: number
  address: string
}

interface MapSelectorProps {
  onLocationSelect: (location: Location) => void
  selectedLocation: Location | null
}

export default function MapSelector({ onLocationSelect, selectedLocation }: MapSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tempLocation, setTempLocation] = useState<Location | null>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)

  // Initialize map when dialog opens
  useEffect(() => {
    if (!isDialogOpen || !mapRef.current) return

    const initializeMap = async () => {
      // Dynamically import Leaflet only on client side
      const L = (await import('leaflet')).default

      // Fix for default markers
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })

      // Create map instance
      const map = L.map(mapRef.current!).setView([35.6892, 51.3890], 13)

      // Add tile layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      // Add click event to map
      map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        handleMapClick(lat, lng, L)
      })

      mapInstanceRef.current = map
      setIsMapInitialized(true)

      // Force map to invalidate size after a small delay to ensure proper rendering
      setTimeout(() => {
        map.invalidateSize()
      }, 100)

      // If there's a selected location, set it on the map
      if (selectedLocation) {
        setMarker(selectedLocation.lat, selectedLocation.lng, L)
      }
    }

    initializeMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setIsMapInitialized(false)
        markerRef.current = null
      }
    }
  }, [isDialogOpen])

  // Reinitialize map when dialog opens to fix sizing
  useEffect(() => {
    if (isDialogOpen && mapInstanceRef.current) {
      setTimeout(() => {
        mapInstanceRef.current?.invalidateSize()
      }, 300)
    }
  }, [isDialogOpen])

  // Create custom icon function
  const createCustomIcon = (L: any) => {
    return L.divIcon({
      html: `
        <div style="
          background-color: #10b981;
          width: 32px;
          height: 32px;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
        ">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"></path>
            <circle cx="12" cy="9" r="3"></circle>
          </svg>
        </div>
      `,
      className: 'custom-location-marker',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    })
  }

  // Set marker on map
  const setMarker = (lat: number, lng: number, L: any) => {
    if (!mapInstanceRef.current) return

    // Remove existing marker
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current)
    }

    // Create custom icon
    const customIcon = createCustomIcon(L)

    // Add new marker
    const newMarker = L.marker([lat, lng], { 
      icon: customIcon,
      zIndexOffset: 1000
    }).addTo(mapInstanceRef.current)
    
    markerRef.current = newMarker
    
    // Pan to the new location with smooth animation
    mapInstanceRef.current.setView([lat, lng], mapInstanceRef.current.getZoom(), {
      animate: true
    })
  }

  // Set initial location when dialog opens with selectedLocation
  useEffect(() => {
    if (isDialogOpen && selectedLocation) {
      setTempLocation(selectedLocation)
    }
  }, [isDialogOpen, selectedLocation])

  const handleMapClick = async (lat: number, lng: number, L: any) => {
    try {
      // Get address from coordinates using OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`
      )
      const data = await response.json()
      
      const address = data.display_name || "آدرس نامشخص"
      
      setTempLocation({
        lat,
        lng,
        address
      })

      // Update marker on map
      setMarker(lat, lng, L)
    } catch (error) {
      console.error("Error getting address:", error)
      setTempLocation({
        lat,
        lng,
        address: "آدرس نامشخص"
      })
      setMarker(lat, lng, L)
    }
  }

  const handleConfirmLocation = () => {
    if (tempLocation) {
      onLocationSelect(tempLocation)
      setIsDialogOpen(false)
    }
  }

  const handleUseCurrentLocation = async () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const L = (await import('leaflet')).default
          const lat = position.coords.latitude
          const lng = position.coords.longitude
          
          try {
            // Get address for current location
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=fa`
            )
            const data = await response.json()
            
            const location: Location = {
              lat,
              lng,
              address: data.display_name || "موقعیت فعلی شما"
            }
            setTempLocation(location)
            setMarker(lat, lng, L)
          } catch (error) {
            console.error("Error getting address:", error)
            const location: Location = {
              lat,
              lng,
              address: "موقعیت فعلی شما"
            }
            setTempLocation(location)
            setMarker(lat, lng, L)
          }
        },
        (error) => {
          console.error("Error getting current location:", error)
          alert("دسترسی به موقعیت مکانی امکان‌پذیر نیست")
        }
      )
    } else {
      alert("مرورگر شما از موقعیت‌یابی پشتیبانی نمی‌کند")
    }
  }

  const handleSetSampleLocation = async () => {
    const L = (await import('leaflet')).default
    const sampleLocation = {
      lat: 35.6892,
      lng: 51.3890,
      address: "تهران، میدان امام خمینی"
    }
    setTempLocation(sampleLocation)
    setMarker(sampleLocation.lat, sampleLocation.lng, L)
  }

  return (
    <div className="space-y-4">
      {/* نمایش موقعیت انتخاب شده */}
      {selectedLocation && (
        <div className="p-4 border rounded-lg bg-green-50 border-green-200">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600" />
            <span className="font-medium">موقعیت انتخاب شده:</span>
          </div>
          <p className="text-sm mt-1">{selectedLocation.address}</p>
          <p className="text-xs text-muted-foreground mt-1">
            مختصات: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* دکمه باز کردن نقشه */}
      <div>
        <Button 
          type="button" 
          variant="outline" 
          className="w-full h-12"
          onClick={() => setIsDialogOpen(true)}
        >
          <MapPin className="h-4 w-4 ml-2" />
          {selectedLocation ? "تغییر موقعیت روی نقشه" : "انتخاب موقعیت روی نقشه"}
        </Button>
        
        {/* Map Modal */}
        {isDialogOpen && (
          <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
            <div className="fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%] w-full max-w-4xl">
              <div className="bg-white rounded-lg border shadow-lg flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                  <h2 className="text-lg font-semibold">انتخاب موقعیت روی نقشه</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsDialogOpen(false)}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Map Container */}
                <div className="flex-1 p-6 overflow-hidden">
                  <div className="space-y-4 h-full">
                    {/* Leaflet Map Container - Fixed Rectangle Box */}
                    <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
                      <div 
                        ref={mapRef} 
                        className="w-full h-96" // Fixed height for rectangle
                        style={{ minHeight: '384px' }}
                      >
                        {!isMapInitialized && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center text-muted-foreground">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                              <p>در حال بارگذاری نقشه...</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-sm text-muted-foreground text-center">
                      برای انتخاب موقعیت، روی نقشه کلیک کنید
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUseCurrentLocation}
                        className="flex-1"
                      >
                        <Navigation className="h-4 w-4 ml-2" />
                        استفاده از موقعیت فعلی
                      </Button>
                      
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSetSampleLocation}
                        className="flex-1"
                      >
                        <MapPin className="h-4 w-4 ml-2" />
                        موقعیت نمونه
                      </Button>
                    </div>

                    {/* Selected Location Info */}
                    {tempLocation && (
                      <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
                        <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
                          <Navigation className="h-4 w-4" />
                          موقعیت انتخاب شده:
                        </div>
                        <div className="text-xs text-blue-700 mt-1">
                          مختصات: {tempLocation.lat.toFixed(6)}, {tempLocation.lng.toFixed(6)}
                        </div>
                        <div className="text-sm text-blue-800 mt-1">{tempLocation.address}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 border-t bg-gray-50">
                  <div className="flex gap-3">
                    <Button
                      type="button"
                      onClick={handleConfirmLocation}
                      disabled={!tempLocation}
                      className="flex-1"
                    >
                      <Check className="h-4 w-4 ml-2" />
                      تایید موقعیت
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                      className="flex-1"
                    >
                      انصراف
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}