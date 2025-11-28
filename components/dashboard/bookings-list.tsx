"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Hotel, Plane, Calendar, MapPin, Download, Loader2, AlertCircle, CheckCircle2, Building } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface Booking {
  id: string
  userId: string
  type: "HOTEL" | "FLIGHT" | "CIP" | "ACTIVITY"
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

interface BookingDisplayInfo {
  title: string
  subtitle: string
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case "HOTEL":
      return Hotel
    case "FLIGHT":
      return Plane
    case "CIP":
      return Building
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
    case "CIP":
      return "CIP"
    case "ACTIVITY":
      return "فعالیت"
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

const getStatusBadgeColor = (status: string, bookingData: any): string => {
  if (!bookingData.Success) {
    return "bg-red-100 text-red-800 border-red-200"
  }
  
  switch (status) {
    case "CONFIRMED":
      return "bg-green-100 text-green-800 border-green-200"
    case "PENDING":
      return "bg-blue-100 text-blue-800 border-blue-200"
    case "CANCELLED":
      return "bg-red-100 text-red-800 border-red-200"
    default:
      return "bg-gray-100 text-gray-800 border-gray-200"
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

// Helper function to extract display information from booking data
const getBookingDisplayInfo = (booking: Booking): BookingDisplayInfo => {
  
  try {
    const bookingInfo = JSON.parse(booking.bookingInformation)
    
    switch (booking.type) {
      case "FLIGHT":
        const segments = bookingInfo.OriginDestinationOptions?.[0]?.FlightSegments
        if (segments && segments.length > 0) {
          const firstSegment = segments[0]
          const lastSegment = segments[segments.length - 1]
          return {
            title: `${firstSegment.DepartureAirportLocationCode} - ${lastSegment.ArrivalAirportLocationCode}`,
            subtitle: `${firstSegment.MarketingAirlineCode} ${firstSegment.FlightNumber}`
          }
        }
        return {
          title: booking.data.UniqueId ? `پرواز ${booking.data.UniqueId}` : `پرواز ${booking.bookingCode}`,
          subtitle: bookingInfo.ValidatingAirlineCode || "ایران ایر"
        }
      
      case "HOTEL":
        // Return temporary title, we'll update it later with the actual hotel name
        return {
          title: `${bookingInfo.HotelName}`,
          subtitle: "اقامتگاه"
        }
      
      case "CIP":
        return {
          title: `${bookingInfo.order?.title || `CIP ${booking.bookingCode}`}`,
          subtitle: ""
        }
      
      case "ACTIVITY":
        return {
          title: `${bookingInfo.tourTitle || `فعالیت ${booking.bookingCode}`}`,
          subtitle: "فعالیت تفریحی"
        }
      
      default:
        return {
          title: `رزرو ${booking.bookingCode}`,
          subtitle: "نامشخص"
        }
    }
  } catch {
    return {
      title: `رزرو ${booking.bookingCode}`,
      subtitle: "نامشخص"
    }
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

export function BookingsList() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([])
  const [displayInfoMap, setDisplayInfoMap] = useState<Record<string, BookingDisplayInfo>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>("ALL")
  const router = useRouter()

  const filters = [
    { key: "ALL", label: "همه" },
    { key: "FLIGHT", label: "پرواز" },
    { key: "HOTEL", label: "هتل" },
    { key: "CIP", label: "CIP" },
    { key: "ACTIVITY", label: "فعالیت" }
  ]

  
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
            setFilteredBookings([])
            return
          } else {
            throw new Error("خطایی در دریافت اطلاعات رزروها رخ داد")
          }
        }
        
        const data = await response.json()
        setBookings(data)
        setFilteredBookings(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطایی رخ داد")
        console.error("Error fetching bookings:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const handleFilter = (filterKey: string) => {
    setActiveFilter(filterKey)
    if (filterKey === "ALL") {
      setFilteredBookings(bookings)
    } else {
      setFilteredBookings(bookings.filter(booking => booking.type === filterKey))
    }
  }

  if (loading) {
    return (
      <Card className="border-sky-100 bg-sky-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-sky-600 mb-4" />
          <p className="text-sky-700 text-sm">در حال دریافت اطلاعات رزروها...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-100 bg-red-50/50">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-red-800">خطا در دریافت اطلاعات</h3>
          <p className="text-red-600 mb-6 text-sm">{error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-sky-600 hover:bg-sky-700 text-sm"
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
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-sky-100">
            <Plane className="h-6 w-6 text-sky-600" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-sky-800">هنوز رزروی ندارید</h3>
          <p className="text-sky-600 mb-6 text-sm">برای شروع سفر، اولین رزرو خود را انجام دهید</p>
          <Button className="bg-sky-600 hover:bg-sky-700 text-sm" onClick={() => router.push('/')}>شروع رزرو</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((filter) => (
          <Button
            key={filter.key}
            variant={activeFilter === filter.key ? "default" : "outline"}
            size="sm"
            onClick={() => handleFilter(filter.key)}
            className={`
              text-xs px-3 py-1 h-auto
              ${activeFilter === filter.key 
                ? "bg-sky-600 text-white hover:bg-sky-700" 
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
              }
            `}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Responsive Container */}
      <div className="w-full">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Header - Hidden on mobile */}
          <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 lg:px-6 py-3 bg-gray-50 border-b border-gray-200 text-xs font-medium text-gray-600">
            <div className="col-span-2">نوع رزرو</div>
            <div className="col-span-3">مقصد / نام</div>
            <div className="col-span-2">تاریخ</div>
            <div className="col-span-2">وضعیت</div>
            <div className="col-span-2 text-left">قیمت</div>
            <div className="col-span-1">عملیات</div>
          </div>

          {/* Bookings List */}
          <div className="divide-y divide-gray-100">
            {filteredBookings.map((booking) => {
              const Icon = getTypeIcon(booking.type)
              const StatusIcon = getStatusIcon(booking.status, booking.data)
              const displayInfo = displayInfoMap[booking.id] || getBookingDisplayInfo(booking)
              const bookingDate = getBookingDate(booking)
              
              return (
                <div key={booking.id}>
                  {/* Desktop View */}
                  <div className="hidden md:grid md:grid-cols-12 gap-4 px-4 lg:px-6 py-4 hover:bg-gray-50 transition-colors items-center text-sm">
                    {/* Type */}
                    <div className="col-span-2 flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-100 text-sky-600 flex-shrink-0">
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs text-gray-700">{getTypeLabel(booking.type)}</span>
                    </div>

                    {/* Destination/Name */}
                    <div className="col-span-3">
                      <div className="font-medium text-gray-900 text-sm">{displayInfo.title}</div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" />
                        {displayInfo.subtitle}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="col-span-2 text-xs text-gray-600 flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {bookingDate}
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 ${getStatusBadgeColor(booking.status, booking.data)}`}
                      >
                        {StatusIcon && <StatusIcon className="h-3 w-3 ml-1" />}
                        {getStatusLabel(booking.status, booking.data)}
                      </Badge>
                    </div>

                    {/* Price */}
                    <div className="col-span-2 text-left">
                      <p className="text-sm font-bold text-sky-600">
                        {booking.totalPrice.toLocaleString("fa-IR")} 
                        <span className="text-xs font-normal text-gray-500 mr-1">تومان</span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1">
                      {booking.data.Success && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0 text-gray-500 hover:text-sky-600 hover:bg-sky-50"
                          title="دانلود بلیط"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Mobile View */}
                  <div className="md:hidden p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <Card className="border-gray-200 shadow-sm">
                      <CardContent className="p-4 space-y-3">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="font-bold text-gray-900 text-sm">{getTypeLabel(booking.type)}</div>
                              <div className="text-xs text-gray-500">{booking.bookingCode}</div>
                            </div>
                          </div>
                          
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 ${getStatusBadgeColor(booking.status, booking.data)}`}
                          >
                            {StatusIcon && <StatusIcon className="h-3 w-3 ml-1" />}
                            {getStatusLabel(booking.status, booking.data)}
                          </Badge>
                        </div>

                        {/* Content */}
                        <div className="space-y-2">
                          <div>
                            <div className="font-semibold text-gray-900 text-sm">{displayInfo.title}</div>
                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <MapPin className="h-3 w-3" />
                              {displayInfo.subtitle}
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {bookingDate}
                            </div>
                            
                            <div className="text-left">
                              <div className="font-bold text-sky-600 text-sm">
                                {booking.totalPrice.toLocaleString("fa-IR")} 
                                <span className="text-xs font-normal text-gray-500 mr-1">تومان</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-8"
                            onClick={() => {/* View details action */}}
                          >
                            مشاهده جزئیات
                          </Button>
                          
                          {booking.data.Success && (
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="h-8 w-8 p-0 text-gray-500 hover:text-sky-600 hover:bg-sky-50"
                              title="دانلود بلیط"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredBookings.length === 0 && (
            <div className="py-12 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mx-auto">
                <AlertCircle className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-600 mb-2">رزروی یافت نشد</h3>
              <p className="text-gray-500 text-sm">هیچ رزروی با فیلتر انتخاب شده وجود ندارد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}