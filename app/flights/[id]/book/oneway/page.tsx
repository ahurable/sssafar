"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, User, Users, Plane, MapPin, Search, Plus, User2, Trash2, AlertCircle, FileText, Shield, Clock, Loader2 } from "lucide-react"
import DatePicker from "react-multi-date-picker"
import type { DateObject } from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams, useRouter } from "next/navigation"
import { TravelerForm } from "@/components/dashboard/traveler-form"
// Enhanced Traveler Form Component


export default function OneWayReservation() {
  const params = useParams()
  const fareSourceCode = params.id as string
  
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    travelers: 1,
    class: "economy"
  })
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null)
  const [existingTravelers, setExistingTravelers] = useState([])
  const [selectedTravelers, setSelectedTravelers] = useState([])
  const [loading, setLoading] = useState(false)
  const [revalidateData, setRevalidateData] = useState<any>(null)
  const [flightDetails, setFlightDetails] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [selectedServices, setSelectedServices] = useState<any[]>([])
  const router = useRouter()
  // Load flight details and revalidate
  useEffect(() => {
    const loadFlightDetails = async () => {
      try {
        setLoading(true)
        
        // First, revalidate the flight with PartoCRS API
        const revalidateResponse = await fetch('/api/flights/revalidate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({// This should come from your context
            FareSourceCode: fareSourceCode,
            IsGenuine: false
          })
        })

        if (!revalidateResponse.ok) {
          throw new Error('Failed to revalidate flight')
        }

        const revalidateResult = await revalidateResponse.json()
        setRevalidateData(revalidateResult)
        console.log(revalidateResult)
        // Extract flight details from revalidate response
        if (revalidateResult.Success && revalidateResult.PricedItinerary) {
          const itinerary = revalidateResult.PricedItinerary
          const firstOption = itinerary.OriginDestinationOptions[0]
          const firstSegment = firstOption?.FlightSegments[0]
          
          if (firstSegment) {
            const departureInfo = formatDateTime(firstSegment.DepartureDateTime)
            const arrivalInfo = formatDateTime(firstSegment.ArrivalDateTime)
            
            setFlightDetails({
              airline: getAirlineName(itinerary.ValidatingAirlineCode),
              flightNumber: firstSegment.FlightNumber,
              from: firstSegment.DepartureAirportLocationCode,
              to: firstSegment.ArrivalAirportLocationCode,
              departureTime: departureInfo.time,
              arrivalTime: arrivalInfo.time,
              date: departureInfo.date,
              duration: firstSegment.JourneyDuration,
              class: getCabinClass(firstSegment.CabinClassCode),
              price: itinerary.AirItineraryPricingInfo.ItinTotalFare.TotalFare / 10, // Convert to Toman
              aircraft: firstSegment.OperatingAirline?.Equipment || "نامشخص",
              capacity: firstSegment.SeatsRemaining,
              baggage: firstSegment.Baggage,
              terminal: firstSegment.DepartureTerminal
            })
          }

          // Set available services
          const allServices = [
            ...(revalidateResult.Services || []),
            ...(revalidateResult.MealTypeServices || []),
            ...(revalidateResult.SeatServices || []),
            ...(revalidateResult.CancellationGuaranteeServices || [])
          ]
          setServices(allServices)
        }
      } catch (error) {
        console.error('Error loading flight details:', error)
        alert('خطا در دریافت اطلاعات پرواز')
      } finally {
        setLoading(false)
      }
    }

    if (fareSourceCode) {
      loadFlightDetails()
    }
  }, [fareSourceCode])

  // Load existing travelers
  useEffect(() => {
    const loadTravelers = async () => {
      try {
        const response = await fetch("/api/travelers")
        const data = await response.json()
        if (data.travelers) {
          setExistingTravelers(data.travelers)
        }
      } catch (error) {
        console.error("Error loading travelers:", error)
      }
    }
    loadTravelers()
  }, [])

  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString)
    return {
      time: date.toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
      date: date.toLocaleDateString('fa-IR'),
      dateFull: date.toLocaleDateString('fa-IR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  const getAirlineName = (iataCode: string) => {
    const airlines: { [key: string]: string } = {
      "EK": "امارات",
      "QR": "قطر ایرویز", 
      "EY": "اتیهاد ایرویز",
      "TK": "ترکیش ایرلاینز",
      "OV": "سلام ایر",
      "W5": "ماهان ایر",
      "IR": "ایران ایر",
      "ZV": "قشم ایر"
    }
    return airlines[iataCode] || iataCode
  }

  const getCabinClass = (cabinCode: number) => {
    const cabins = {
      1: "اکونومی",
      2: "بیزینس", 
      3: "فرست کلاس"
    }
    return cabins[cabinCode as keyof typeof cabins] || "اکونومی"
  }

  const handleDateChange = (date: DateObject | null) => {
    setSelectedDate(date)
    if (date) {
      const gregorianDate = date.convert(persian, "gregorian")
      setFormData(prev => ({
        ...prev,
        departureDate: gregorianDate.toDate().toISOString().split('T')[0]
      }))
    }
  }

  const handleTravelerAdded = (traveler) => {
    if (selectedTravelers.length < 9) {
      setSelectedTravelers(prev => [...prev, traveler])
    }
  }

  const handleTravelerSelect = (traveler) => {
    if (selectedTravelers.length < 9) {
      setSelectedTravelers(prev => [...prev, traveler])
    }
  }

  const handleTravelerRemove = (travelerId) => {
    setSelectedTravelers(prev => prev.filter(t => t.id !== travelerId))
  }

  const handleServiceToggle = (service: any) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.ServiceId === service.ServiceId || s.MealTypeServiceId === service.MealTypeServiceId || s.SeatServiceId === service.SeatServiceId)
      if (isSelected) {
        return prev.filter(s => s.ServiceId !== service.ServiceId && s.MealTypeServiceId !== service.MealTypeServiceId && s.SeatServiceId !== service.SeatServiceId)
      } else {
        return [...prev, service]
      }
    })
  }

  const calculateTotalPrice = () => {
    if (!flightDetails) return 0
    
    const basePrice = flightDetails.price * selectedTravelers.length
    const servicesPrice = selectedServices.reduce((total, service) => {
      const serviceCost = service.ServiceCost?.Amount || service.MealTypeServiceCost?.Amount || service.SeatServiceCost?.Amount || service.Amount || 0
      return total + (serviceCost / 10) // Convert to Toman
    }, 0)
    
    return basePrice + servicesPrice
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedTravelers.length === 0) {
      alert("لطفاً حداقل یک مسافر انتخاب کنید")
      return
    }

    if (!revalidateData?.Success) {
      alert("اطلاعات پرواز معتبر نیست. لطفاً دوباره تلاش کنید.")
      return
    }

    setLoading(true)

    // Prepare data for booking API
    const invoiceData = {
      flightType: "one-way",
      kind: "FLIGHT",
      flightSourceCode: fareSourceCode,
      travelers: selectedTravelers,
      selectedServices: selectedServices,
      amount: calculateTotalPrice().toString()
    }

    try {
      const response = await fetch("/api/invoice/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData)
      })

      if (response.ok) {
        const result = await response.json()
        // Navigate to payment page or show success
        console.log("Booking successful:", result)
        
        // Redirect to payment page
        router.push(`/invoice/${result.invoiceId}`)
      } else {
        const error = await response.json()
        alert(error.error || "خطا در رزرو پرواز")
      }
    } catch (error) {
      console.error("Error booking flight:", error)
      alert("خطا در برقراری ارتباط با سرور")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !flightDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">در حال دریافت اطلاعات پرواز...</p>
        </div>
      </div>
    )
  }

  if (!flightDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">خطا در دریافت اطلاعات پرواز</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            بازگشت
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">تکمیل اطلاعات رزرو</h1>
            <p className="text-gray-50">اطلاعات مسافران و جزئیات پرواز را بررسی کنید</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Section - Flight Details & Services */}
            <div className="space-y-6">
              {/* Flight Summary */}
              <Card className="">
                <CardHeader className=" text-blue-800">
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-6 w-6" />
                    خلاصه پرواز
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                          <Plane className="h-6 w-6 text-blue-800" />
                        </div>
                        <div>
                          <h3 className="font-bold">{flightDetails.airline}</h3>
                          <p className="text-sm text-muted-foreground">شماره پرواز: {flightDetails.flightNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-800">
                          {flightDetails.price.toLocaleString("fa-IR")} <span className="text-sm font-normal">تومان</span>
                        </p>
                        <p className="text-sm text-muted-foreground">هر نفر</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center pt-4 border-t">
                      <div className="text-center">
                        <p className="text-xl font-bold">{flightDetails.departureTime}</p>
                        <p className="text-sm text-muted-foreground">{flightDetails.from}</p>
                        {flightDetails.terminal && (
                          <p className="text-xs text-gray-500">ترمینال {flightDetails.terminal}</p>
                        )}
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="h-px flex-1 bg-border" />
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <p className="text-xs text-muted-foreground">{flightDetails.duration}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{flightDetails.arrivalTime}</p>
                        <p className="text-sm text-muted-foreground">{flightDetails.to}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">تاریخ پرواز</p>
                        <p className="font-medium">{flightDetails.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">کلاس</p>
                        <p className="font-medium">{flightDetails.class}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">هواپیما</p>
                        <p className="font-medium">{flightDetails.aircraft}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">بار مجاز</p>
                        <p className="font-medium">{flightDetails.baggage || "اطلاعات موجود نیست"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Services */}
              {services.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="h-5 w-5" />
                      خدمات اضافی
                    </CardTitle>
                    <CardDescription>
                      خدمات اختیاری برای پرواز خود انتخاب کنید
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {services.map((service, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedServices.some(s => 
                              s.ServiceId === service.ServiceId || 
                              s.MealTypeServiceId === service.MealTypeServiceId || 
                              s.SeatServiceId === service.SeatServiceId
                            )}
                            onChange={() => handleServiceToggle(service)}
                            className="h-4 w-4 text-blue-600"
                          />
                          <div>
                            <p className="font-medium">{service.Description}</p>
                            {service.FlightNumber && (
                              <p className="text-sm text-muted-foreground">پرواز: {service.FlightNumber}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-blue-600">
                            {((service.ServiceCost?.Amount || service.MealTypeServiceCost?.Amount || service.SeatServiceCost?.Amount || service.Amount || 0) / 10).toLocaleString('fa-IR')} تومان
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

            </div>

            {/* Right Section - Traveler Information & Booking Summary */}
            <div className="space-y-6">
              <Card className="">
                <CardHeader className="text-green-600">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    اطلاعات مسافران
                  </CardTitle>
                  <CardDescription className="">
                    مسافران خود را انتخاب یا اضافه کنید (حداکثر ۹ نفر)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <TravelerForm 
                    onTravelerAdded={handleTravelerAdded}
                    onTravelerSelect={handleTravelerSelect}
                    onTravelerRemove={handleTravelerRemove}
                    existingTravelers={existingTravelers}
                    selectedTravelers={selectedTravelers}
                    mode="booking"
                  />
                </CardContent>
              </Card>

              {/* Booking Summary */}
              {selectedTravelers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>خلاصه رزرو</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>تعداد مسافران:</span>
                      <span className="font-medium">{selectedTravelers.length} نفر</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>قیمت پایه:</span>
                      <span className="font-medium">{(flightDetails.price * selectedTravelers.length).toLocaleString("fa-IR")} تومان</span>
                    </div>
                    
                    {selectedServices.length > 0 && (
                      <div className="border-t pt-3">
                        <p className="text-sm text-muted-foreground mb-2">خدمات اضافی:</p>
                        {selectedServices.map((service, index) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span>{service.Description}</span>
                            <span>{((service.ServiceCost?.Amount || service.MealTypeServiceCost?.Amount || service.SeatServiceCost?.Amount || service.Amount || 0) / 10).toLocaleString('fa-IR')} تومان</span>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                      <span>مبلغ قابل پرداخت:</span>
                      <span className="text-blue-800">{calculateTotalPrice().toLocaleString("fa-IR")} تومان</span>
                    </div>
                    
                    <Button 
                      onClick={handleSubmit}
                      className="w-full bg-blue-800 hover:bg-blue-700 h-12 text-lg mt-4"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          در حال پردازش...
                        </>
                      ) : (
                        "تایید و پرداخت"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}