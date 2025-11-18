"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Hotel, Plane, Train, Calendar, MapPin, Download, Loader2, AlertCircle, CheckCircle2, Router } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Booking {
  id: string
  userId: string
  type: "HOTEL" | "FLIGHT" | "TRAIN"
  status: "CONFIRMED" | "PENDING" | "CANCELLED"
  bookingCode: string
  totalPrice: number
  currency: string
  bookingInformation: any
  createdAt: string
  updatedAt: string
  data: {
    Success: boolean
    Status: number | null
    Error?: {
      Id: string
      Message: string
    }
    WarningMessage: string[]
    UniqueId?: string
    TktTimeLimit?: string
    PaymentDeadline?: string
    SupplierName?: string
    CanExtendPaymentDeadline?: any
  }
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "HOTEL":
      return Hotel
    case "FLIGHT":
      return Plane
    case "TRAIN":
      return Train
    default:
      return Hotel
  }
}

const getTypeLabel = (type: string) => {
  switch (type) {
    case "HOTEL":
      return "هتل"
    case "FLIGHT":
      return "پرواز"
    case "TRAIN":
      return "قطار"
    default:
      return type
  }
}

const getStatusLabel = (status: string, bookingData: any) => {
  if (!bookingData.Success) {
    return "ناموفق"
  }
  
  switch (status) {
    case "CONFIRMED":
      return "تایید شده"
    case "PENDING":
      return "در انتظار"
    case "CANCELLED":
      return "لغو شده"
    default:
      return status
  }
}

const getStatusVariant = (status: string, bookingData: any): "default" | "secondary" | "destructive" | "outline" => {
  if (!bookingData.Success) {
    return "destructive"
  }
  
  switch (status) {
    case "CONFIRMED":
      return "default"
    case "PENDING":
      return "secondary"
    case "CANCELLED":
      return "destructive"
    default:
      return "secondary"
  }
}

const getStatusIcon = (status: string, bookingData: any) => {
  if (!bookingData.Success) {
    return AlertCircle
  }
  
  if (status === "CONFIRMED") {
    return CheckCircle2
  }
  
  return null
}

// Helper functions to extract display information from booking data
const getBookingTitle = (booking: Booking): string => {
  if (!booking.data.Success) {
    return `رزرو ${getTypeLabel(booking.type)} - ناموفق`
  }

  switch (booking.type) {
    case "FLIGHT":
      const flightInfo = JSON.parse(booking.bookingInformation)
      const segments = flightInfo.OriginDestinationOptions?.[0]?.FlightSegments
      if (segments && segments.length > 0) {
        const firstSegment = segments[0]
        return `پرواز ${firstSegment.DepartureAirportLocationCode} - ${firstSegment.ArrivalAirportLocationCode}`
      }
      return booking.data.UniqueId ? `پرواز ${booking.data.UniqueId}` : `پرواز ${booking.bookingCode}`
    
    case "HOTEL":
      return booking.data.SupplierName || `هتل ${booking.bookingCode}`
    
    case "TRAIN":
      return `قطار ${booking.bookingCode}`
    
    default:
      return `رزرو ${booking.bookingCode}`
  }
}

const getBookingLocation = (booking: Booking): string => {
  if (!booking.data.Success) {
    return "خطا در رزرو"
  }

  try {
    const bookingInfo = JSON.parse(booking.bookingInformation)
    
    switch (booking.type) {
      case "FLIGHT":
        const segments = bookingInfo.OriginDestinationOptions?.[0]?.FlightSegments
        if (segments && segments.length > 0) {
          const firstSegment = segments[0]
          return `${firstSegment.MarketingAirlineCode} - ${firstSegment.FlightNumber}`
        }
        return bookingInfo.ValidatingAirlineCode || "ایران ایر"
      
      case "HOTEL":
        return booking.data.SupplierName || "هتل"
      
      case "TRAIN":
        return "قطار"
      
      default:
        return bookingInfo.location || "نامشخص"
    }
  } catch {
    return "نامشخص"
  }
}

const getBookingDate = (booking: Booking): string => {
  if (!booking.data.Success) {
    const date = new Date(booking.createdAt)
    return date.toLocaleDateString('fa-IR')
  }

  try {
    const bookingInfo = JSON.parse(booking.bookingInformation)
    
    switch (booking.type) {
      case "FLIGHT":
        const segments = bookingInfo.OriginDestinationOptions?.[0]?.FlightSegments
        if (segments && segments.length > 0) {
          const firstSegment = segments[0]
          const flightDate = new Date(firstSegment.DepartureDateTime)
          return flightDate.toLocaleDateString('fa-IR')
        }
        if (booking.data.TktTimeLimit) {
          const ticketDate = new Date(booking.data.TktTimeLimit)
          return ticketDate.toLocaleDateString('fa-IR')
        }
        break
      
      case "HOTEL":
        if (booking.data.PaymentDeadline) {
          const paymentDate = new Date(booking.data.PaymentDeadline)
          return paymentDate.toLocaleDateString('fa-IR')
        }
        break
    }
  } catch {
    // Fallback to creation date
  }

  const date = new Date(booking.createdAt)
  return date.toLocaleDateString('fa-IR')
}

