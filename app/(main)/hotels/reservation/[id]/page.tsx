"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Hotel, 
  MapPin, 
  Calendar, 
  Users, 
  Star, 
  Wifi, 
  Car, 
  Dumbbell, 
  Utensils, 
  Snowflake, 
  Tv,
  User2,
  Trash2,
  AlertCircle,
  Loader2,
  Shield,
  Clock,
  Baby,
  Bed,
  UtensilsCrossed
} from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { useParams, useRouter } from "next/navigation"
import { TravelerForm } from "@/components/dashboard/traveler-form"
import { useHotel } from "@/contexts/search/HotelContext"

// Amenity icons mapping
const amenityIcons: Record<string, any> = {
  "WiFi": Wifi,
  "Free WiFi": Wifi,
  "Restaurant": Utensils,
  "Breakfast": UtensilsCrossed,
  "Parking": Car,
  "Free Parking": Car,
  "Gym": Dumbbell,
  "Fitness Center": Dumbbell,
  "Swimming Pool": Users,
  "Pool": Users,
  "Air Conditioning": Snowflake,
  "AC": Snowflake,
  "TV": Tv,
  "Television": Tv,
  "Room Service": UtensilsCrossed,
}

interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  passportNumber?: string;
  passportExpiry?: string;
  age?: number;
  passengerType: string;
  gender: string;
  email?: string;
  phoneNumber?: string;
}

