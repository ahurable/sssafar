"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useHotel } from "@/contexts/search/HotelContext"

export function HotelFilters() {
  const { filters, setFilters, applyFilters, clearFilters, filteredHotels, hotelData } = useHotel()
  const [localFilters, setLocalFilters] = useState(filters)

  // Update local filters when context filters change
  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handlePriceChange = (value: number[]) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: value as [number, number]
    }))
  }

  const handleRatingChange = (rating: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      hotelRatings: checked 
        ? [...prev.hotelRatings, rating]
        : prev.hotelRatings.filter(r => r !== rating)
    }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }))
  }

  const handleApplyFilters = () => {
    applyFilters(localFilters)
  }

  const handleClearFilters = () => {
    setLocalFilters({
      priceRange: [0, 5000000],
      hotelRatings: [],
      amenities: [],
      hotelTypes: []
    })
    clearFilters()
  }

  const ratingOptions = ["5 ستاره", "4 ستاره", "3 ستاره", "2 ستاره"]
  const amenityOptions = ["وای‌فای رایگان", "استخر", "رستوران", "پارکینگ", "سالن ورزشی"]

  const totalHotels = hotelData?.PricedItineraries?.length || 0
  const showingHotels = filteredHotels.length

  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>فیلترها</span>
          <span className="text-sm font-normal text-muted-foreground">
            {showingHotels} از {totalHotels} هتل
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range Filter */}
        <div className="space-y-3">
          <Label>محدوده قیمت (تومان)</Label>
          <Slider 
            value={localFilters.priceRange}
            onValueChange={handlePriceChange}
            max={5000000} 
            step={100000} 
            className="mt-2" 
          />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{localFilters.priceRange[0].toLocaleString("fa-IR")}</span>
            <span>{localFilters.priceRange[1].toLocaleString("fa-IR")}</span>
          </div>
        </div>

        {/* Hotel Rating Filter */}
        <div className="space-y-3">
          <Label>امتیاز هتل</Label>
          <div className="space-y-2">
            {ratingOptions.map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <Checkbox 
                  id={`rating-${rating}`}
                  checked={localFilters.hotelRatings.includes(rating)}
                  onCheckedChange={(checked) => 
                    handleRatingChange(rating, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`rating-${rating}`} 
                  className="text-sm cursor-pointer flex-1"
                >
                  {rating}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Amenities Filter */}
        <div className="space-y-3">
          <Label>امکانات</Label>
          <div className="space-y-2">
            {amenityOptions.map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                <Checkbox 
                  id={`amenity-${amenity}`}
                  checked={localFilters.amenities.includes(amenity)}
                  onCheckedChange={(checked) => 
                    handleAmenityChange(amenity, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`amenity-${amenity}`} 
                  className="text-sm cursor-pointer flex-1"
                >
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={handleApplyFilters}
            className="flex-1"
            size="sm"
          >
            اعمال فیلترها
          </Button>
          <Button 
            onClick={handleClearFilters}
            variant="outline"
            size="sm"
          >
            حذف فیلترها
          </Button>
        </div>

        {/* Active Filters */}
        {(filters.hotelRatings.length > 0 || filters.amenities.length > 0) && (
          <div className="pt-4 border-t">
            <Label className="text-sm">فیلترهای فعال:</Label>
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.hotelRatings.map(rating => (
                <span 
                  key={rating}
                  className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {rating}
                </span>
              ))}
              {filters.amenities.map(amenity => (
                <span 
                  key={amenity}
                  className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}