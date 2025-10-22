"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Clock, ChevronDown, ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFlight } from "@/contexts/search/FlightContext"

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
  flights: Flight[]
  itemsPerPage?: number
}

export function FlightList({ flights, itemsPerPage = 10 }: FlightListProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>("")
  const router = useRouter()
  const { getAirlineName, flightRequest, setFlightRequest, searchFlights } = useFlight()

  // Calculate pagination
  const totalPages = Math.ceil(flights.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentFlights = flights

  // Generate dates for the next 7 days
  const generateDates = () => {
    const dates = []
    const today = new Date()
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      dates.push(date)
    }
    
    return dates
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

  const handleBookFlight = (flightId: string, type: "oneway" | "twoway") => {
    setOpenDropdown(null)
    router.push(`/flights/${flightId}/book/${type}`)
  }

  const toggleDropdown = (flightIndex: string) => {
    setOpenDropdown(openDropdown === flightIndex ? null : flightIndex)
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      {/* Date Selection Section */}
      <Card className="border-2 border-blue-100 bg-blue-50 overflow-auto" >
        <CardContent className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-5 w-5 text-blue-600" />
            <h3 className="font-bold text-lg text-blue-800">انتخاب تاریخ پرواز</h3>
          </div>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {dateOptions.map((date, index) => {
              const dateStr = formatDateForAPI(date)
              const isSelected = selectedDate === dateStr
              const isToday = date.toDateString() === new Date().toDateString()
              
              return (
                <Button
                  key={index}
                  variant={isSelected ? "default" : "outline"}
                  className={`
                    flex flex-col items-center gap-1 min-w-[80px] h-16 px-3 py-2 rounded-xl
                    ${isSelected 
                      ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                      : "bg-white text-gray-700 border-blue-200 hover:bg-blue-50"
                    }
                    ${isToday && !isSelected ? "border-2 border-blue-400 bg-blue-25" : ""}
                    transition-all duration-200
                  `}
                  onClick={() => handleDateSelect(date)}
                >
                  <span className={`text-xs font-medium ${isSelected ? "text-blue-100" : "text-gray-500"}`}>
                    {formatDateDisplay(date)}
                  </span>
                  <span className="text-sm font-bold">
                    {date.toLocaleDateString('fa-IR', { day: 'numeric' })}
                  </span>
                  <span className={`text-xs ${isSelected ? "text-blue-100" : "text-gray-400"}`}>
                    {date.toLocaleDateString('fa-IR', { weekday: 'short' })}
                  </span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Flight List Header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{flights.length} پرواز یافت شد</p>
        
        {/* Pagination Info */}
        <div className="text-sm text-muted-foreground">
          صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
        </div>
      </div>

      {/* Flight List */}
      {currentFlights.length === 0 ? (
        <Card className="text-center py-12 border-2 border-dashed border-gray-200">
          <CardContent>
            <Plane className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">پروازی برای تاریخ انتخاب شده یافت نشد</p>
            <p className="text-gray-400 text-sm mt-2">لطفاً تاریخ دیگری را انتخاب کنید</p>
          </CardContent>
        </Card>
      ) : (
        currentFlights.map((flight, index) => {
          const firstSegment = flight.OriginDestinationOptions[0]?.FlightSegments[0]
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

          return (
            <Card key={flightId} className="hover:shadow-lg transition-shadow border-2">
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Plane className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">
                          {getAirlineName(flight.ValidatingAirlineCode)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          شماره پرواز: {firstSegment.FlightNumber}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{departureInfo.time}</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {firstSegment.DepartureAirportLocationCode}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{departureInfo.date}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="h-px flex-1 bg-border" />
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <p className="text-xs text-muted-foreground font-medium">
                          {flight.OriginDestinationOptions[0]?.JourneyDurationPerMinute} دقیقه
                        </p>
                        <p className="text-xs text-gray-500 mt-1">مدت پرواز</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-900">{arrivalInfo.time}</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          {firstSegment.ArrivalAirportLocationCode}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{arrivalInfo.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 flex-wrap">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        اکونومی
                      </Badge>
                      <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200">
                        {firstSegment.SeatsRemaining} صندلی خالی
                      </Badge>
                      {flight.OriginDestinationOptions[0]?.FlightSegments.length > 1 && (
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          {flight.OriginDestinationOptions[0]?.FlightSegments.length - 1} توقف
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-4 md:border-r md:pr-6">
                    <div className="text-left">
                      <p className="text-sm text-muted-foreground">قیمت هر نفر</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatCurrency(totalPrice, currency)}{" "}
                        <span className="text-sm font-normal">تومان</span>
                      </p>
                      <p className="text-xs text-green-600 font-medium mt-1">
                        قیمت نهایی شامل مالیات
                      </p>
                    </div>
                    
                    {/* Booking Button */}
                    <Button 
                      onClick={() => handleBookFlight(flight.FareSourceCode, "oneway")}
                      className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      خرید بلیط
                    </Button>
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
            className="flex items-center gap-1"
          >
            <ChevronRight className="h-4 w-4" />
            قبلی
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(page)}
                className="min-w-10"
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
            className="flex items-center gap-1"
          >
            بعدی
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}