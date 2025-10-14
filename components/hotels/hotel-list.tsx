"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Coffee, Car, Dumbbell, Utensils, Snowflake, Tv, Users } from "lucide-react"
import { HotelImage, useHotel } from "@/contexts/search/HotelContext"
import Link from "next/link"

// Types based on the API response
interface HotelPricedItinerary {
  FareSourceCode: string
  Offer: string
  Promotion: string
  NonRefundable: boolean
  HotelId: number
  HotelPolicy: {
    BeginTime: string
    EndTime: string
    MinAge: string
    CheckOutTime: string
    Instructions: string
    SpecialInstructions: string
    MandatoryFee: string
    OptionalFee: string
    KnowBeforeYouGo: string
    PaymentDetail: string
    LicenseNumber: string
    KeyCollectionInfo: string
    InstructionsFa: string
    SpecialInstructionsFa: string
    ChildPolicyDescriptionFa: string
    SingleWomanDescriptionFa: string
    PetAttribiute: Array<{ name: string }>
  }
  ExtraCharge: {
    Excluded: string
    Included: string
    MealplanDescription: string
  }
  PaymentDeadline: string
  Currency: string
  AvailableRoom: number
  PlainTextCancellationPolicy: string
  NetRate: number
  NetRateWithoutDiscount: number
  ExtraBedRate: number
  BaseRate: number
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
  }>
  Surcharges: Array<{
    Name: string
    ChargeType: string
    SupplierAmount: number
    Amount: number
    ExclusionType: number
  }>
  CancellationPolicies: Array<{
    Amount: number
    FromDate: string
  }>
  Remarks: string[]
  RemarksFa: string[]
  Amenities: string[]
  IsReserveOffline: boolean
  IsBlockout: boolean
  HotelLabels: string[]
}

