"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Star, 
  MapPin, 
  Wifi, 
  Coffee, 
  Car, 
  Dumbbell, 
  Utensils, 
  Snowflake, 
  Tv, 
  Users,
  Clock,
  Calendar,
  CreditCard,
  Shield,
  Bed,
  UtensilsCrossed,
  Baby,
  Dog,
  User,
  ChevronLeft,
  Heart,
  Share2
} from "lucide-react"
import { useHotel } from "@/contexts/search/HotelContext"
import { useSnack } from "@/hooks/use-notification"
import { useRouter } from "next/navigation"

// Types for hotel with fare data
interface HotelWithFare {
  HotelId: number
  FareSourceCode: string
  Offer?: string
  Promotion?: string
  NonRefundable: boolean
  HotelPolicy: {
    BeginTime: string
    EndTime: string
    MinAge: string
    CheckOutTime: string
    Instructions: string
    SpecialInstructions: string
    InstructionsFa: string
    SpecialInstructionsFa: string
    ChildPolicyDescriptionFa: string
  }
  Currency: string
  AvailableRoom: number
  PlainTextCancellationPolicy?: string
  NetRate: number
  NetRateWithoutDiscount: number
  Rooms: Array<{
    RoomId: string
    RoomMapId: string
    Name: string
    RoomMapName: string
    AdultCount: number
    ExtraBedCount: number
    ChildCount: number
    ChildAges: string[]
    MealType: string
    SharingBedding: boolean
    BedGroups: string
    HotelRoomEarlyCheckin?: {
      CheckInDateTime: string
      CheckInAmount: number
    }
    HotelRoomLateCheckout?: {
      CheckOutDateTime: string
      CheckOutAmount: number
    }
  }>
  Amenities: string[]
  IsReserveOffline: boolean
  HotelLabels: string[]
}

interface HotelDetailsProps {
  hotelId?: string
  fareSourceCode?: string
  checkIn?: string
  checkOut?: string
}

// Amenity icons mapping
const amenityIcons: Record<string, any> = {
  "WiFi": Wifi,
  "Free WiFi": Wifi,
  "Restaurant": Utensils,
  "Breakfast": Coffee,
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
  "Room Service": Coffee,
}

// Room type images mapping
const roomTypeImages: Record<string, string> = {
  "standard": "/rooms/standard-room.jpg",
  "deluxe": "/rooms/deluxe-room.jpg", 
  "suite": "/rooms/suite-room.jpg",
  "executive": "/rooms/executive-room.jpg",
  "family": "/rooms/family-room.jpg",
  "presidential": "/rooms/presidential-suite.jpg",
  "default": "/rooms/hotel-room.jpg"
}