const getFlightDetails = (booking: Booking) => {
  if (booking.type !== "FLIGHT" || !booking.data.Success) return null
  
  try {
    const bookingInfo = JSON.parse(booking.bookingInformation)
    const segments = bookingInfo.OriginDestinationOptions?.[0]?.FlightSegments
    if (segments && segments.length > 0) {
      const firstSegment = segments[0]
      return {
        departureTime: new Date(firstSegment.DepartureDateTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        arrivalTime: new Date(firstSegment.ArrivalDateTime).toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
        duration: firstSegment.JourneyDuration,
        baggage: firstSegment.Baggage
      }
    }
  } catch {
    return null
  }
  
  return null
}

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/bookings")
        
        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("لطفاً ابتدا وارد حساب کاربری خود شوید")
          } else if (response.status === 404) {
            setBookings([])
            return
          } else {
            throw new Error("خطایی در دریافت اطلاعات رزروها رخ داد")
          }
        }
        
        const data = await response.json()
        setBookings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطایی رخ داد")
        console.error("Error fetching bookings:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  if (loading) {
    return (
      <Card className="border-sky-100 bg-sky-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-4" />
          <p className="text-sky-700">در حال دریافت اطلاعات رزروها...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-100 bg-red-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-red-800">خطا در دریافت اطلاعات</h3>
          <p className="text-red-600 mb-6">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-sky-600 hover:bg-sky-700"
          >
            تلاش مجدد
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card className="border-sky-100 bg-sky-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
            <Plane className="h-8 w-8 text-sky-600" />
          </div>
          <h3 className="mb-2 text-xl font-bold text-sky-800">هنوز رزروی ندارید</h3>
          <p className="text-sky-600 mb-6">برای شروع سفر، اولین رزرو خود را انجام دهید</p>
          <Button className="bg-sky-600 hover:bg-sky-700" onClick={() => router.push('/')}>شروع رزرو</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => {
        const Icon = getTypeIcon(booking.type)
        const StatusIcon = getStatusIcon(booking.status, booking.data)
        const flightDetails = getFlightDetails(booking)
        
        return (
          <Card 
            key={booking.id} 
            className={`
              hover:shadow-lg transition-shadow border-l-4
              ${!booking.data.Success 
                ? "border-red-300 bg-red-50/50 hover:bg-red-50" 
                : booking.status === "CONFIRMED" 
                  ? "border-sky-300 bg-sky-50/50 hover:bg-sky-50"
                  : "border-gray-200 bg-[#fffefe] hover:bg-gray-50"
              }
            `}
          >
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className={`
                    flex h-12 w-12 items-center justify-center rounded-lg flex-shrink-0
                    ${!booking.data.Success 
                      ? "bg-red-100 text-red-600" 
                      : "bg-sky-100 text-sky-600"
                    }
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className={`
                        font-bold
                        ${!booking.data.Success ? "text-red-800" : "text-gray-900"}
                      `}>
                        {getBookingTitle(booking)}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant="outline" 
                          className={`
                            text-xs
                            ${!booking.data.Success 
                              ? "border-red-200 text-red-700 bg-red-100" 
                              : "border-sky-200 text-sky-700 bg-sky-100"
                            }
                          `}
                        >
                          {getTypeLabel(booking.type)}
                        </Badge>
                        <Badge variant={getStatusVariant(booking.status, booking.data)}>
                          {StatusIcon && <StatusIcon className="h-3 w-3 ml-1" />}
                          {getStatusLabel(booking.status, booking.data)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-3 w-3" />
                        <span>{getBookingLocation(booking)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>{getBookingDate(booking)}</span>
                        <span className="text-xs text-gray-500">• کد رزرو: {booking.bookingCode}</span>
                      </div>

                      {/* Flight specific details */}
                      {flightDetails && (
                        <div className="flex items-center gap-4 pt-1 text-xs text-sky-700">
                          <span>🛫 {flightDetails.departureTime}</span>
                          <span>🛬 {flightDetails.arrivalTime}</span>
                          <span>⏱️ {flightDetails.duration}</span>
                          <span>🎒 {flightDetails.baggage}</span>
                        </div>
                      )}

                      {/* Error message */}
                      {!booking.data.Success && booking.data.Error && (
                        <div className="flex items-start gap-1 pt-1 text-red-600 text-xs">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{booking.data.Error.Message}</span>
                        </div>
                      )}

                      {/* Warning messages */}
                      {booking.data.Success && booking.data.WarningMessage && booking.data.WarningMessage.length > 0 && (
                        <div className="text-amber-600 text-xs flex items-start gap-1">
                          <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          <span>{booking.data.WarningMessage[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 md:border-r md:pr-6 border-gray-200">
                  <div className="text-left">
                    <p className="text-sm text-gray-500">مبلغ پرداختی</p>
                    <p className={`
                      text-xl font-bold
                      ${!booking.data.Success ? "text-red-600" : "text-sky-600"}
                    `}>
                      {booking.totalPrice.toLocaleString("fa-IR")} 
                      <span className="text-sm font-normal text-gray-500"> تومان</span>
                    </p>
                  </div>
                  
                  {booking.data.Success && (
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
                      >
                        <Download className="ml-2 h-4 w-4" />
                        دانلود بلیط
                      </Button>
                      {booking.type === "HOTEL" && booking.data.CanExtendPaymentDeadline && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-sky-800"
                        >
                          تمدید پرداخت
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}