export default function HotelReservation() {
  const params = useParams()
  const fareSourceCode = params.id as string
  const { getHotelName, getHotelImages } = useHotel()
  
  const [hotelDetails, setHotelDetails] = useState<any>(null)
  const [hotelName, setHotelName] = useState("")
  const [hotelImages, setHotelImages] = useState<any[]>([])
  const [existingTravelers, setExistingTravelers] = useState([])
  const [selectedTravelers, setSelectedTravelers] = useState<Traveler[]>([])
  const [loading, setLoading] = useState(false)
  const [revalidateData, setRevalidateData] = useState<any>(null)
  const router = useRouter()

  // Load hotel details and revalidate
  useEffect(() => {
    console.log(fareSourceCode)
    const loadHotelDetails = async () => {
      try {
        setLoading(true)
        
        // Revalidate the hotel booking
        const revalidateResponse = await fetch('/api/hotels/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            FareSourceCode: fareSourceCode,
            FixStayId: null,
            Nationality: null
          })
        })

        if (!revalidateResponse.ok) {
          throw new Error('Failed to revalidate hotel')
        }

        const revalidateResult = await revalidateResponse.json()
        setRevalidateData(revalidateResult)
        
        // Extract hotel details from revalidate response
        if (revalidateResult.success && revalidateResult.data?.Success) {
          const hotelData = revalidateResult.data
          setHotelDetails(hotelData)

          // Fetch hotel name and images
          const [name, imagesData] = await Promise.all([
            getHotelName(hotelData.PricedItinerary.HotelId),
            getHotelImages(hotelData.PricedItinerary.HotelId)
          ])
          
          setHotelName(name)
          setHotelImages(imagesData.length > 0 ? imagesData : ['/hotels/hotel-1.jpg'])
        }
      } catch (error) {
        console.error('Error loading hotel details:', error)
        alert('خطا در دریافت اطلاعات هتل')
      } finally {
        setLoading(false)
      }
    }

    if (fareSourceCode) {
      loadHotelDetails()
    }
  }, [fareSourceCode, getHotelName, getHotelImages])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR")
  }

  const formatPrice = (price: number, currency: string = "IRR") => {
    if (currency === "IRR" || currency === "تومان") {
      return price.toLocaleString("fa-IR") + " تومان"
    }
    return price.toLocaleString("fa-IR") + " " + currency
  }

  const getMealTypeText = (mealType: string) => {
    const mealTypes: Record<string, string> = {
      "BB": "صبحانه",
      "HB": "صبحانه و ناهار",
      "FB": "تمام وعده‌ها",
      "AI": "همه‌شمول",
      "RO": "بدون غذا"
    }
    return mealTypes[mealType] || mealType
  }

  const handleTravelerAdded = (traveler: Traveler) => {
    if (selectedTravelers.length < 9) {
      setSelectedTravelers(prev => [...prev, traveler])
    }
  }

  const handleTravelerSelect = (traveler: Traveler) => {
    if (selectedTravelers.length < 9) {
      setSelectedTravelers(prev => [...prev, traveler])
    }
  }

  const handleTravelerRemove = (travelerId: string) => {
    setSelectedTravelers(prev => prev.filter(t => t.id !== travelerId))
  }

  const calculateTotalPrice = () => {
    if (!hotelDetails?.PricedItinerary?.NetRate) return 0
    
    const basePrice = hotelDetails.PricedItinerary.NetRate
    const nights = calculateNights()
    return basePrice * nights * selectedTravelers.length
  }

  const calculateNights = () => {
    if (!hotelDetails) return 0
    const checkIn = new Date(hotelDetails.CheckIn)
    const checkOut = new Date(hotelDetails.CheckOut)
    const timeDiff = checkOut.getTime() - checkIn.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedTravelers.length === 0) {
      alert("لطفاً حداقل یک مسافر انتخاب کنید")
      return
    }

    if (!revalidateData?.success) {
      alert("اطلاعات هتل معتبر نیست. لطفاً دوباره تلاش کنید.")
      return
    }

    setLoading(true)

    // Prepare data for booking API
    const invoiceData = {
      kind: "HOTEL",
      travelers: selectedTravelers,
      order: {
        ...hotelDetails.PricedItinerary,
        HotelName: hotelName,
        CheckIn: hotelDetails.CheckIn,
        CheckOut: hotelDetails.CheckOut
      }, // Store complete hotel details in order field
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
        console.log("Hotel booking successful:", result)
        
        // Redirect to payment page
        router.push(`/invoice/${result.invoiceId}`)
      } else {
        const error = await response.json()
        alert(error.message || "خطا در رزرو هتل")
      }
    } catch (error) {
      console.error("Error booking hotel:", error)
      alert("خطا در برقراری ارتباط با سرور")
    } finally {
      setLoading(false)
    }
  }

  if (loading && !hotelDetails) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-white mx-auto mb-4" />
          <p className="text-white text-lg">در حال دریافت اطلاعات هتل...</p>
        </div>
      </div>
    )
  }

  if (!hotelDetails) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-white text-lg">خطا در دریافت اطلاعات هتل</p>
          <Button className="mt-4" onClick={() => window.history.back()}>
            بازگشت
          </Button>
        </div>
      </div>
    )
  }

  const hotel = hotelDetails.PricedItinerary
  const nights = calculateNights()

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">تکمیل اطلاعات رزرو هتل</h1>
            <p className="text-gray-50">اطلاعات مسافران و جزئیات اقامت را بررسی کنید</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Section - Hotel Details & Amenities */}
            <div className="space-y-6">
              {/* Hotel Summary */}
              <Card className="bg-[#fffefe]/95 py-6 backdrop-blur-sm">
                <CardHeader className=" text-indigo-600 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Hotel className="h-6 w-6" />
                    خلاصه هتل
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-6">
                    {/* Hotel Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                          {hotelName}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span>5.0 (عالی)</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            <span>موقعیت مکانی</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-800">
                          {formatPrice(hotel.NetRate, hotel.Currency)}
                        </p>
                        <p className="text-sm text-gray-600">برای هر شب</p>
                      </div>
                    </div>

                    {/* Check-in/Check-out */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
                      <div className="text-center">
                        <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                        <p className="font-bold text-blue-900">تاریخ ورود</p>
                        <p className="text-lg font-semibold">{formatDate(hotelDetails.CheckIn)}</p>
                        <p className="text-sm text-blue-600">ساعت: {hotel.HotelPolicy.BeginTime}</p>
                      </div>
                      <div className="text-center">
                        <Calendar className="h-8 w-8 text-blue-800 mx-auto mb-2" />
                        <p className="font-bold text-blue-900">تاریخ خروج</p>
                        <p className="text-lg font-semibold">{formatDate(hotelDetails.CheckOut)}</p>
                        <p className="text-sm text-blue-600">ساعت: {hotel.HotelPolicy.CheckOutTime}</p>
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <p className="font-bold text-orange-800">
                        مدت اقامت: {nights} شب
                      </p>
                    </div>

                    {/* Rooms Information */}
                    <div>
                      <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                        <Bed className="h-5 w-5 text-blue-600" />
                        اتاق‌های انتخابی
                      </h3>
                      <div className="space-y-4">
                        {hotel.Rooms.map((room: any, index: number) => (
                          <div key={index} className="border rounded-lg p-4 bg-gray-50">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">{room.Name || room.RoomMapName}</h4>
                                <p className="text-sm text-gray-600 mt-1">
                                  {room.BedGroups && `نوع تخت: ${room.BedGroups}`}
                                </p>
                              </div>
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                                {getMealTypeText(room.MealType)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <Label className="text-muted-foreground">بزرگسالان</Label>
                                <p className="font-medium">{room.AdultCount} نفر</p>
                              </div>
                              {room.ChildCount > 0 && (
                                <div>
                                  <Label className="text-muted-foreground">کودکان</Label>
                                  <p className="font-medium">{room.ChildCount} نفر</p>
                                </div>
                              )}
                              {room.ExtraBedCount > 0 && (
                                <div>
                                  <Label className="text-muted-foreground">تخت اضافه</Label>
                                  <p className="font-medium">{room.ExtraBedCount} عدد</p>
                                </div>
                              )}
                              <div>
                                <Label className="text-muted-foreground">وضعیت</Label>
                                <p className="font-medium text-blue-600">تأیید شده</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Hotel Policies */}
                    {(hotel.HotelPolicy.InstructionsFa || hotel.HotelPolicy.SpecialInstructionsFa) && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                          <Shield className="h-5 w-5 text-gray-600" />
                          قوانین هتل
                        </h3>
                        <div className="space-y-2 text-sm text-gray-600">
                          {hotel.HotelPolicy.InstructionsFa && (
                            <p>{hotel.HotelPolicy.InstructionsFa}</p>
                          )}
                          {hotel.HotelPolicy.SpecialInstructionsFa && (
                            <p>{hotel.HotelPolicy.SpecialInstructionsFa}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Cancellation Policy */}
                    <div className={`p-4 rounded-lg border ${
                      hotel.NonRefundable 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Badge variant={hotel.NonRefundable ? "destructive" : "default"}>
                          {hotel.NonRefundable ? "غیرقابل استرداد" : "قابل استرداد"}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {hotel.NonRefundable 
                            ? "این رزرو غیرقابل کنسلی است" 
                            : "امکان کنسلی طبق قوانین هتل وجود دارد"}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Hotel Amenities */}
              {hotel.Amenities && hotel.Amenities.length > 0 && (
                <Card className="py-6 bg-[#fffefe]/95 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Wifi className="h-5 w-5" />
                      امکانات هتل
                    </CardTitle>
                    <CardDescription>
                      امکانات و خدمات ارائه شده توسط هتل
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {hotel.Amenities.slice(0, 9).map((amenity: string, index: number) => {
                        const Icon = amenityIcons[amenity]
                        return (
                          <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                            {Icon && <Icon className="h-4 w-4 text-blue-600" />}
                            <span className="text-sm">{amenity}</span>
                          </div>
                        )
                      })}
                      {hotel.Amenities.length > 9 && (
                        <div className="col-span-full text-center pt-2">
                          <Badge variant="outline">
                            +{hotel.Amenities.length - 9} امکانات بیشتر
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Section - Traveler Information & Booking Summary */}
            <div className="space-y-6">
              {/* Traveler Information */}
              <Card className="py-6 bg-[#fffefe]/95 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r text-blue-600 rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    اطلاعات مسافران
                  </CardTitle>
                  <CardDescription className="text-blue-400">
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
                <Card className="bg-[#fffefe]/95 backdrop-blur-sm py-6">
                  <CardHeader className="bg-gradient-to-r text-pink-600 rounded-t-lg">
                    <CardTitle>خلاصه رزرو</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <span>تعداد مسافران:</span>
                      <span className="font-medium">{selectedTravelers.length} نفر</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>مدت اقامت:</span>
                      <span className="font-medium">{nights} شب</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>قیمت هر شب:</span>
                      <span className="font-medium">{formatPrice(hotel.NetRate, hotel.Currency)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>قیمت پایه:</span>
                      <span className="font-medium">
                        {formatPrice(hotel.NetRate * nights * selectedTravelers.length, hotel.Currency)}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>مبلغ قابل پرداخت:</span>
                      <span className="text-blue-600">
                        {formatPrice(calculateTotalPrice(), hotel.Currency)}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={handleSubmit}
                      className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg mt-4"
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

                    {/* Important Notes */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 mt-4">
                      <h4 className="font-bold text-blue-800 mb-2 text-sm">نکات مهم:</h4>
                      <ul className="text-xs text-blue-700 space-y-1">
                        <li>• قیمت برای هر شب محاسبه شده است</li>
                        <li>• مالیات و عوارض شامل قیمت شده است</li>
                        <li>• امکان کنسلی طبق قوانین هتل وجود دارد</li>
                        {hotel.IsReserveOffline && (
                          <li>• رزرو این هتل به صورت آفلاین انجام می‌شود</li>
                        )}
                      </ul>
                    </div>
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