interface HotelSearchResponse {
  Success: boolean
  SearchId: number
  Error?: {
    Id: string
    Message: string
  }
  CheckIn: string
  CheckOut: string
  PricedItineraries: HotelPricedItinerary[]
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

// Mock hotel images since they're not in the API response
const mockHotelImages = [
  "/hotels/hotel-1.jpg",
  "/hotels/hotel-2.jpg",
  "/hotels/hotel-3.jpg",
  "/hotels/hotel-4.jpg",
  "/hotels/hotel-5.jpg",
]

export function HotelList() {
  const { filteredHotels, hotelData, getHotelNames, getHotelImages, getHotelsImages } = useHotel() // Use getHotelNames here
  const [loading, setLoading] = useState(false)
  const [hotelList, setHotelList] = useState<HotelPricedItinerary[]>([])
  const [hotelNames, setHotelNames] = useState<{[key: number]: string}>({}) // Add this state
  const [hotelImages, setHotelImages] = useState<{[key: number]: HotelImage[]}>({})

  

  useEffect(() => {
    console.log("HotelData updated:", hotelData)

    if (filteredHotels) {
      setHotelList(filteredHotels)
      setLoading(false)
      
      // Load hotel names
      const loadHotelData = async () => {
        const hotelIds = filteredHotels.map(hotel => hotel.HotelId);
        
        // Load names and images in parallel
        const [names, images] = await Promise.all([
          getHotelNames(hotelIds),
          getHotelsImages(hotelIds)
        ]);
        
        setHotelNames(names);
        setHotelImages(images);
      };

      loadHotelData()
    }
    
    else if (hotelData && hotelData.Success && hotelData.PricedItineraries) {
      setHotelList(hotelData.PricedItineraries)
      setLoading(false)

      console.log(hotelData)
      
      // Load hotel names
      const loadHotelData = async () => {
        const hotelIds = hotelData.PricedItineraries.map(hotel => hotel.HotelId);
        
        // Load names and images in parallel
        const [names, images] = await Promise.all([
          getHotelNames(hotelIds),
          getHotelsImages(hotelIds)
        ]);
        
        setHotelNames(names);
        setHotelImages(images);
      };

      loadHotelData()
    } else {
      setHotelList([])
    }
  }, [hotelData, getHotelNames])

  const getMainImage = (hotelId: number): string => {
    const images = hotelImages[hotelId] || [];
    console.log(images)
    if (images.length === 0) {
      return getRandomImage(hotelId); // Fallback to your mock images
    }
    
    // Try to find main.jpg first, then hero.jpg, then first image
    const mainImage = images.find(img => img.Name.includes('main.jpg'));
    if (mainImage) return mainImage.Name;
    
    const heroImage = images.find(img => img.Name.includes('hero.jpg'));
    if (heroImage) return heroImage.Name;
    
    return images[0].Name;
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((item) => (
          <Card key={item} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="relative h-48 md:h-full bg-gray-200 animate-pulse" />
                <div className="p-4 md:col-span-2 space-y-3">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((badge) => (
                      <div key={badge} className="h-6 bg-gray-200 rounded animate-pulse w-20" />
                    ))}
                  </div>
                  <div className="h-8 bg-gray-200 rounded animate-pulse w-32" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  // Show error or initial state
  if (!hotelData) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          لطفاً جستجوی هتل را انجام دهید
        </p>
      </div>
    )
  }

  if (!hotelData.Success) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          {hotelData.Error?.Message || "خطا در دریافت اطلاعات هتل‌ها"}
        </p>
      </div>
    )
  }

  if (hotelList.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">هتلی با مشخصات درخواستی یافت نشد</p>
      </div>
    )
  }

  const getRandomImage = (hotelId: number) => {
    return "/luxury-hotel-lobby-tehran.jpg"
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-muted-foreground">
          {hotelList.length} هتل یافت شد
        </p>
        <div className="text-sm text-muted-foreground">
          تاریخ اقامت: {new Date(hotelData.CheckIn).toLocaleDateString("fa-IR")} - {new Date(hotelData.CheckOut).toLocaleDateString("fa-IR")}
        </div>
      </div>

      {hotelList.map((hotel, index) => (
        <Card key={hotel.FareSourceCode || index} className="overflow-hidden hover:shadow-lg transition-shadow border-2">
          <CardContent className="p-0">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Hotel Image */}
              <div className="relative h-48 md:h-full">
                <Image 
                  src={getMainImage(hotel.HotelId)} 
                  alt={hotelNames[hotel.HotelId] || `Hotel ${hotel.HotelId}`} 
                  fill 
                  className="object-cover" 
                  onError={(e) => {
                    // Fallback to mock image if real image fails to load
                    e.currentTarget.src = getRandomImage(hotel.HotelId);
                  }}
                />
                {hotel.NonRefundable && (
                  <Badge className="absolute top-2 left-2 bg-red-500">
                    غیرقابل استرداد
                  </Badge>
                )}
                {hotel.Promotion && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    {hotel.Promotion}
                  </Badge>
                )}
              </div>

              {/* Hotel Details */}
              <div className="p-4 md:col-span-2">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      {hotelNames[hotel.HotelId] || `هتل ${hotel.HotelId}`} {/* Use the actual name here */}
                      {hotel.Offer && (
                        <span className="text-sm font-normal text-green-600 mr-2">
                          ({hotel.Offer})
                        </span>
                      )}
                    </h3>
                    
                    {/* Room Information */}
                    <div className="space-y-2 mb-3">
                      {hotel.Rooms && hotel.Rooms.map((room, roomIndex) => (
                        <div key={roomIndex} className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span className="font-medium">{room.Name || room.RoomMapName}</span>
                            <span>•</span>
                            <span>{getMealTypeText(room.MealType)}</span>
                            <span>•</span>
                            <span>{room.AdultCount} بزرگسال</span>
                            {room.ChildCount > 0 && (
                              <span>• {room.ChildCount} کودک</span>
                            )}
                          </div>
                          {room.BedGroups && (
                            <p className="text-xs mt-1">تخت: {room.BedGroups}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rating and Price */}
                  <div className="text-right min-w-[120px]">
                    <div className="flex items-center justify-end gap-1 mb-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-bold">5.0</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">قیمت هر شب از</p>
                      <p className="text-2xl font-bold text-primary">
                        {formatPrice(hotel.NetRate, hotel.Currency)}
                      </p>
                      {hotel.NetRateWithoutDiscount > hotel.NetRate && (
                        <p className="text-sm line-through text-muted-foreground">
                          {formatPrice(hotel.NetRateWithoutDiscount, hotel.Currency)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Amenities */}
                {hotel.Amenities && hotel.Amenities.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.Amenities.slice(0, 6).map((amenity, amenityIndex) => {
                      const Icon = amenityIcons[amenity]
                      return (
                        <Badge key={amenityIndex} variant="secondary" className="flex items-center gap-1 text-xs">
                          {Icon && <Icon className="h-3 w-3" />}
                          {amenity}
                        </Badge>
                      )
                    })}
                    {hotel.Amenities.length > 6 && (
                      <Badge variant="outline" className="text-xs">
                        +{hotel.Amenities.length - 6} بیشتر
                      </Badge>
                    )}
                  </div>
                )}

                {/* Hotel Labels */}
                {hotel.HotelLabels && hotel.HotelLabels.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {hotel.HotelLabels.map((label, labelIndex) => (
                      <Badge key={labelIndex} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Policies and Additional Info */}
                <div className="flex items-center justify-between pt-3 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    {hotel.AvailableRoom > 0 && (
                      <p>✅ {hotel.AvailableRoom} اتاق موجود</p>
                    )}
                    {hotel.ExtraCharge?.Included && (
                      <p>شامل: {hotel.ExtraCharge.Included}</p>
                    )}
                    {hotel.PlainTextCancellationPolicy && (
                      <p>سیاست کنسلی: {hotel.PlainTextCancellationPolicy}</p>
                    )}
                  </div>
                  <Link href={`/hotels/${hotel.FareSourceCode}?hotelId=${hotel.HotelId}&checkIn=${hotelData.CheckIn}&checkOut=${hotelData.CheckOut}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      انتخاب اتاق
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}