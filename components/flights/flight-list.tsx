"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Plane,
  Clock,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Clock4,
  ArrowUp,
  ArrowDown,
  X,
  ChevronDown
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useFlight } from "@/contexts/search/FlightContext"
import Image from "next/image"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// Types based on your API response
interface FlightSegment {
  ArrivalAirportLocationCode: string
  DepartureAirportLocationCode: string
  DepartureDateTime: string
  ArrivalDateTime: string
  MarketingAirlineCode: string
  FlightNumber: string
  JourneyDuration: string
  OperatingAirline: {
    Code: string
    Equipment: string
  }
  SeatsRemaining: number
}

interface OriginDestinationOption {
  FlightSegments: FlightSegment[]
  JourneyDurationPerMinute: number
}

interface FlightPricing {
  ItinTotalFare: {
    TotalFare: number
    Currency: string
    BaseFare: number
    TotalTax: number
  }
}

interface Flight {
  OriginDestinationOptions: OriginDestinationOption[]
  AirItineraryPricingInfo: FlightPricing
  ValidatingAirlineCode: string
  FareSourceCode: string
}

interface FlightListProps {
  flights: Flight[],
  area: string,
  itemsPerPage?: number
}

interface FilterState {
  airlines: string[]
  stops: string[]
  sortBy: 'price-asc' | 'price-desc' | 'duration-asc' | 'duration-desc' | 'departure-asc' | 'departure-desc' | null
}

