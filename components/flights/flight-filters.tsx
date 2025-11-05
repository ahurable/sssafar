"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useFlight } from "@/contexts/search/FlightContext"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { 
  Filter, 
  X, 
  Plane,
  Clock,
  Layers,
  DollarSign,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FilterState {
  priceRange: [number, number]
  airlines: string[]
  flightClasses: string[]
  flightTimes: string[]
  stops: string[]
}

export function FlightFilters() {
  const { flightData, getAirlineName, applyFilters } = useFlight()
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50000000],
    airlines: [],
    flightClasses: [],
    flightTimes: [],
    stops: []
  })
  
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    airlines: true,
    class: true,
    time: true,
    stops: true
  })
  
  const [isSheetOpen, setIsSheetOpen] = useState(false)

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

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleApplyFilters = () => {
    applyFilters(filters)
    setIsSheetOpen(false)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.priceRange[0] > availablePriceRange[0] || filters.priceRange[1] < availablePriceRange[1]) count++
    count += filters.airlines.length
    count += filters.flightClasses.length
    count += filters.flightTimes.length
    count += filters.stops.length
    return count
  }

  const FilterSection = ({ 
    title, 
    sectionKey, 
    icon: Icon, 
    children 
  }: { 
    title: string
    sectionKey: string
    icon: any
    children: React.ReactNode
  }) => (
    <div className="border-b border-gray-100 pb-4 last:border-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full py-3 text-right"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {openSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {openSections[sectionKey] && (
        <div className="mt-2 space-y-3">
          {children}
        </div>
      )}
    </div>
  )

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Active Filters Badge */}
      {getActiveFiltersCount() > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">فیلترهای فعال:</span>
          <Badge variant="secondary" className="bg-blue-50 text-blue-700">
            {getActiveFiltersCount()} فیلتر
          </Badge>
        </div>
      )}

      {/* Price Range Filter */}
      <FilterSection title="محدوده قیمت" sectionKey="price" icon={DollarSign}>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Label className="text-sm font-medium">قیمت (تومان)</Label>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
              {filters.priceRange[0].toLocaleString('fa-IR')} - {filters.priceRange[1].toLocaleString('fa-IR')}
            </span>
          </div>
          <Slider 
            value={filters.priceRange}
            onValueChange={handlePriceChange}
            min={availablePriceRange[0]}
            max={availablePriceRange[1]}
            step={100000}
            className="mt-2"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>{availablePriceRange[0].toLocaleString('fa-IR')}</span>
            <span>{availablePriceRange[1].toLocaleString('fa-IR')}</span>
          </div>
        </div>
      </FilterSection>

      {/* Airlines Filter */}
      <FilterSection title="ایرلاین‌ها" sectionKey="airlines" icon={Plane}>
        <div className="space-y-3 max-h-48 overflow-y-auto">
          {availableAirlines.map((airline) => (
            <div key={airline} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Checkbox 
                id={`airline-${airline}`}
                checked={filters.airlines.includes(airline)}
                onCheckedChange={(checked) => 
                  handleAirlineChange(airline, checked as boolean)
                }
              />
              <label 
                htmlFor={`airline-${airline}`} 
                className="text-sm cursor-pointer flex-1 text-right"
              >
                {airline}
              </label>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Flight Class Filter */}
      <FilterSection title="کلاس پرواز" sectionKey="class" icon={Plane}>
        <div className="space-y-3">
          {[
            { value: "economy", label: "اکونومی", description: "کلاس اقتصادی" },
            { value: "business", label: "بیزینس", description: "کلاس تجاری" },
            { value: "first", label: "فرست کلاس", description: "کلاس اول" }
          ].map((flightClass) => (
            <div key={flightClass.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Checkbox 
                id={`class-${flightClass.value}`}
                checked={filters.flightClasses.includes(flightClass.value)}
                onCheckedChange={(checked) => 
                  handleFlightClassChange(flightClass.value, checked as boolean)
                }
              />
              <div className="flex-1 text-right">
                <label 
                  htmlFor={`class-${flightClass.value}`} 
                  className="text-sm font-medium cursor-pointer block"
                >
                  {flightClass.label}
                </label>
                <span className="text-xs text-gray-500">{flightClass.description}</span>
              </div>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Flight Time Filter */}
      <FilterSection title="زمان پرواز" sectionKey="time" icon={Clock}>
        <div className="space-y-3">
          {[
            { value: "صبح (۶-۱۲)", label: "صبح", time: "۶:۰۰ - ۱۲:۰۰" },
            { value: "ظهر (۱۲-۱۸)", label: "ظهر", time: "۱۲:۰۰ - ۱۸:۰۰" },
            { value: "عصر (۱۸-۲۴)", label: "عصر", time: "۱۸:۰۰ - ۲۴:۰۰" },
            { value: "شب (۰-۶)", label: "شب", time: "۰۰:۰۰ - ۶:۰۰" }
          ].map((time) => (
            <div key={time.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Checkbox 
                id={`time-${time.value}`}
                checked={filters.flightTimes.includes(time.value)}
                onCheckedChange={(checked) => 
                  handleFlightTimeChange(time.value, checked as boolean)
                }
              />
              <div className="flex-1 text-right">
                <label 
                  htmlFor={`time-${time.value}`} 
                  className="text-sm font-medium cursor-pointer block"
                >
                  {time.label}
                </label>
                <span className="text-xs text-gray-500">{time.time}</span>
              </div>
            </div>
          ))}
        </div>
      </FilterSection>

      {/* Stops Filter */}
      <FilterSection title="توقف‌ها" sectionKey="stops" icon={Layers}>
        <div className="space-y-3">
          {[
            { value: "direct", label: "بدون توقف", description: "پرواز مستقیم" },
            { value: "1-stop", label: "۱ توقف", description: "یک توقف" },
            { value: "2-stops", label: "۲ توقف", description: "دو توقف" }
          ].map((stop) => (
            <div key={stop.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
              <Checkbox 
                id={`stop-${stop.value}`}
                checked={filters.stops.includes(stop.value)}
                onCheckedChange={(checked) => 
                  handleStopsChange(stop.value, checked as boolean)
                }
              />
              <div className="flex-1 text-right">
                <label 
                  htmlFor={`stop-${stop.value}`} 
                  className="text-sm font-medium cursor-pointer block"
                >
                  {stop.label}
                </label>
                <span className="text-xs text-gray-500">{stop.description}</span>
              </div>
            </div>
          ))}
        </div>
      </FilterSection>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Card className="sticky top-20 shadow-sm border-0">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                فیلترها
              </CardTitle>
              {getActiveFiltersCount() > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 h-8"
                >
                  حذف همه
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <FilterContent />
            <Button 
              onClick={handleApplyFilters}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium mt-6 h-12 text-base"
            >
              اعمال فیلترها
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden fixed bottom-6 left-6 right-6 z-40">
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button className="w-full shadow-lg h-14 text-lg font-medium bg-blue-600 hover:bg-blue-700 text-white">
              <Filter className="h-5 w-5 ml-2" />
              فیلترها
              {getActiveFiltersCount() > 0 && (
                <Badge className="mr-2 bg-white text-blue-600 px-2 py-1 text-xs">
                  {getActiveFiltersCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  فیلترها
                </SheetTitle>
                <div className="flex items-center gap-2">
                  {getActiveFiltersCount() > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="text-xs text-gray-500 hover:text-gray-700"
                    >
                      حذف همه
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsSheetOpen(false)}
                    className="p-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </SheetHeader>
            <div className="h-[calc(90vh-140px)] overflow-y-auto py-4">
              <FilterContent />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t">
              <Button 
                onClick={handleApplyFilters}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-14 text-lg"
                size="lg"
              >
                نمایش نتایج
                <span className="text-blue-100 mr-2">
                  ({getActiveFiltersCount()} فیلتر فعال)
                </span>
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}