export default function HotelDetails({ hotelId, fareSourceCode, checkIn, checkOut }: HotelDetailsProps) {
  const [hotelData, setHotelData] = useState<HotelWithFare | null>(null)
  const [hotelItinenaries, setHotelItinenaries] = useState<any[]>()
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedRoomImage, setSelectedRoomImage] = useState<{[key: string]: number}>({})
  const [hotelImages, setHotelImages] = useState<any[]>([])
  const [hotelName, setHotelName] = useState("")
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const { getHotelImages, getHotelName } = useHotel()
  const { error, success } = useSnack()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  // Get parameters from URL or props
  const currentHotelId = hotelId || params.id as string
  const currentFareSourceCode = fareSourceCode || searchParams.get('fareSourceCode') || ''
  const rawCheckIn = checkIn || searchParams.get('checkIn') || ''
  const rawCheckOut = checkOut || searchParams.get('checkOut') || ''
  const currentCheckIn = rawCheckIn.replace(' ', '+')
  const currentCheckOut = rawCheckOut.replace(' ', '+')

  // Function to fetch hotel with fare data
  const hotelWithFare = async (hotelId: number): Promise<HotelWithFare[]> => {
    if (hotelId === 0) return []

    try {
      console.log(currentCheckIn)
      console.log(currentCheckOut)
      console.log(hotelId)
      const res = await fetch("/api/hotels/search/list", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          checkIn: currentCheckIn,
          checkOut: currentCheckOut,
          hotelId: currentHotelId,
          occupancies: [{ AdultCount: 2, ChildCount: 0, ChildAges: [] }], // Default occupancy
          cityId: 1 // Default city ID
        })
      })
      
      const data = await res.json()
      
      if (res.ok && Array.isArray(data)) {
        console.log("Hotels with fare data received:", data)
        setHotelItinenaries(data)
        return data
      }
      console.error("Error fetching hotels with fare:", data)
      return []
    } catch (error) {
      console.error("Error in hotelWithFare:", error)
      return []
    }
  }

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true)
        
        if (!currentHotelId) {
          error("شناسه هتل مشخص نیست")
          return
        }

        const hotelIdNum = parseInt(currentHotelId)
        
        // Fetch hotel with fare data
        const hotelsWithFare = await hotelWithFare(hotelIdNum)
        
        if (hotelsWithFare.length > 0) {
          const hotel = hotelsWithFare[0]
          setHotelData(hotel)
          
          // Fetch hotel name and images
          const [name, imagesData] = await Promise.all([
            getHotelName(hotel.HotelId),
            getHotelImages(hotel.HotelId)
          ])
          
          setHotelName(name)
          
          // Extract image URLs
          const images = imagesData.slice(0, 10)
          setHotelImages(images.length > 0 ? images : ['/hotels/hotel-1.jpg'])
          
          success("اطلاعات هتل با موفقیت دریافت شد")
        } else {
          error("هتل مورد نظر یافت نشد")
        }
      } catch (err) {
        console.error('Error fetching hotel details:', err)
        error("خطا در دریافت اطلاعات هتل")
      } finally {
        setLoading(false)
      }
    }

    if (currentHotelId) {
      fetchHotelDetails()
    }
  }, [currentHotelId, currentCheckIn, currentCheckOut])

  const formatPrice = (price: number, currency: string = "IRR") => {
    if (currency === "IRR" || currency === "تومان") {
      return price.toLocaleString("fa-IR") + " تومان"
    }
    return price.toLocaleString("fa-IR") + " " + currency
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR")
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

  const getRoomImage = (roomName: string, roomIndex: number) => {
    const roomNameLower = roomName.toLowerCase()
    
    if (roomNameLower.includes('استاندارد') || roomNameLower.includes('standard')) {
      return roomTypeImages.standard
    } else if (roomNameLower.includes('دلوکس') || roomNameLower.includes('deluxe')) {
      return roomTypeImages.deluxe
    } else if (roomNameLower.includes('سوئیت') || roomNameLower.includes('suite')) {
      return roomTypeImages.suite
    } else if (roomNameLower.includes('اجرایی') || roomNameLower.includes('executive')) {
      return roomTypeImages.executive
    } else if (roomNameLower.includes('خانواده') || roomNameLower.includes('family')) {
      return roomTypeImages.family
    } else if (roomNameLower.includes('پرزیدنت') || roomNameLower.includes('presidential')) {
      return roomTypeImages.presidential
    }
    return roomTypeImages.default
  }

  const handleRoomImageChange = (roomId: string, direction: 'next' | 'prev') => {
    setSelectedRoomImage(prev => {
      const currentIndex = prev[roomId] || 0
      const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
      return {
        ...prev,
        [roomId]: newIndex
      }
    })
  }

  const toggleFavorite = (hotelId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(hotelId)) {
        newFavorites.delete(hotelId)
        success("از لیست علاقه‌مندی‌ها حذف شد")
      } else {
        newFavorites.add(hotelId)
        success("به لیست علاقه‌مندی‌ها اضافه شد")
      }
      return newFavorites
    })
  }

  const handleReservation = (fareSourceCode:string) => {
    if (!hotelData) return
    
    router.push(`/hotels/reservation/${fareSourceCode}?checkIn=${currentCheckIn}&checkOut=${currentCheckOut}`)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hotelData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-800 mb-4">خطا در دریافت اطلاعات</h2>
          <p className="text-red-600">هتل مورد نظر یافت نشد</p>
          <Button className="mt-4" onClick={() => router.back()}>
            بازگشت
          </Button>
        </div>
      </div>
    )
  }

  const hasDiscount = hotelData.NetRateWithoutDiscount > hotelData.NetRate
  const discountPercentage = hasDiscount 
    ? Math.round(((hotelData.NetRateWithoutDiscount - hotelData.NetRate) / hotelData.NetRateWithoutDiscount) * 100)
    : 0

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">{hotelName}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span>5.0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>موقعیت مکانی</span>
                  </div>
                  {hotelData.HotelLabels.map((label, index) => (
                    <Badge key={index} variant="secondary" className="bg-white/20">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30"
                  onClick={() => toggleFavorite(hotelData.HotelId)}
                >
                  <Heart 
                    className={`h-5 w-5 ${
                      favorites.has(hotelData.HotelId) 
                        ? "fill-red-500 text-red-500" 
                        : "text-white"
                    }`} 
                  />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30"
                >
                  <Share2 className="h-5 w-5 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-96">
            <Image
              src={hotelImages[selectedImage]?.imageUrl || '/hotels/hotel-1.jpg'}
              alt={hotelName}
              fill
              className="object-cover rounded-t-lg"
            />
            {hotelImages.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
                {hotelImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 w-24 flex-shrink-0 ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={img.imageUrl}
                      alt={`${hotelName} ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="rooms" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">مشخصات</TabsTrigger>
              <TabsTrigger value="rooms">اتاق‌ها</TabsTrigger>
              <TabsTrigger value="policies">قوانین</TabsTrigger>
              <TabsTrigger value="amenities">امکانات</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">اطلاعات اقامت</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">تاریخ ورود</div>
                        <div className="font-medium">{formatDate(currentCheckIn)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">تاریخ خروج</div>
                        <div className="font-medium">{formatDate(currentCheckOut)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">ساعت تحویل اتاق</div>
                        <div className="font-medium">{hotelData.HotelPolicy.BeginTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">ساعت تخلیه اتاق</div>
                        <div className="font-medium">{hotelData.HotelPolicy.CheckOutTime}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Special Offers */}
              {(hotelData.Offer || hotelData.Promotion) && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">پیشنهادات ویژه</h3>
                    <div className="space-y-2">
                      {hotelData.Offer && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Badge variant="outline" className="bg-green-50">ویژه</Badge>
                          <span>{hotelData.Offer}</span>
                        </div>
                      )}
                      {hotelData.Promotion && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Badge variant="outline" className="bg-blue-50">تخفیف</Badge>
                          <span>{hotelData.Promotion}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Rooms Tab - Enhanced with Images */}
            <TabsContent value="rooms" className="space-y-6">
              {hotelItinenaries && hotelItinenaries.map((itinerary, index) => {
                const room = itinerary.Rooms?.[0]
                if (!room) return null
                
                return (
                  <Card key={itinerary.FareSourceCode} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex flex-col lg:flex-row">
                        {/* Room Image */}
                        <div className="lg:w-80 relative h-64 lg:h-auto">
                          <div className="relative w-full h-full">
                            {/* <Image
                              src={getRoomImage(room.Name)}
                              alt={room.Name}
                              fill
                              className="object-cover"
                              priority={index === 0}
                            /> */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            
                            {/* Room Badges */}
                            <div className="absolute top-3 left-3 flex flex-col gap-1">
                              {room.MealType && (
                                <Badge className="bg-green-500 text-white px-3 py-1 text-xs">
                                  {getMealTypeText(room.MealType)}
                                </Badge>
                              )}
                              {itinerary.NonRefundable && (
                                <Badge className="bg-red-500 text-white px-3 py-1 text-xs">
                                  غیرقابل استرداد
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Room Details */}
                        <div className="flex-1 p-6">
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                  <h4 className="text-xl font-bold text-gray-900 mb-2">
                                    {room.Name}
                                  </h4>
                                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                    <div className="flex items-center gap-1">
                                      <User className="h-4 w-4" />
                                      <span>{room.AdultCount} بزرگسال</span>
                                    </div>
                                    {room.ChildCount > 0 && (
                                      <div className="flex items-center gap-1">
                                        <Baby className="h-4 w-4" />
                                        <span>{room.ChildCount} کودک</span>
                                      </div>
                                    )}
                                    {room.BedGroups && (
                                      <div className="flex items-center gap-1">
                                        <Bed className="h-4 w-4" />
                                        <span>{room.BedGroups}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-green-600 mb-1">
                                    {formatPrice(itinerary.NetRate, itinerary.Currency)}
                                  </div>
                                  <div className="text-sm text-muted-foreground">برای هر شب</div>
                                </div>
                              </div>

                              {/* Room Features */}
                              {room.BedGroups && (
                                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                                  <p className="text-sm text-blue-800 font-medium">
                                    🛏️ ترتیب تخت: {room.BedGroups}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Room Actions */}
                            <div className="flex justify-between items-center pt-4 border-t">
                              <div className="text-sm text-muted-foreground">
                                {itinerary.AvailableRoom > 0 ? (
                                  <span className="text-green-600 font-medium">
                                    {itinerary.AvailableRoom} اتاق موجود
                                  </span>
                                ) : (
                                  <span className="text-red-600 font-medium">
                                    اتاقی موجود نیست
                                  </span>
                                )}
                              </div>
                              <Button 
                                onClick={() => handleReservation(itinerary.FareSourceCode)}
                                disabled={itinerary.AvailableRoom === 0}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                رزرو این اتاق
                                <ChevronLeft className="h-4 w-4 mr-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">سیاست کنسلی</h3>
                  {hotelData.PlainTextCancellationPolicy ? (
                    <p className="text-sm leading-relaxed">{hotelData.PlainTextCancellationPolicy}</p>
                  ) : (
                    <div className="space-y-3">
                      <div className={`p-3 rounded-lg ${
                        hotelData.NonRefundable 
                          ? 'bg-red-50 border border-red-200' 
                          : 'bg-green-50 border border-green-200'
                      }`}>
                        <div className="flex items-center gap-2">
                          <Badge variant={hotelData.NonRefundable ? "destructive" : "default"}>
                            {hotelData.NonRefundable ? "غیرقابل استرداد" : "قابل استرداد"}
                          </Badge>
                          <span className="text-sm">
                            {hotelData.NonRefundable 
                              ? "این رزرو غیرقابل کنسلی است" 
                              : "امکان کنسلی طبق قوانین هتل وجود دارد"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">قوانین هتل</h3>
                  <div className="space-y-3 text-sm">
                    {hotelData.HotelPolicy.InstructionsFa && (
                      <div>
                        <strong>دستورالعمل‌ها:</strong>
                        <p className="mt-1 text-muted-foreground">{hotelData.HotelPolicy.InstructionsFa}</p>
                      </div>
                    )}
                    {hotelData.HotelPolicy.SpecialInstructionsFa && (
                      <div>
                        <strong>دستورالعمل‌های ویژه:</strong>
                        <p className="mt-1 text-muted-foreground">{hotelData.HotelPolicy.SpecialInstructionsFa}</p>
                      </div>
                    )}
                    {hotelData.HotelPolicy.ChildPolicyDescriptionFa && (
                      <div>
                        <strong>سیاست کودکان:</strong>
                        <p className="mt-1 text-muted-foreground">{hotelData.HotelPolicy.ChildPolicyDescriptionFa}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Amenities Tab */}
            <TabsContent value="amenities" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">امکانات هتل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotelData.Amenities &&hotelData.Amenities.map((amenity, index) => {
                      const Icon = amenityIcons[amenity]
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow">
                          {Icon && <Icon className="h-5 w-5 text-blue-600" />}
                          <span className="text-sm font-medium">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Booking Card */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">رزرو هتل</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>قیمت نهایی:</span>
                  <div className="text-right">
                    {hasDiscount && (
                      <p className="text-sm line-through text-gray-500 mb-1">
                        {formatPrice(hotelData.NetRateWithoutDiscount, hotelData.Currency)}
                      </p>
                    )}
                    <p className="text-2xl font-bold text-green-600">
                      {formatPrice(hotelData.NetRate, hotelData.Currency)}
                    </p>
                    {hasDiscount && (
                      <Badge className="bg-red-500 text-white mt-1">
                        {discountPercentage}% تخفیف
                      </Badge>
                    )}
                  </div>
                </div>

                {hotelData.NonRefundable && (
                  <div className="flex items-center gap-2 text-red-600 text-sm p-2 bg-red-50 rounded-lg">
                    <Shield className="h-4 w-4" />
                    <span>غیرقابل استرداد</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-blue-50 rounded-lg">
                  <CreditCard className="h-4 w-4 text-blue-600" />
                  <span>پرداخت در هتل</span>
                </div>

                <Button
                  onClick={() => fareSourceCode && handleReservation(fareSourceCode)}
                  className="w-full h-12 text-lg bg-green-600 hover:bg-green-700"
                  size="lg"
                  disabled={hotelData.AvailableRoom === 0}
                >
                  {hotelData.AvailableRoom > 0 ? "رزرو الآن" : "اتاقی موجود نیست"}
                </Button>

                {hotelData.AvailableRoom > 0 && (
                  <div className="text-center text-sm text-green-600 bg-green-50 p-2 rounded-lg">
                    {hotelData.AvailableRoom} اتاق موجود
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-bold mb-2">نکات مهم</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• قیمت برای هر شب محاسبه شده است</li>
                <li>• مالیات و عوارض شامل قیمت شده است</li>
                <li>• امکان کنسلی طبق قوانین هتل وجود دارد</li>
                {hotelData.IsReserveOffline && (
                  <li>• رزرو این هتل به صورت آفلاین انجام می‌شود</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}