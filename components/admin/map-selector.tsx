// components/admin/map-selector-leaflet.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MapPin, Check } from "lucide-react"
import dynamic from 'next/dynamic'

// بارگذاری پویای نقشه Leaflet برای جلوگیری از خطاهای SSR
const Map = dynamic(() => import('./leaflet-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-muted flex items-center justify-center">
      <div className="text-muted-foreground">در حال بارگذاری نقشه...</div>
    </div>
  )
})

interface Location {
  lat: number
  lng: number
  address: string
}

interface MapSelectorProps {
  onLocationSelect: (location: Location) => void
  selectedLocation: Location | null
}

export function MapSelector({ onLocationSelect, selectedLocation }: MapSelectorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [tempLocation, setTempLocation] = useState<Location | null>(selectedLocation)

  const handleConfirmLocation = () => {
    if (tempLocation) {
      onLocationSelect(tempLocation)
      setIsDialogOpen(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* نمایش موقعیت انتخاب شده */}
      {selectedLocation && (
        <div className="p-3 border rounded-lg bg-muted/50">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-green-600" />
            <span>موقعیت انتخاب شده:</span>
          </div>
          <p className="text-sm mt-1 font-medium">{selectedLocation.address}</p>
          <p className="text-xs text-muted-foreground mt-1">
            مختصات: {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* دکمه باز کردن نقشه */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button type="button" variant="outline" className="w-full">
            <MapPin className="h-4 w-4 ml-2" />
            {selectedLocation ? "تغییر موقعیت روی نقشه" : "انتخاب موقعیت روی نقشه"}
          </Button>
        </DialogTrigger>
        
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>انتخاب موقعیت روی نقشه</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 min-h-[400px]">
            <Map
              selectedLocation={tempLocation}
              onLocationSelect={setTempLocation}
            />
          </div>

          <div className="flex gap-3 pt-4">
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
        </DialogContent>
      </Dialog>
    </div>
  )
}