"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useFlight } from "@/contexts/search/FlightContext"

interface FilterState {
  priceRange: [number, number]
  airlines: string[]
  flightClasses: string[]
  flightTimes: string[]
  stops: string[]
}

export function FlightFilters() {
  const { flightData, getAirlineName } = useFlight()
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50000000],
    airlines: [],
    flightClasses: [],
    flightTimes: [],
    stops: []
  })

  // Get unique airlines from flight data
  const availableAirlines = Array.from(
    new Set(
      flightData.map(flight => getAirlineName(flight.ValidatingAirlineCode))
    )
  ).sort()

  // Get available price range from data
  const availablePriceRange = flightData.length > 0 ? [
    Math.min(...flightData.map(f => f.AirItineraryPricingInfo.ItinTotalFare.TotalFare / 10)),
    Math.max(...flightData.map(f => f.AirItineraryPricingInfo.ItinTotalFare.TotalFare / 10))
  ] : [0, 50000000]

  // Initialize price range when data loads
  useEffect(() => {
    if (flightData.length > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [availablePriceRange[0], availablePriceRange[1]]
      }))
    }
  }, [flightData.length])

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: value as [number, number]
    }))
  }

  const handleAirlineChange = (airline: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      airlines: checked 
        ? [...prev.airlines, airline]
        : prev.airlines.filter(a => a !== airline)
    }))
  }

  const handleFlightClassChange = (flightClass: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      flightClasses: checked 
        ? [...prev.flightClasses, flightClass]
        : prev.flightClasses.filter(fc => fc !== flightClass)
    }))
  }

  const handleFlightTimeChange = (timeRange: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      flightTimes: checked 
        ? [...prev.flightTimes, timeRange]
        : prev.flightTimes.filter(t => t !== timeRange)
    }))
  }

  const handleStopsChange = (stop: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      stops: checked 
        ? [...prev.stops, stop]
        : prev.stops.filter(s => s !== stop)
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      priceRange: [availablePriceRange[0], availablePriceRange[1]],
      airlines: [],
      flightClasses: [],
      flightTimes: [],
      stops: []
    })
  }

  // Apply filters to flight data (you'll need to implement this in your context)
  
  const { applyFilters } = useFlight()

  const getTimeRange = (timeString: string) => {
    const time = new Date(timeString).getHours()
    if (time >= 6 && time < 12) return "صبح (۶-۱۲)"
    if (time >= 12 && time < 18) return "ظهر (۱۲-۱۸)"
    if (time >= 18 && time < 24) return "عصر (۱۸-۲۴)"
    return "شب (۰-۶)"
  }

  const getStopsCount = (flight: any) => {
    const totalSegments = flight.OriginDestinationOptions[0]?.FlightSegments?.length || 0
    return totalSegments > 1 ? `${totalSegments - 1} توقف` : "بدون توقف"
  }

  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">فیلترها</CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            حذف فیلترها
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Price Range Filter */}
        <div className="space-y-3">
          <Label className="flex justify-between">
            <span>محدوده قیمت (تومان)</span>
            <span className="text-xs text-muted-foreground">
              {filters.priceRange[0].toLocaleString('fa-IR')} - {filters.priceRange[1].toLocaleString('fa-IR')}
            </span>
          </Label>
          <Slider 
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            min={availablePriceRange[0]}
            max={availablePriceRange[1]}
            step={100000}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{availablePriceRange[0].toLocaleString('fa-IR')}</span>
            <span>{availablePriceRange[1].toLocaleString('fa-IR')}</span>
          </div>
        </div>

        {/* Airlines Filter */}
        <div className="space-y-3">
          <Label>ایرلاین</Label>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {availableAirlines.map((airline) => (
              <div key={airline} className="flex items-center gap-2">
                <Checkbox 
                  id={`airline-${airline}`}
                  checked={filters.airlines.includes(airline)}
                  onCheckedChange={(checked) => 
                    handleAirlineChange(airline, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`airline-${airline}`} 
                  className="text-sm cursor-pointer flex-1"
                >
                  {airline}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Flight Class Filter */}
        <div className="space-y-3">
          <Label>کلاس پرواز</Label>
          <div className="space-y-2">
            {[
              { value: "economy", label: "اکونومی" },
              { value: "business", label: "بیزینس" },
              { value: "first", label: "فرست کلاس" }
            ].map((flightClass) => (
              <div key={flightClass.value} className="flex items-center gap-2">
                <Checkbox 
                  id={`class-${flightClass.value}`}
                  checked={filters.flightClasses.includes(flightClass.value)}
                  onCheckedChange={(checked) => 
                    handleFlightClassChange(flightClass.value, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`class-${flightClass.value}`} 
                  className="text-sm cursor-pointer"
                >
                  {flightClass.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Flight Time Filter */}
        <div className="space-y-3">
          <Label>زمان پرواز</Label>
          <div className="space-y-2">
            {[
              "صبح (۶-۱۲)",
              "ظهر (۱۲-۱۸)", 
              "عصر (۱۸-۲۴)",
              "شب (۰-۶)"
            ].map((time) => (
              <div key={time} className="flex items-center gap-2">
                <Checkbox 
                  id={`time-${time}`}
                  checked={filters.flightTimes.includes(time)}
                  onCheckedChange={(checked) => 
                    handleFlightTimeChange(time, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`time-${time}`} 
                  className="text-sm cursor-pointer"
                >
                  {time}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Stops Filter */}
        <div className="space-y-3">
          <Label>تعداد توقف</Label>
          <div className="space-y-2">
            {[
              { value: "direct", label: "بدون توقف" },
              { value: "1-stop", label: "۱ توقف" },
              { value: "2-stops", label: "۲ توقف" }
            ].map((stop) => (
              <div key={stop.value} className="flex items-center gap-2">
                <Checkbox 
                  id={`stop-${stop.value}`}
                  checked={filters.stops.includes(stop.value)}
                  onCheckedChange={(checked) => 
                    handleStopsChange(stop.value, checked as boolean)
                  }
                />
                <label 
                  htmlFor={`stop-${stop.value}`} 
                  className="text-sm cursor-pointer"
                >
                  {stop.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Apply Filters Button */}
        <Button 
          onClick={() => applyFilters(filters)}
          className="w-full bg-blue-400 hover:bg-blue-500 text-xl font-black"
        >
          اعمال فیلترها
        </Button>
      </CardContent>
    </Card>
  )
}