export function FlightList({ flights, area, itemsPerPage = 10 }: FlightListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [userLoading, setUserLoading] = useState(true)
  const router = useRouter()
  const { getAirlineName, flightRequest, setFlightRequest, searchFlights, applyFilters, flightData } = useFlight()
  const [filters, setFilters] = useState<FilterState>({
    airlines: [],
    stops: [],
    sortBy: null
  })

  const [user, setUser] = useState<any>(null)
  const [openDropdown, setOpenDropdown] = useState<'stops' | 'airlines' | null>(null)

  // Refs for dropdown closing
  const stopsDropdownRef = useRef<HTMLDivElement>(null)
  const airlinesDropdownRef = useRef<HTMLDivElement>(null)

  // Generate dates for the next 7 days
  const generateDates = () => {
    const dates = []
    const today = new Date()

    for (let i = 0; i < 14; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }

    return dates
  }

  const availableAirlines = Array.from(
    new Map(
      flightData.map(flight => [
        flight.ValidatingAirlineCode,
        [getAirlineName(flight.ValidatingAirlineCode), flight.ValidatingAirlineCode]
      ])
    ).values()
  ).sort((a, b) => a[0].localeCompare(b[0]))

  // Filter and sort function
  const getFilteredAndSortedFlights = () => {
    // Start with all flights
    let result = [...flights]

    // Apply airline filter
    if (filters.airlines.length > 0) {
      result = result.filter(flight => filters.airlines.includes(flight.ValidatingAirlineCode))
    }

    // Apply stops filter
    if (filters.stops.length > 0) {
      result = result.filter(flight => {
        const stopsCount = flight.OriginDestinationOptions[0]?.FlightSegments.length - 1
        const stopType = stopsCount === 0 ? 'direct' :
          stopsCount === 1 ? '1-stop' :
            '2-stops'
        return filters.stops.includes(stopType)
      })
    }

    // Apply sorting
    if (filters.sortBy) {
      result.sort((a, b) => {
        switch (filters.sortBy) {
          case 'price-asc':
            return a.AirItineraryPricingInfo.ItinTotalFare.TotalFare - b.AirItineraryPricingInfo.ItinTotalFare.TotalFare
          case 'price-desc':
            return b.AirItineraryPricingInfo.ItinTotalFare.TotalFare - a.AirItineraryPricingInfo.ItinTotalFare.TotalFare
          case 'duration-asc':
            return (a.OriginDestinationOptions[0]?.JourneyDurationPerMinute || 0) - (b.OriginDestinationOptions[0]?.JourneyDurationPerMinute || 0)
          case 'duration-desc':
            return (b.OriginDestinationOptions[0]?.JourneyDurationPerMinute || 0) - (a.OriginDestinationOptions[0]?.JourneyDurationPerMinute || 0)
          case 'departure-asc':
            return new Date(a.OriginDestinationOptions[0]?.FlightSegments[0]?.DepartureDateTime).getTime() -
              new Date(b.OriginDestinationOptions[0]?.FlightSegments[0]?.DepartureDateTime).getTime()
          case 'departure-desc':
            return new Date(b.OriginDestinationOptions[0]?.FlightSegments[0]?.DepartureDateTime).getTime() -
              new Date(a.OriginDestinationOptions[0]?.FlightSegments[0]?.DepartureDateTime).getTime()
          default:
            return 0
        }
      })
    }

    return result
  }

  // Get filtered and sorted flights
  const filteredFlights = getFilteredAndSortedFlights()

  // Calculate pagination
  const totalPages = Math.ceil(filteredFlights.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentFlights = filteredFlights.slice(startIndex, startIndex + itemsPerPage)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (stopsDropdownRef.current && !stopsDropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(prev => prev === 'stops' ? null : prev)
      }
      if (airlinesDropdownRef.current && !airlinesDropdownRef.current.contains(event.target as Node)) {
        setOpenDropdown(prev => prev === 'airlines' ? null : prev)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAirlineChange = (airlineCode: string) => {
    setFilters(prev => {
      const newAirlines = prev.airlines.includes(airlineCode)
        ? prev.airlines.filter(a => a !== airlineCode)
        : [...prev.airlines, airlineCode]

      return {
        ...prev,
        airlines: newAirlines
      }
    })

    // Use a timeout to ensure state is updated before applying filters
    setTimeout(() => {
      setFilters(current => {
        // const filtersToApply = {
        //   priceRange: [0, 50000000],
        //   airlines: current.airlines,
        //   flightClasses: [],
        //   flightTimes: [],
        //   stops: current.stops
        // }
        // applyFilters(filtersToApply)
        return current
      })
    }, 0)
  }

  const handleStopsChange = (stopType: string) => {
    setFilters(prev => {
      const newStops = prev.stops.includes(stopType)
        ? prev.stops.filter(s => s !== stopType)
        : [...prev.stops, stopType]

      const newFilters = {
        ...prev,
        stops: newStops
      }

      // Apply filters immediately
      applyFilters({
        priceRange: [0, 50000000], // Reset price range
        airlines: prev.airlines,
        flightClasses: [],
        flightTimes: [],
        stops: newStops
      })

      return newFilters
    })
  }

  const handleSortChange = (value: string) => {
    const sortValue = value as FilterState['sortBy']
    setFilters(prev => ({
      ...prev,
      sortBy: sortValue
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      airlines: [],
      stops: [],
      sortBy: null
    })
    setOpenDropdown(null)

    applyFilters({
      priceRange: [0, 50000000],
      airlines: [],
      flightClasses: [],
      flightTimes: [],
      stops: []
    })
  }

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    const response = await fetch('/api/auth/me')
    const data = await response.json()
    if (response.ok) {
      setUser(data.user)
      setUserLoading(false)
    } else {
      setUser(null)
      setUserLoading(false)
    }
  }

  const FlightLogo = ({ airlineCode = "", width = 8, height = 8 }: { airlineCode: string; width?: number; height?: number }) => {
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
        className={`w-${width} h-${height} rounded-lg`}
        onError={handleImageError}
      />
    )
  }

  const dateOptions = generateDates()

  // Format date for display
  const formatDateDisplay = (date: Date) => {
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    if (date.toDateString() === today.toDateString()) {
      return "امروز"
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "فردا"
    } else {
      return date.toLocaleDateString('fa-IR', {
        month: 'long',
        day: 'numeric'
      })
    }
  }

  // Format date for API
  const formatDateForAPI = (date: Date) => {
    return date.toISOString().split('T')[0] // Returns YYYY-MM-DD
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const formattedDate = formatDateForAPI(date)
    setSelectedDate(formattedDate)

    // Update flight request with new date
    if (flightRequest?.OriginDestinationInformations?.[0]) {
      const updatedRequest = {
        ...flightRequest,
        OriginDestinationInformations: [
          {
            ...flightRequest.OriginDestinationInformations[0],
            DepartureDateTime: `${formattedDate}T00:00:00.0000000+03:30`
          }
        ]
      }

      setFlightRequest(updatedRequest)
      searchFlights(updatedRequest)
    }
  }

  // Format date and time for flight display
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('fa-IR')
    }
  }

  useEffect(() => {
    // Set initial selected date from flightRequest
    if (flightRequest?.OriginDestinationInformations?.[0]?.DepartureDateTime) {
      const currentDate = flightRequest.OriginDestinationInformations[0].DepartureDateTime.split('T')[0]
      setSelectedDate(currentDate)
    }
  }, [flightRequest])

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "IRR") {
      return (amount / 10).toLocaleString('fa-IR') // Convert to Toman
    }
    return amount.toLocaleString('fa-IR')
  }

  const handleBookFlight = (flightId: string, area: string) => {
    router.push(`/flights/${flightId}/book/${area}`)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Date Selection Section */}
      <Card className="border border-blue-900 bg-[#fffefe] shadow-sm overflow-hidden">
        <CardContent className="py-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-900" />
              <h3 className="font-bold text-xl text-blue-900">انتخاب تاریخ پرواز</h3>
            </div>

            {/* Sort Dropdown */}
            <div className="w-full lg:w-auto">
              <Select value={filters.sortBy || ''} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full lg:w-[220px] border-blue-900 text-blue-900">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4" />
                    <SelectValue placeholder="مرتب‌سازی بر اساس" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="price-asc" className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-green-600" />
                    <span>کمترین قیمت</span>
                  </SelectItem>
                  <SelectItem value="price-desc" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-red-600" />
                    <span>بیشترین قیمت</span>
                  </SelectItem>
                  <SelectItem value="duration-asc" className="flex items-center gap-2">
                    <Clock4 className="h-4 w-4 text-blue-600" />
                    <span>کوتاه‌ترین مدت</span>
                  </SelectItem>
                  <SelectItem value="duration-desc" className="flex items-center gap-2">
                    <Clock4 className="h-4 w-4 text-blue-600" />
                    <span>طولانی‌ترین مدت</span>
                  </SelectItem>
                  <SelectItem value="departure-asc" className="flex items-center gap-2">
                    <ArrowUp className="h-4 w-4 text-orange-600" />
                    <span>زودترین پرواز</span>
                  </SelectItem>
                  <SelectItem value="departure-desc" className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-orange-600" />
                    <span>دیرترین پرواز</span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex overflow-x-auto gap-1 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent" style={{ scrollbarWidth: 'none' }}>
            {dateOptions.map((date, index) => {
              const dateStr = formatDateForAPI(date)
              const isSelected = selectedDate === dateStr
              const isToday = date.toDateString() === new Date().toDateString()

              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  className={`
                    flex flex-col items-center justify-center gap-2 
                    min-w-[100px] h-20 px-4 py-3
                    flex-shrink-0 relative
                    transition-all duration-200
                    ${isSelected
                      ? "bg-blue-800 text-white border-2 border-blue-900"
                      : "bg-[#fffefe] text-blue-900 border-2 border-blue-800 hover:border-blue-900"
                    }
                    ${isToday && !isSelected
                      ? "border-2 border-blue-800 bg-[#fffefe]"
                      : ""
                    }
                  `}
                  onClick={() => handleDateSelect(date)}
                >
                  {/* Today indicator badge */}
                  {isToday && (
                    <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${isSelected
                        ? "bg-white text-blue-800"
                        : "bg-blue-800 text-white"
                      }`}>
                      ام
                    </div>
                  )}

                  {/* Day number */}
                  <span className={`
                    text-2xl font-bold leading-none
                    ${isSelected ? "text-white" : "text-blue-900"}
                  `}>
                    {date.toLocaleDateString('fa-IR', { day: 'numeric' })}
                  </span>

                  <div className="flex flex-col items-center gap-0.5">
                    {/* Weekday */}
                    <span className={`
                      text-xs font-semibold
                      ${isSelected ? "text-blue-100" : "text-blue-800"}
                    `}>
                      {date.toLocaleDateString('fa-IR', { weekday: 'short' })}
                    </span>

                    {/* Date string */}
                    <span className={`
                      text-xs
                      ${isSelected ? "text-blue-200" : "text-blue-700"}
                    `}>
                      {formatDateDisplay(date)}
                    </span>
                  </div>
                </Button>
              )
            })}
          </div>

          {/* Quick Filters Bar */}
          <div className="border-t border-blue-200 mt-6 pt-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                <span className="text-sm font-medium text-blue-900 whitespace-nowrap">
                  فیلترهای سریع:
                </span>

                {/* Active Filters */}
                {(filters.airlines.length > 0 || filters.stops.length > 0) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-blue-900">فیلترهای فعال:</span>
                    <div className="flex gap-2 flex-wrap">
                      {filters.stops.map(stop => (
                        <Badge key={stop} variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          {stop === 'direct' ? 'بدون توقف' :
                            stop === '1-stop' ? '۱ توقف' : '۲ توقف'}
                        </Badge>
                      ))}
                      {filters.airlines.map(airlineCode => {
                        const airline = availableAirlines.find(a => a[1] === airlineCode)
                        return (
                          <Badge key={airlineCode} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {airline ? airline[0] : airlineCode}
                          </Badge>
                        )
                      })}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearAllFilters}
                        className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-3 w-3 ml-1" />
                        حذف همه
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Stops Quick Filter */}
                <div className="relative" ref={stopsDropdownRef}>
                  <Button
                    variant="outline"
                    className="border-blue-900 text-blue-900 hover:bg-blue-50 w-full sm:w-auto justify-between"
                    onClick={() => setOpenDropdown(openDropdown === 'stops' ? null : 'stops')}
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      توقف‌ها
                      {filters.stops.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
                          {filters.stops.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'stops' ? 'rotate-180' : ''}`} />
                  </Button>

                  {openDropdown === 'stops' && (
                    <div className="absolute z-50 mt-2 w-full sm:w-56 bg-white border border-blue-200 rounded-lg shadow-lg">
                      <div className="p-2 space-y-1">
                        {[
                          { value: "direct", label: "بدون توقف" },
                          { value: "1-stop", label: "۱ توقف" },
                          { value: "2-stops", label: "۲ توقف یا بیشتر" }
                        ].map((stop) => (
                          <div
                            key={stop.value}
                            className={`
                              flex items-center justify-between px-3 py-2 rounded-md cursor-pointer
                              hover:bg-blue-50 transition-colors
                              ${filters.stops.includes(stop.value) ? 'bg-blue-100' : ''}
                            `}
                            onClick={() => handleStopsChange(stop.value)}
                          >
                            <span className="text-sm text-gray-700">{stop.label}</span>
                            <div className={`
                              h-4 w-4 rounded border flex items-center justify-center
                              ${filters.stops.includes(stop.value)
                                ? 'bg-blue-900 border-blue-900'
                                : 'border-blue-900'
                              }
                            `}>
                              {filters.stops.includes(stop.value) && (
                                <div className="h-2 w-2 bg-white rounded-sm" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Airlines Quick Filter */}
                <div className="relative" ref={airlinesDropdownRef}>
                  <Button
                    variant="outline"
                    className="border-blue-900 text-blue-900 hover:bg-blue-50 w-full sm:w-auto justify-between"
                    onClick={() => setOpenDropdown(openDropdown === 'airlines' ? null : 'airlines')}
                  >
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4" />
                      ایرلاین‌ها
                      {filters.airlines.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-800 px-2 py-0.5 text-xs">
                          {filters.airlines.length}
                        </Badge>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === 'airlines' ? 'rotate-180' : ''}`} />
                  </Button>

                  {openDropdown === 'airlines' && (
                    <div className="absolute z-50 mt-2 w-full sm:w-64 bg-white border border-blue-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
                      <div className="p-2 space-y-1">
                        {availableAirlines.map((airline) => (
                          <div
                            key={airline[1]}
                            className={`
                              flex items-center justify-between px-3 py-2 rounded-md cursor-pointer
                              hover:bg-blue-50 transition-colors
                              ${filters.airlines.includes(airline[1]) ? 'bg-blue-100' : ''}
                            `}
                            onClick={() => handleAirlineChange(airline[1])}
                          >
                            <div className="flex items-center gap-3">
                              <FlightLogo airlineCode={airline[1]} width={6} height={6} />
                              <div className="text-right">
                                <span className="text-sm text-gray-700 block">{airline[0]}</span>
                                <span className="text-xs text-gray-500">کد: {airline[1]}</span>
                              </div>
                            </div>
                            <div className={`
                              h-4 w-4 rounded border flex items-center justify-center
                              ${filters.airlines.includes(airline[1])
                                ? 'bg-blue-900 border-blue-900'
                                : 'border-blue-900'
                              }
                            `}>
                              {filters.airlines.includes(airline[1]) && (
                                <div className="h-2 w-2 bg-white rounded-sm" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Airlines Quick Selection */}
            <div className="mt-6">
              <p className="text-sm font-medium text-blue-900 mb-3">ایرلاین‌های موجود:</p>
              <div className="w-full overflow-x-auto flex gap-4 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-transparent" style={{ scrollbarWidth: 'none' }}>
                {availableAirlines.map((airline) => (
                  <button
                    key={airline[1]}
                    className={`
                      flex flex-col items-center justify-center text-center gap-3 p-4 
                      rounded-xl border-2 transition-all duration-200 min-w-[120px]
                      ${filters.airlines.includes(airline[1])
                        ? "border-blue-900 bg-blue-50 shadow-md"
                        : "border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                      }
                    `}
                    onClick={() => handleAirlineChange(airline[1])}
                  >
                    <div className="relative">
                      <FlightLogo airlineCode={airline[1]} width={10} height={10} />
                      {filters.airlines.includes(airline[1]) && (
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-900 text-white rounded-full flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                    <label className="text-xs cursor-pointer font-medium text-blue-900">
                      {airline[0]}
                    </label>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Flight List Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-4">
        <p className="text-sm text-blue-900">
          <span className="font-bold">{filteredFlights.length}</span> پرواز یافت شد
          {(filters.airlines.length > 0 || filters.stops.length > 0) && (
            <span className="mr-2 text-blue-700">
              (با فیلترهای اعمال شده)
            </span>
          )}
        </p>

        {/* Pagination Info */}
        {totalPages > 1 && (
          <div className="text-sm text-blue-900">
            صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
          </div>
        )}
      </div>

      {/* Flight List */}
      {filteredFlights.length === 0 ? (
        <Card className="text-center py-12 border-2 border-dashed border-blue-200">
          <CardContent>
            <Plane className="h-12 w-12 text-blue-400 mx-auto mb-4" />
            <p className="text-blue-900 text-lg">پروازی با فیلترهای انتخاب شده یافت نشد</p>
            <p className="text-blue-700 text-sm mt-2">
              لطفاً فیلترها را تغییر دهید یا تاریخ دیگری را انتخاب کنید
            </p>
            {(filters.airlines.length > 0 || filters.stops.length > 0) && (
              <Button
                onClick={clearAllFilters}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white"
              >
                حذف فیلترها
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        currentFlights.map((flight, index) => {
          const firstSegment = flight.OriginDestinationOptions[0]?.FlightSegments[0]
          const secondSegment = flight.OriginDestinationOptions[1]?.FlightSegments[0]
          const totalPrice = flight.AirItineraryPricingInfo.ItinTotalFare.TotalFare
          const currency = flight.AirItineraryPricingInfo.ItinTotalFare.Currency
          const flightId = `flight-${startIndex + index}`

          if (!firstSegment) return null

          const departureInfo = formatDateTime(firstSegment.DepartureDateTime)
          const arrivalInfo = formatDateTime(
            flight.OriginDestinationOptions[0]?.FlightSegments[
              flight.OriginDestinationOptions[0]?.FlightSegments.length - 1
            ]?.ArrivalDateTime
          )

          const returnDepartureInfo = secondSegment && formatDateTime(secondSegment.DepartureDateTime)
          const returnArrivalInfo = secondSegment && formatDateTime(
            flight.OriginDestinationOptions[1]?.FlightSegments[
              flight.OriginDestinationOptions[1]?.FlightSegments.length - 1
            ]?.ArrivalDateTime
          )

          const stopsCount = flight.OriginDestinationOptions[0]?.FlightSegments.length - 1

          return (
            <Card key={flightId} className="hover:shadow-lg transition-shadow border border-blue-900 text-blue-900">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center">
                        <FlightLogo airlineCode={flight.ValidatingAirlineCode} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {getAirlineName(flight.ValidatingAirlineCode)}
                        </h3>
                        <p className="text-sm text-blue-700">
                          شماره پرواز: {firstSegment.FlightNumber}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-900">{departureInfo.time}</p>
                        <p className="text-sm text-blue-700 font-medium">
                          {firstSegment.DepartureAirportLocationCode}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">{departureInfo.date}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="h-px flex-1 bg-blue-300" />
                          <Clock className="h-4 w-4 text-blue-700" />
                          <div className="h-px flex-1 bg-blue-300" />
                        </div>
                        <p className="text-xs text-blue-700 font-medium">
                          {flight.OriginDestinationOptions[0]?.JourneyDurationPerMinute} دقیقه
                        </p>
                        <p className="text-xs text-blue-600 mt-1">مدت پرواز</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-900">{arrivalInfo.time}</p>
                        <p className="text-sm text-blue-700 font-medium">
                          {firstSegment.ArrivalAirportLocationCode}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">{arrivalInfo.date}</p>
                      </div>
                    </div>
                    {secondSegment &&
                      <div className="grid grid-cols-3 gap-4 items-center mt-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-900">{returnDepartureInfo?.time}</p>
                          <p className="text-sm text-blue-700 font-medium">
                            {secondSegment.DepartureAirportLocationCode}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">{returnDepartureInfo?.date}</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <div className="h-px flex-1 bg-blue-300" />
                            <Clock className="h-4 w-4 text-blue-700" />
                            <div className="h-px flex-1 bg-blue-300" />
                          </div>
                          <p className="text-xs text-blue-700 font-medium">
                            {flight.OriginDestinationOptions[1]?.JourneyDurationPerMinute} دقیقه
                          </p>
                          <p className="text-xs text-blue-600 mt-1">مدت پرواز</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-blue-900">{returnArrivalInfo?.time}</p>
                          <p className="text-sm text-blue-700 font-medium">
                            {secondSegment.ArrivalAirportLocationCode}
                          </p>
                          <p className="text-xs text-blue-600 mt-1">{returnArrivalInfo?.date}</p>
                        </div>
                      </div>
                    }
                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        اکونومی
                      </Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        {firstSegment.SeatsRemaining} صندلی خالی
                      </Badge>
                      {stopsCount > 0 && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {stopsCount} توقف
                        </Badge>
                      )}
                      {stopsCount === 0 && (
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          بدون توقف
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 md:border-r md:pr-6">
                    <div className="text-left">
                      <p className="text-sm text-blue-900">قیمت هر نفر</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {formatCurrency(totalPrice, currency)}{" "}
                        <span className="text-sm font-normal">تومان</span>
                      </p>
                      <p className="text-xs text-blue-600 font-medium mt-1">
                        قیمت نهایی شامل مالیات
                      </p>
                    </div>

                    {/* Booking Button */}
                    {user && user.phoneVerified && user.emailVerified && (
                      <Button
                        onClick={() => handleBookFlight(flight.FareSourceCode, area)}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        خرید بلیط
                      </Button>
                    )}

                    {!user && (
                      <Button
                        onClick={() => router.push('/auth/signin')}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        برای خرید بلیط وارد حساب شوید
                      </Button>
                    )}

                    {user && (!user.phoneVerified || !user.emailVerified) && (
                      <Button
                        onClick={() => router.push('/dashboard')}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 font-bold shadow-md hover:shadow-lg transition-all"
                      >
                        {!user.phoneVerified && !user.emailVerified
                          ? "ایمیل و موبایل خود را تایید کنید"
                          : !user.phoneVerified
                            ? "موبایل خود را تایید کنید"
                            : "ایمیل خود را تایید کنید"
                        }
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center gap-1 border-blue-900 text-blue-900 hover:bg-blue-50"
          >
            <ChevronRight className="h-4 w-4" />
            قبلی
          </Button>

          <div className="flex items-center gap-1 flex-wrap justify-center">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className={`min-w-10 ${currentPage === page
                  ? "bg-blue-900 text-white"
                  : "border-blue-900 text-blue-900 hover:bg-blue-50"
                  }`}
              >
                {page.toLocaleString('fa-IR')}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center gap-1 border-blue-900 text-blue-900 hover:bg-blue-50"
          >
            بعدی
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}