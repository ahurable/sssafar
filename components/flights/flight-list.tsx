"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Clock, ChevronDown, ArrowRight, ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react"
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
  const router = useRouter()
  const { getAirlineName } = useFlight()
  // Calculate pagination
  const totalPages = Math.ceil(flights.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentFlights = flights
  // Format date and time
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('fa-IR')
    }
  }

  // Format currency
  const formatCurrency = (amount: number, currency: string) => {
    if (currency === "IRR") {
      return (amount / 10).toLocaleString('fa-IR') // Convert to Toman
    }
    return amount.toLocaleString('fa-IR')
  }

  const handleBookFlight = (flightId: string, type: "oneway" | "twoway") => {
    setOpenDropdown(null)
    // You might want to pass the actual flight data instead of just index
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
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{flights.length} پرواز یافت شد</p>
        
        {/* Pagination Info */}
        <div className="text-sm text-muted-foreground">
          صفحه {currentPage.toLocaleString('fa-IR')} از {totalPages.toLocaleString('fa-IR')}
        </div>
      </div>

      {/* Flight List */}
      {currentFlights.map((flight, index) => {
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
          <Card key={flightId} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                      <Plane className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-bold">
                        {getAirlineName(flight.ValidatingAirlineCode)}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        شماره پرواز: {firstSegment.FlightNumber}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 items-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold">{departureInfo.time}</p>
                      <p className="text-sm text-muted-foreground">
                        {firstSegment.DepartureAirportLocationCode}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <div className="h-px flex-1 bg-border" />
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="h-px flex-1 bg-border" />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {flight.OriginDestinationOptions[0]?.JourneyDurationPerMinute} دقیقه
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{arrivalInfo.time}</p>
                      <p className="text-sm text-muted-foreground">
                        {firstSegment.ArrivalAirportLocationCode}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-muted-foreground">{departureInfo.date}</span>
                    <Badge variant="outline">اکونومی</Badge>
                    <Badge variant="secondary">
                      {firstSegment.SeatsRemaining} صندلی خالی
                    </Badge>
                    {flight.OriginDestinationOptions[0]?.FlightSegments.length > 1 && (
                      <Badge variant="outline" className="bg-orange-50">
                        {flight.OriginDestinationOptions[0]?.FlightSegments.length - 1} توقف
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 md:border-r md:pr-6">
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">قیمت هر نفر</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(totalPrice, currency)}{" "}
                      <span className="text-sm font-normal">تومان</span>
                    </p>
                  </div>
                  
                  {/* Booking Dropdown */}
                  <div className="relative">
                    <Button 
                      onClick={() => handleBookFlight(flight.FareSourceCode, "oneway")}
                      className="w-full md:w-auto flex items-center gap-2"
                    >
                      خرید بلیط
                      <ChevronDown className={`h-4 w-4 transition-transform`} />
                    </Button>

                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

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