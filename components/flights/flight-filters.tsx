"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
  ChevronUp,
  Luggage,
  Calendar,
  Building
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

interface FilterState {
  priceRange: [number, number]
  airlines: string[]
  flightClasses: string[]
  flightTimes: {
    origin: string[]
    destination: string[]
  }
  stops: {
    origin: string[]
    destination: string[]
  }
  baggage: {
    origin: string[]
    destination: string[]
  }
  airports: {
    origin: string[]
    destination: string[]
  }
  duration: {
    origin: [number, number]
    destination: [number, number]
  }
}

interface FlightSegment {
  DepartureDateTime: string
  ArrivalDateTime: string
  StopQuantity: number
  MarketingAirlineCode: string
  CabinClassCode: number
  Baggage?: string
  DepartureAirportLocationCode: string
  ArrivalAirportLocationCode: string
  JourneyDurationPerMinute: number
}

interface FlightData {
  IsPassportMandatory: boolean
  ValidatingAirlineCode: string
  AirItineraryPricingInfo: {
    ItinTotalFare: {
      TotalFare: number
      Currency: string
    }
  }
  OriginDestinationOptions: Array<{
    FlightSegments: FlightSegment[]
  }>
}

export function FlightFilters() {
  const { flightData, getAirlineName, applyFilters } = useFlight()
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 50000000],
    airlines: [],
    flightClasses: [],
    flightTimes: {
      origin: [],
      destination: []
    },
    stops: {
      origin: [],
      destination: []
    },
    baggage: {
      origin: [],
      destination: []
    },
    airports: {
      origin: [],
      destination: []
    },
    duration: {
      origin: [0, 1440], // 0 to 24 hours in minutes
      destination: [0, 1440]
    }
  })

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    airlines: true,
    class: true,
    time: true,
    stops: true,
    baggage: true,
    airports: true,
    duration: true
  })

  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeFilterSection, setActiveFilterSection] = useState<string | null>(null)

  // Check if it's a roundtrip
  const isRoundtrip = useMemo(() => {
    return flightData.some(flight => flight.OriginDestinationOptions?.length > 1)
  }, [flightData])

  // Get all available data for filters
  const {
    availablePriceRange,
    availableAirlines,
    availableFlightClasses,
    availableStops,
    availableBaggage,
    availableAirports,
    availableDurations,
    timeRanges,
    baggageOptions,
    stopOptions
  } = useMemo(() => {
    if (flightData.length === 0) {
      return {
        availablePriceRange: [0, 50000000] as [number, number],
        availableAirlines: [],
        availableFlightClasses: [],
        availableStops: { origin: [], destination: [] },
        availableBaggage: { origin: [], destination: [] },
        availableAirports: { origin: [], destination: [] },
        availableDurations: { origin: [0, 1440], destination: [0, 1440] },
        timeRanges: [],
        baggageOptions: [],
        stopOptions: []
      }
    }

    // Extract all prices
    const prices = flightData.map(f => f.AirItineraryPricingInfo.ItinTotalFare.TotalFare / 10)
    const minPrice = Math.min(...prices)
    const maxPrice = Math.max(...prices)

    // Extract all airlines
    const airlineMap = new Map()
    flightData.forEach(flight => {
      const code = flight.ValidatingAirlineCode
      const name = getAirlineName(code)
      if (code && name) {
        airlineMap.set(code, name)
      }
    })
    const airlines = Array.from(airlineMap.entries()).sort((a, b) => a[1].localeCompare(b[1]))

    // Extract all flight classes
    const flightClasses = new Set<string>()
    flightData.forEach(flight => {
      flight.OriginDestinationOptions?.forEach((option, index) => {
        option.FlightSegments?.forEach(segment => {
          const cabinCode = segment.CabinClassCode
          if (cabinCode) {
            let className = ""
            switch (cabinCode) {
              case 1: className = "economy"; break
              case 2: className = "business"; break
              case 3: className = "first"; break
              case 4: className = "premium"; break
              case 5: className = "economy"; break // Assuming 5 is also economy
              default: className = "economy"
            }
            flightClasses.add(className)
          }
        })
      })
    })

    // Extract stops information
    const stops = {
      origin: new Set<string>(),
      destination: new Set<string>()
    }

    // Extract baggage information
    const baggage = {
      origin: new Set<string>(),
      destination: new Set<string>()
    }

    // Extract airports
    const airports = {
      origin: new Set<string>(),
      destination: new Set<string>()
    }

    // Extract durations
    const durations = {
      origin: { min: 1440, max: 0 },
      destination: { min: 1440, max: 0 }
    }

    flightData.forEach(flight => {
      flight.OriginDestinationOptions?.forEach((option, index) => {
        const isOrigin = index === 0
        const isDestination = isRoundtrip ? index === 1 : false

        if (option.FlightSegments?.length > 0) {
          // Stops
          const stopCount = option.FlightSegments.length - 1
          const stopKey = stopCount === 0 ? "direct" :
            stopCount === 1 ? "1-stop" : "2-stops+"

          if (isOrigin) stops.origin.add(stopKey)
          if (isDestination) stops.destination.add(stopKey)

          // Baggage
          option.FlightSegments.forEach(segment => {
            if (segment.Baggage) {
              if (isOrigin) baggage.origin.add(segment.Baggage)
              if (isDestination) baggage.destination.add(segment.Baggage)
            }
          })

          // Airports
          option.FlightSegments.forEach(segment => {
            if (isOrigin) {
              airports.origin.add(segment.DepartureAirportLocationCode)
              airports.origin.add(segment.ArrivalAirportLocationCode)
            }
            if (isDestination) {
              airports.destination.add(segment.DepartureAirportLocationCode)
              airports.destination.add(segment.ArrivalAirportLocationCode)
            }
          })

          // Duration
          const totalDuration = option.JourneyDurationPerMinute ||
            option.FlightSegments.reduce((sum, seg) => sum + (seg.JourneyDurationPerMinute || 0), 0)

          if (isOrigin) {
            durations.origin.min = Math.min(durations.origin.min, totalDuration)
            durations.origin.max = Math.max(durations.origin.max, totalDuration)
          }
          if (isDestination) {
            durations.destination.min = Math.min(durations.destination.min, totalDuration)
            durations.destination.max = Math.max(durations.destination.max, totalDuration)
          }
        }
      })
    })

    // Time ranges for filtering
    const timeRanges = [
      { value: "صبح (۶-۱۲)", label: "صبح", time: "۶:۰۰ - ۱۲:۰۰" },
      { value: "ظهر (۱۲-۱۸)", label: "ظهر", time: "۱۲:۰۰ - ۱۸:۰۰" },
      { value: "عصر (۱۸-۲۴)", label: "عصر", time: "۱۸:۰۰ - ۲۴:۰۰" },
      { value: "شب (۰-۶)", label: "شب", time: "۰۰:۰۰ - ۶:۰۰" }
    ]

    // Baggage options
    const baggageOptions = [
      { value: "20 KG", label: "۲۰ کیلوگرم" },
      { value: "25 KG", label: "۲۵ کیلوگرم" },
      { value: "30 KG", label: "۳۰ کیلوگرم" },
      { value: "40 KG", label: "۴۰ کیلوگرم" },
      { value: "20K", label: "۲۰ کیلوگرم" },
      { value: "25K", label: "۲۵ کیلوگرم" },
      { value: "30K", label: "۳۰ کیلوگرم" },
      { value: "40K", label: "۴۰ کیلوگرم" }
    ]

    // Stop options
    const stopOptions = [
      { value: "direct", label: "بدون توقف", description: "پرواز مستقیم" },
      { value: "1-stop", label: "۱ توقف", description: "یک توقف" },
      { value: "2-stops+", label: "۲ توقف یا بیشتر", description: "دو توقف یا بیشتر" }
    ]

    return {
      availablePriceRange: [minPrice, maxPrice] as [number, number],
      availableAirlines: airlines,
      availableFlightClasses: Array.from(flightClasses),
      availableStops: {
        origin: Array.from(stops.origin),
        destination: Array.from(stops.destination)
      },
      availableBaggage: {
        origin: Array.from(baggage.origin),
        destination: Array.from(baggage.destination)
      },
      availableAirports: {
        origin: Array.from(airports.origin),
        destination: Array.from(airports.destination)
      },
      availableDurations: {
        origin: [durations.origin.min, durations.origin.max] as [number, number],
        destination: [durations.destination.min, durations.destination.max] as [number, number]
      },
      timeRanges,
      baggageOptions,
      stopOptions
    }
  }, [flightData, isRoundtrip])

  // Initialize filters when data loads
  useEffect(() => {
    if (flightData.length > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [availablePriceRange[0], availablePriceRange[1]],
        duration: {
          origin: [availableDurations.origin[0], availableDurations.origin[1]],
          destination: [availableDurations.destination[0], availableDurations.destination[1]]
        }
      }))
    }
  }, [flightData.length])

  // Helper function to get time range from datetime
  const getTimeRange = useCallback((timeString: string) => {
    if (!timeString) return ""
    const time = new Date(timeString).getHours()
    if (time >= 6 && time < 12) return "صبح (۶-۱۲)"
    if (time >= 12 && time < 18) return "ظهر (۱۲-۱۸)"
    if (time >= 18 && time < 24) return "عصر (۱۸-۲۴)"
    return "شب (۰-۶)"
  }, [])

  // Function to apply filters immediately (for desktop)
  const applyFiltersImmediately = useCallback(() => {
    applyFilters(filters)
  }, [filters, applyFilters])

  // Apply filters when any filter changes (for desktop)
  useEffect(() => {
    if (flightData.length === 0) return

    const isDesktop = window.innerWidth >= 1024
    if (isDesktop) {
      const timeoutId = setTimeout(() => {
        applyFilters(filters)
      }, 10)

      return () => clearTimeout(timeoutId)
    }
  }, [filters, flightData.length])

  // Filter handlers
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

  const handleFlightTimeChange = (timeRange: string, checked: boolean, segment: 'origin' | 'destination') => {
    setFilters(prev => ({
      ...prev,
      flightTimes: {
        ...prev.flightTimes,
        [segment]: checked
          ? [...prev.flightTimes[segment], timeRange]
          : prev.flightTimes[segment].filter(t => t !== timeRange)
      }
    }))
  }

  const handleStopsChange = (stop: string, checked: boolean, segment: 'origin' | 'destination') => {
    setFilters(prev => ({
      ...prev,
      stops: {
        ...prev.stops,
        [segment]: checked
          ? [...prev.stops[segment], stop]
          : prev.stops[segment].filter(s => s !== stop)
      }
    }))
  }

  const handleBaggageChange = (baggage: string, checked: boolean, segment: 'origin' | 'destination') => {
    setFilters(prev => ({
      ...prev,
      baggage: {
        ...prev.baggage,
        [segment]: checked
          ? [...prev.baggage[segment], baggage]
          : prev.baggage[segment].filter(b => b !== baggage)
      }
    }))
  }

  const handleAirportChange = (airport: string, checked: boolean, segment: 'origin' | 'destination') => {
    setFilters(prev => ({
      ...prev,
      airports: {
        ...prev.airports,
        [segment]: checked
          ? [...prev.airports[segment], airport]
          : prev.airports[segment].filter(a => a !== airport)
      }
    }))
  }

  const handleDurationChange = (value: number[], segment: 'origin' | 'destination') => {
    setFilters(prev => ({
      ...prev,
      duration: {
        ...prev.duration,
        [segment]: value as [number, number]
      }
    }))
  }

  const clearAllFilters = () => {
    const newFilters = {
      priceRange: [availablePriceRange[0], availablePriceRange[1]],
      airlines: [],
      flightClasses: [],
      flightTimes: { origin: [], destination: [] },
      stops: { origin: [], destination: [] },
      baggage: { origin: [], destination: [] },
      airports: { origin: [], destination: [] },
      duration: {
        origin: [availableDurations.origin[0], availableDurations.origin[1]],
        destination: [availableDurations.destination[0], availableDurations.destination[1]]
      }
    }
    setFilters(newFilters)
    applyFilters(newFilters)
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleApplyFilters = () => {
    const isMobile = window.innerWidth < 1024
    if (isMobile) {
      applyFilters(filters)
    }
    setIsSheetOpen(false)
    setActiveFilterSection(null)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.priceRange[0] > availablePriceRange[0] || filters.priceRange[1] < availablePriceRange[1]) count++
    count += filters.airlines.length
    count += filters.flightClasses.length
    count += filters.flightTimes.origin.length
    count += filters.flightTimes.destination.length
    count += filters.stops.origin.length
    count += filters.stops.destination.length
    count += filters.baggage.origin.length
    count += filters.baggage.destination.length
    count += filters.airports.origin.length
    count += filters.airports.destination.length
    if (filters.duration.origin[0] > availableDurations.origin[0] || filters.duration.origin[1] < availableDurations.origin[1]) count++
    if (filters.duration.destination[0] > availableDurations.destination[0] || filters.duration.destination[1] < availableDurations.destination[1]) count++
    return count
  }

  const openFilterSection = (section: string) => {
    setActiveFilterSection(section)
    setIsSheetOpen(true)
  }

  const getFilterBadgeCount = (section: string) => {
    switch (section) {
      case 'price':
        return filters.priceRange[0] > availablePriceRange[0] || filters.priceRange[1] < availablePriceRange[1] ? 1 : 0
      case 'airlines':
        return filters.airlines.length
      case 'class':
        return filters.flightClasses.length
      case 'time':
        return filters.flightTimes.origin.length + filters.flightTimes.destination.length
      case 'stops':
        return filters.stops.origin.length + filters.stops.destination.length
      case 'baggage':
        return filters.baggage.origin.length + filters.baggage.destination.length
      case 'airports':
        return filters.airports.origin.length + filters.airports.destination.length
      case 'duration':
        let count = 0
        if (filters.duration.origin[0] > availableDurations.origin[0] || filters.duration.origin[1] < availableDurations.origin[1]) count++
        if (filters.duration.destination[0] > availableDurations.destination[0] || filters.duration.destination[1] < availableDurations.destination[1]) count++
        return count
      default:
        return 0
    }
  }

  const FlightLogo = ({ airlineCode = "", width = 8, height = 8 }) => {
    const [logoError, setLogoError] = useState(false)

    const handleImageError = () => {
      setLogoError(true)
    }

    return (
      <Image
        src={logoError ? `/assets/airline/logos/default.png` : `/assets/airline/logos/${airlineCode}.png`}
        alt={`${airlineCode} airline logo`}
        width={100}
        height={100}
        className={`w-${width} h-${height}`}
        onError={handleImageError}
      />
    )
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

  const FilterContent = ({ showAllSections = true }) => {
    const isMobile = typeof window !== 'undefined' ? window.innerWidth < 1024 : false

    const renderSegmentFilters = (title: string, segment: 'origin' | 'destination') => (
      <div className="space-y-4 mb-6 last:mb-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-700">{title}</h4>
          {segment === 'destination' && !isRoundtrip && (
            <span className="text-xs text-gray-500">(غیرفعال - پرواز یک‌طرفه)</span>
          )}
        </div>
        {isRoundtrip || segment === 'origin' ? (
          <div className="space-y-3 pr-2">
            {timeRanges.map((time) => (
              <div key={`${segment}-${time.value}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Checkbox
                  id={`time-${segment}-${time.value}`}
                  checked={filters.flightTimes[segment].includes(time.value)}
                  onCheckedChange={(checked) => {
                    handleFlightTimeChange(time.value, checked as boolean, segment)
                    if (!isMobile) {
                      setTimeout(() => applyFiltersImmediately(), 10)
                    }
                  }}
                  disabled={segment === 'destination' && !isRoundtrip}
                />
                <div className="flex-1 text-right">
                  <label
                    htmlFor={`time-${segment}-${time.value}`}
                    className="text-sm font-medium cursor-pointer block"
                  >
                    {time.label}
                  </label>
                  <span className="text-xs text-gray-500">{time.time}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">تنها برای پروازهای دو‌طرفه فعال است</p>
        )}
      </div>
    )

    const renderStopsFilters = (title: string, segment: 'origin' | 'destination') => (
      <div className="space-y-4 mb-6 last:mb-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-700">{title}</h4>
          {segment === 'destination' && !isRoundtrip && (
            <span className="text-xs text-gray-500">(غیرفعال - پرواز یک‌طرفه)</span>
          )}
        </div>
        {isRoundtrip || segment === 'origin' ? (
          <div className="space-y-3 pr-2">
            {stopOptions
              .filter(stop => availableStops[segment].includes(stop.value))
              .map((stop) => (
                <div key={`${segment}-${stop.value}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Checkbox
                    id={`stop-${segment}-${stop.value}`}
                    checked={filters.stops[segment].includes(stop.value)}
                    onCheckedChange={(checked) => {
                      handleStopsChange(stop.value, checked as boolean, segment)
                      if (!isMobile) {
                        setTimeout(() => applyFiltersImmediately(), 10)
                      }
                    }}
                    disabled={segment === 'destination' && !isRoundtrip}
                  />
                  <div className="flex-1 text-right">
                    <label
                      htmlFor={`stop-${segment}-${stop.value}`}
                      className="text-sm font-medium cursor-pointer block"
                    >
                      {stop.label}
                    </label>
                    <span className="text-xs text-gray-500">{stop.description}</span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">تنها برای پروازهای دو‌طرفه فعال است</p>
        )}
      </div>
    )

    const renderBaggageFilters = (title: string, segment: 'origin' | 'destination') => (
      <div className="space-y-4 mb-6 last:mb-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-700">{title}</h4>
          {segment === 'destination' && !isRoundtrip && (
            <span className="text-xs text-gray-500">(غیرفعال - پرواز یک‌طرفه)</span>
          )}
        </div>
        {isRoundtrip || segment === 'origin' ? (
          <div className="space-y-3 pr-2">
            {baggageOptions
              .filter(bag => availableBaggage[segment].includes(bag.value))
              .map((baggage) => (
                <div key={`${segment}-${baggage.value}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Checkbox
                    id={`baggage-${segment}-${baggage.value}`}
                    checked={filters.baggage[segment].includes(baggage.value)}
                    onCheckedChange={(checked) => {
                      handleBaggageChange(baggage.value, checked as boolean, segment)
                      if (!isMobile) {
                        setTimeout(() => applyFiltersImmediately(), 10)
                      }
                    }}
                    disabled={segment === 'destination' && !isRoundtrip}
                  />
                  <div className="flex-1 text-right">
                    <label
                      htmlFor={`baggage-${segment}-${baggage.value}`}
                      className="text-sm font-medium cursor-pointer block"
                    >
                      {baggage.label}
                    </label>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">تنها برای پروازهای دو‌طرفه فعال است</p>
        )}
      </div>
    )

    const renderAirportFilters = (title: string, segment: 'origin' | 'destination') => (
      <div className="space-y-4 mb-6 last:mb-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-700">{title}</h4>
          {segment === 'destination' && !isRoundtrip && (
            <span className="text-xs text-gray-500">(غیرفعال - پرواز یک‌طرفه)</span>
          )}
        </div>
        {isRoundtrip || segment === 'origin' ? (
          <div className="space-y-3 pr-2 max-h-48 overflow-y-auto">
            {availableAirports[segment].map((airport) => (
              <div key={`${segment}-${airport}`} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Checkbox
                  id={`airport-${segment}-${airport}`}
                  checked={filters.airports[segment].includes(airport)}
                  onCheckedChange={(checked) => {
                    handleAirportChange(airport, checked as boolean, segment)
                    if (!isMobile) {
                      setTimeout(() => applyFiltersImmediately(), 10)
                    }
                  }}
                  disabled={segment === 'destination' && !isRoundtrip}
                />
                <label
                  htmlFor={`airport-${segment}-${airport}`}
                  className="text-sm cursor-pointer flex-1 text-right"
                >
                  {airport}
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">تنها برای پروازهای دو‌طرفه فعال است</p>
        )}
      </div>
    )

    const renderDurationFilters = (title: string, segment: 'origin' | 'destination') => (
      <div className="space-y-4 mb-6 last:mb-0">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-sm text-gray-700">{title}</h4>
          {segment === 'destination' && !isRoundtrip && (
            <span className="text-xs text-gray-500">(غیرفعال - پرواز یک‌طرفه)</span>
          )}
        </div>
        {isRoundtrip || segment === 'origin' ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">مدت زمان (دقیقه)</Label>
              <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                {filters.duration[segment][1]} - {filters.duration[segment][0]}
              </span>
            </div>
            <Slider
              value={filters.duration[segment]}
              onValueChange={(value) => handleDurationChange(value, segment)}
              min={availableDurations[segment][0]}
              max={availableDurations[segment][1]}
              step={30}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{availableDurations[segment][0]} دقیقه</span>
              <span>{availableDurations[segment][1]} دقیقه</span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-2">تنها برای پروازهای دو‌طرفه فعال است</p>
        )}
      </div>
    )

    return (
      <div className="space-y-6">
        {/* Active Filters Badge */}
        {showAllSections && getActiveFiltersCount() > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">فیلترهای فعال:</span>
            <Badge variant="secondary" className="bg-blue-50 text-blue-700">
              {getActiveFiltersCount()} فیلتر
            </Badge>
          </div>
        )}

        {/* Price Range Filter */}
        {(showAllSections || activeFilterSection === 'price') && (
          <FilterSection title="محدوده قیمت" sectionKey="price" icon={DollarSign}>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-sm font-medium">قیمت (تومان)</Label>
                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full">
                  {filters.priceRange[1].toLocaleString('fa-IR')} - {filters.priceRange[0].toLocaleString('fa-IR')}
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
        )}

        {/* Airlines Filter */}
        {(showAllSections || activeFilterSection === 'airlines') && (
          <FilterSection title="ایرلاین‌ها" sectionKey="airlines" icon={Plane}>
            <div className="space-y-3 max-h-48 overflow-y-auto">
              {availableAirlines.map(([code, name]) => (
                <div key={code} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <div>
                    <FlightLogo airlineCode={code} />
                  </div>
                  <Checkbox
                    id={`airline-${code}`}
                    checked={filters.airlines.includes(name)}
                    onCheckedChange={(checked) => {
                      handleAirlineChange(name, checked as boolean)
                      if (!isMobile) {
                        setTimeout(() => applyFiltersImmediately(), 10)
                      }
                    }}
                  />
                  <label
                    htmlFor={`airline-${code}`}
                    className="text-sm cursor-pointer flex-1 text-right"
                  >
                    {name}
                  </label>
                </div>
              ))}
            </div>
          </FilterSection>
        )}

        {/* Flight Class Filter */}
        {(showAllSections || activeFilterSection === 'class') && (
          <FilterSection title="کلاس پرواز" sectionKey="class" icon={Plane}>
            <div className="space-y-3">
              {[
                { value: "economy", label: "اکونومی", description: "کلاس اقتصادی" },
                { value: "business", label: "بیزینس", description: "کلاس تجاری" },
                { value: "first", label: "فرست کلاس", description: "کلاس اول" },
                { value: "premium", label: "پریمیوم", description: "اکونومی ویژه" }
              ].filter(fc => availableFlightClasses.includes(fc.value))
                .map((flightClass) => (
                  <div key={flightClass.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <Checkbox
                      id={`class-${flightClass.value}`}
                      checked={filters.flightClasses.includes(flightClass.value)}
                      onCheckedChange={(checked) => {
                        handleFlightClassChange(flightClass.value, checked as boolean)
                        if (!isMobile) {
                          setTimeout(() => applyFiltersImmediately(), 10)
                        }
                      }}
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
        )}

        {/* Flight Time Filter */}
        {(showAllSections || activeFilterSection === 'time') && (
          <FilterSection title="زمان پرواز" sectionKey="time" icon={Clock}>
            <div className="space-y-6">
              {renderSegmentFilters("زمان رفت", "origin")}
              {isRoundtrip && renderSegmentFilters("زمان برگشت", "destination")}
            </div>
          </FilterSection>
        )}

        {/* Stops Filter */}
        {(showAllSections || activeFilterSection === 'stops') && (
          <FilterSection title="توقف‌ها" sectionKey="stops" icon={Layers}>
            <div className="space-y-6">
              {renderStopsFilters("توقف رفت", "origin")}
              {isRoundtrip && renderStopsFilters("توقف برگشت", "destination")}
            </div>
          </FilterSection>
        )}

        {/* Baggage Filter */}
        {(showAllSections || activeFilterSection === 'baggage') && (
          <FilterSection title="بار مجاز" sectionKey="baggage" icon={Luggage}>
            <div className="space-y-6">
              {renderBaggageFilters("بار مجاز رفت", "origin")}
              {isRoundtrip && renderBaggageFilters("بار مجاز برگشت", "destination")}
            </div>
          </FilterSection>
        )}

        {/* Airports Filter */}
        {(showAllSections || activeFilterSection === 'airports') && (
          <FilterSection title="فرودگاه‌ها" sectionKey="airports" icon={Building}>
            <div className="space-y-6">
              {renderAirportFilters("فرودگاه‌های رفت", "origin")}
              {isRoundtrip && renderAirportFilters("فرودگاه‌های برگشت", "destination")}
            </div>
          </FilterSection>
        )}

        {/* Duration Filter */}
        {(showAllSections || activeFilterSection === 'duration') && (
          <FilterSection title="مدت زمان پرواز" sectionKey="duration" icon={Clock}>
            <div className="space-y-6">
              {renderDurationFilters("مدت زمان رفت", "origin")}
              {isRoundtrip && renderDurationFilters("مدت زمان برگشت", "destination")}
            </div>
          </FilterSection>
        )}
      </div>
    )
  }

  const FilterTriggerButton = ({
    section,
    title,
    icon: Icon
  }: {
    section: string
    title: string
    icon: any
  }) => (
    <Button
      variant="outline"
      className="flex items-center gap-2 py-2 px-3 rounded-full border-blue-900 shadow-sm"
      onClick={() => openFilterSection(section)}
    >
      <Icon className="h-4 w-4" />
      {title}
      {getFilterBadgeCount(section) > 0 && (
        <Badge variant="secondary" className="h-5 w-5 min-w-5 p-0 flex items-center justify-center text-xs bg-blue-500 text-white">
          {getFilterBadgeCount(section)}
        </Badge>
      )}
    </Button>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Card className="sticky top-20 border border-blue-900 lg:overflow-auto text-blue-900" style={{ scrollbarWidth: 'none' }}>
          <CardHeader className="pb-3 lg:pt-6 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                فیلترها
                {isRoundtrip && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                    دو‌طرفه
                  </Badge>
                )}
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
            <FilterContent showAllSections={true} />
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Buttons */}
      <div className="lg:hidden absolute top-14 right-0 w-full bg-[#fffefe] py-2 px-2 z-40">
        <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
          {/* Main Filters Button */}
          <Sheet open={isSheetOpen && !activeFilterSection} onOpenChange={(open) => {
            setIsSheetOpen(open)
            if (!open) setActiveFilterSection(null)
          }}>
            <SheetTrigger asChild>
              <Button className="shadow-lg py-2 px-4 text-lg font-medium text-blue-950 bg-[#fffefe] border-black border rounded-full">
                <Filter className="h-5 w-5 ml-2" />
                فیلترها
                {getActiveFiltersCount() > 0 && (
                  <Badge className="mr-2 bg-[#fffefe] text-blue-950 px-2 py-1 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
                {isRoundtrip && (
                  <Badge variant="outline" className="mr-1 text-xs bg-blue-50 text-blue-700 border-blue-200">
                    دو‌طرفه
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
                    {isRoundtrip && (
                      <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                        دو‌طرفه
                      </Badge>
                    )}
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
                  </div>
                </div>
              </SheetHeader>
              <div className="h-max overflow-y-auto py-4">
                <FilterContent showAllSections={true} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#fffefe] border-t">
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

          {/* Individual Filter Buttons */}
          <FilterTriggerButton section="price" title="قیمت" icon={DollarSign} />
          <FilterTriggerButton section="airlines" title="ایرلاین" icon={Plane} />
          <FilterTriggerButton section="class" title="کلاس" icon={Plane} />
          <FilterTriggerButton section="time" title="زمان" icon={Clock} />
          <FilterTriggerButton section="stops" title="توقف" icon={Layers} />
          <FilterTriggerButton section="baggage" title="بار" icon={Luggage} />
          <FilterTriggerButton section="duration" title="مدت" icon={Clock} />
        </div>

        {/* Individual Filter Modals */}
        <Sheet open={isSheetOpen && !!activeFilterSection} onOpenChange={(open) => {
          setIsSheetOpen(open)
          if (!open) setActiveFilterSection(null)
        }}>
          <SheetContent side="bottom" className="h-max rounded-t-3xl">
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  {activeFilterSection === 'price' && <DollarSign className="h-5 w-5" />}
                  {activeFilterSection === 'airlines' && <Plane className="h-5 w-5" />}
                  {activeFilterSection === 'class' && <Plane className="h-5 w-5" />}
                  {activeFilterSection === 'time' && <Clock className="h-5 w-5" />}
                  {activeFilterSection === 'stops' && <Layers className="h-5 w-5" />}
                  {activeFilterSection === 'baggage' && <Luggage className="h-5 w-5" />}
                  {activeFilterSection === 'duration' && <Clock className="h-5 w-5" />}
                  {activeFilterSection === 'price' && 'محدوده قیمت'}
                  {activeFilterSection === 'airlines' && 'ایرلاین‌ها'}
                  {activeFilterSection === 'class' && 'کلاس پرواز'}
                  {activeFilterSection === 'time' && 'زمان پرواز'}
                  {activeFilterSection === 'stops' && 'توقف‌ها'}
                  {activeFilterSection === 'baggage' && 'بار مجاز'}
                  {activeFilterSection === 'duration' && 'مدت زمان پرواز'}
                </SheetTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsSheetOpen(false)
                    setActiveFilterSection(null)
                  }}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
            <div className="h-max overflow-y-auto p-4 pb-24">
              <FilterContent showAllSections={false} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#fffefe] border-t">
              <Button
                onClick={handleApplyFilters}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-14 text-lg"
                size="lg"
              >
                اعمال فیلتر
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}