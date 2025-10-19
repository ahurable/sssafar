"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Coffee, Car, Dumbbell, Utensils, Snowflake, Tv, Users, ChevronLeft, Heart, Share2, Clock, User, Child } from "lucide-react"
import { useHotel } from "@/contexts/search/HotelContext"
import Link from "next/link"

interface HotelPricedItinerary {
  HotelId: number
  FareSourceCode: string
  NetRate: number
  NetRateWithoutDiscount: number
  Currency: string
  NonRefundable: boolean
  Promotion?: string
  Offer?: string
  AvailableRoom: number
  Rooms: Array<{
    Name: string
    RoomMapName: string
    MealType: string
    AdultCount: number
    ChildCount: number
    BedGroups?: string
  }>
  Amenities: string[]
  PlainTextCancellationPolicy?: string
}

interface HotelName {
  hotelId: number
  name: string
}

interface HotelImageData {
  hotelId: number
  imageUrl: string
}

// Enhanced amenity icons mapping
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

const HOTELS_PER_PAGE = 10

export function HotelList() {
  const { filteredHotels, hotelData, getHotelNames, request, getHotelsImages } = useHotel()
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hotelNames, setHotelNames] = useState<HotelName[]>([])
  const [hotelImages, setHotelImages] = useState<HotelImageData[]>([])
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  
  // Get all available hotel IDs
  const allHotelIds = (filteredHotels || (hotelData?.Success ? hotelData.PricedItineraries : [])).map(hotel => hotel.HotelId)
  
  // Calculate pagination
  const totalPages = Math.ceil(allHotelIds.length / HOTELS_PER_PAGE)
  const hasMoreHotels = currentPage < totalPages
  
  // Get currently displayed hotels
  const displayedHotels = (hotelData?.PricedItineraries || []).slice(0, currentPage * HOTELS_PER_PAGE)

  // Function to load hotel names and images
  const loadHotelData = async (hotels: HotelPricedItinerary[]) => {
    if (!hotels || hotels.length === 0) return

    const hotelIds = hotels.map(hotel => hotel.HotelId)
    
    try {
      const [names, images] = await Promise.all([
        getHotelNames(hotelIds),
        getHotelsImages(hotelIds)
      ])
      
      setHotelNames(names || [])
      setHotelImages(images || [])
    } catch (error) {
      console.error("Error loading hotel data:", error)
    }
  }

  useEffect(() => {
    console.log("HotelData updated, initializing...")
    console.log(hotelData)
    
    setLoading(true)
    
    if (hotelData?.PricedItineraries && hotelData.PricedItineraries.length > 0) {
      setCurrentPage(1)
      
      const loadInitialHotelData = async () => {
        // Load names and images for the initial hotels
        await loadHotelData(hotelData.PricedItineraries.slice(0, HOTELS_PER_PAGE))
        setLoading(false)
      }

      loadInitialHotelData()
    } else {
      setLoading(false)
    }
  }, [hotelData])

  useEffect(() => {
    console.log("Hotel Names:", hotelNames)
    console.log("Hotel Images:", hotelImages)
  }, [hotelNames, hotelImages])

  const loadMoreHotels = async () => {
    if (!hasMoreHotels || !hotelData?.PricedItineraries) return
    
    setLoadingMore(true)
    
    // Load names and images for the next batch of hotels
    const nextBatch = hotelData.PricedItineraries.slice(
      displayedHotels.length, 
      displayedHotels.length + HOTELS_PER_PAGE
    )
    
    await loadHotelData(nextBatch)
    setCurrentPage(prev => prev + 1)
    setLoadingMore(false)
  }

  const toggleFavorite = (hotelId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(hotelId)) {
        newFavorites.delete(hotelId)
      } else {
        newFavorites.add(hotelId)
      }
      return newFavorites
    })
  }

  const getMainImage = (hotelId: number): string => {
    const hotelImage = hotelImages.find(h => h.hotelId === hotelId)
    return hotelImage?.imageUrl || getRandomImage(hotelId)
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

  const calculateDiscount = (original: number, discounted: number) => {
    return Math.round(((original - discounted) / original) * 100)
  }

  const getHotelName = (hotelId: number): string => {
    return hotelNames.find(h => h.hotelId === hotelId)?.name || `هتل ${hotelId}`
  }

  // Modern loading skeleton
  if (loading) {
    return (
      <div className="grid gap-4 md:gap-6">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-80 h-64 bg-gray-200 animate-pulse rounded-l-2xl" />
              <div className="flex-1 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="h-7 bg-gray-200 rounded animate-pulse w-3/4" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
                  </div>
                  <div className="h-9 bg-gray-200 rounded-xl animate-pulse w-28" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3, 4].map((badge) => (
                    <div key={badge} className="h-8 bg-gray-200 rounded-full animate-pulse w-24" />
                  ))}
                </div>
                <div className="h-16 bg-gray-200 rounded-xl animate-pulse w-full" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  // Show error or initial state
  if (!hotelData) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-8 max-w-md mx-auto border border-emerald-100">
          <p className="text-lg text-emerald-700 font-medium">
            لطفاً جستجوی هتل را انجام دهید
          </p>
        </div>
      </div>
    )
  }

  if (!hotelData.Success) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 max-w-md mx-auto border border-red-100">
          <p className="text-lg text-red-700 font-medium">
            {hotelData.Error?.Message || "خطا در دریافت اطلاعات هتل‌ها"}
          </p>
        </div>
      </div>
    )
  }

  if (displayedHotels.length === 0 && !loading) {
    return (
      <div className="text-center py-12">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 max-w-md mx-auto border border-blue-100">
          <p className="text-lg text-blue-700 font-medium">هتلی با مشخصات درخواستی یافت نشد</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-right">
            <h2 className="text-2xl font-bold mb-2">
              {allHotelIds.length} هتل پیدا شد
            </h2>
            <p className="text-emerald-100 text-lg">
              تاریخ اقامت: {new Date(hotelData.CheckIn).toLocaleDateString("fa-IR")} - {new Date(hotelData.CheckOut).toLocaleDateString("fa-IR")}
            </p>
          </div>
          {displayedHotels.length < allHotelIds.length && (
            <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-xl border border-white/30">
              <p className="text-lg font-semibold">
                {displayedHotels.length} از {allHotelIds.length} هتل
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hotel Grid */}
      <div className="grid gap-6 md:gap-8">
        {displayedHotels.map((hotel, index) => {
          const hasDiscount = hotel.NetRateWithoutDiscount > hotel.NetRate
          const discountPercentage = hasDiscount 
            ? calculateDiscount(hotel.NetRateWithoutDiscount, hotel.NetRate)
            : 0

          return (
            <Card 
              key={hotel.FareSourceCode || index} 
              className="overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-emerald-100 rounded-3xl bg-white group"
            >
              <CardContent className="p-0">
                <div className="flex flex-col xl:flex-row">
                  {/* Hotel Image Section */}
                  <div className="relative xl:w-96 h-72 xl:h-auto">
                    <div className="relative w-full h-full rounded-t-3xl xl:rounded-l-3xl xl:rounded-r-none overflow-hidden">
                      <Image 
                        src={getMainImage(hotel.HotelId)} 
                        alt={getHotelName(hotel.HotelId)} 
                        fill
                        sizes="(max-width: 768px) 100vw, 400px"
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = getRandomImage(hotel.HotelId)
                        }}
                      />
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent xl:bg-gradient-to-r xl:from-black/30 xl:to-transparent"></div>
                      
                      {/* Image Overlay Badges */}
                      <div className="absolute top-4 left-4 flex flex-col gap-2">
                        {hotel.NonRefundable && (
                          <Badge className="bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold border-2 border-white shadow-lg">
                            غیرقابل استرداد
                          </Badge>
                        )}
                        {hasDiscount && (
                          <Badge className="bg-emerald-500 text-white px-4 py-2 rounded-full text-sm font-bold border-2 border-white shadow-lg">
                            {discountPercentage}% تخفیف ویژه
                          </Badge>
                        )}
                        {hotel.Promotion && (
                          <Badge className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-bold border-2 border-white shadow-lg">
                            {hotel.Promotion}
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex gap-3">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-0"
                          onClick={() => toggleFavorite(hotel.HotelId)}
                        >
                          <Heart 
                            className={`h-5 w-5 ${
                              favorites.has(hotel.HotelId) 
                                ? "fill-red-500 text-red-500" 
                                : "text-gray-700"
                            }`} 
                          />
                        </Button>
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm hover:bg-white shadow-lg border-0"
                        >
                          <Share2 className="h-5 w-5 text-gray-700" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Details Section */}
                  <div className="flex-1 p-6 xl:p-8">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-6 mb-6">
                        <div className="flex-1 space-y-4">
                          <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <h3 className="text-2xl xl:text-3xl font-black text-gray-900 leading-tight">
                                {getHotelName(hotel.HotelId)}
                              </h3>
                              {hotel.Offer && (
                                <Badge className="bg-gradient-to-r from-amber-400 to-orange-400 text-white px-4 py-2 rounded-full text-base font-bold border-0">
                                  {hotel.Offer}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Rating and Location */}
                            <div className="flex flex-wrap items-center gap-4 text-base">
                              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-2xl border border-yellow-200">
                                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                <span className="font-bold text-gray-900">5.0</span>
                                <span className="text-gray-600 text-sm">(120 نظر)</span>
                              </div>
                              <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200">
                                <MapPin className="h-5 w-5 text-blue-500" />
                                <span className="text-gray-700 font-medium">تهران، ایران</span>
                              </div>
                            </div>
                          </div>

                          {/* Room Information */}
                          <div className="space-y-3">
                            {hotel.Rooms && hotel.Rooms.map((room, roomIndex) => (
                              <div key={roomIndex} className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-4 border-2 border-emerald-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="space-y-2">
                                    <h4 className="font-bold text-lg text-emerald-900">
                                      {room.Name || room.RoomMapName}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-3 text-sm">
                                      <span className="bg-white px-3 py-1 rounded-full text-emerald-700 font-medium border border-emerald-300">
                                        {getMealTypeText(room.MealType)}
                                      </span>
                                      <div className="flex items-center gap-2 text-emerald-800">
                                        <User className="h-4 w-4" />
                                        <span className="font-medium">{room.AdultCount} بزرگسال</span>
                                      </div>
                                      {room.ChildCount > 0 && (
                                        <div className="flex items-center gap-2 text-emerald-800">
                                          <Child className="h-4 w-4" />
                                          <span className="font-medium">{room.ChildCount} کودک</span>
                                        </div>
                                      )}
                                    </div>
                                    {room.BedGroups && (
                                      <p className="text-sm text-emerald-700 font-medium mt-2">
                                        🛏️ ترتیب تخت: {room.BedGroups}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Price Section */}
                        <div className="text-center lg:text-right bg-gradient-to-br from-emerald-500 to-green-500 rounded-2xl p-6 lg:p-8 shadow-lg border-2 border-emerald-400 min-w-[200px]">
                          <div className="space-y-3">
                            {hasDiscount && (
                              <p className="text-lg line-through text-emerald-100 font-medium">
                                {formatPrice(hotel.NetRateWithoutDiscount, hotel.Currency)}
                              </p>
                            )}
                            <p className="text-3xl lg:text-4xl font-black text-white mb-2">
                              {formatPrice(hotel.NetRate, hotel.Currency)}
                            </p>
                            <p className="text-emerald-100 text-lg font-medium">برای هر شب</p>
                            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 mt-2">
                              <p className="text-white text-sm font-bold">{hotel.AvailableRoom} اتاق موجود</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      {hotel.Amenities && hotel.Amenities.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-lg font-bold text-gray-900 mb-3">امکانات هتل</h4>
                          <div className="flex flex-wrap gap-3">
                            {hotel.Amenities.slice(0, 6).map((amenity, amenityIndex) => {
                              const Icon = amenityIcons[amenity]
                              return (
                                <Badge 
                                  key={amenityIndex} 
                                  className="flex items-center gap-2 text-sm px-4 py-3 rounded-2xl bg-white border-2 border-emerald-200 text-gray-700 font-medium shadow-sm"
                                >
                                  {Icon && <Icon className="h-4 w-4 text-emerald-500" />}
                                  {amenity}
                                </Badge>
                              )
                            })}
                            {hotel.Amenities.length > 6 && (
                              <Badge className="text-sm rounded-2xl px-4 py-3 bg-gradient-to-r from-emerald-400 to-green-400 text-white font-bold border-0">
                                +{hotel.Amenities.length - 6} امکانات دیگر
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mt-auto pt-6 border-t-2 border-emerald-100">
                        <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                          {hotel.AvailableRoom > 0 && (
                            <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-2xl border border-green-200">
                              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                              <span className="font-medium">{hotel.AvailableRoom} اتاق موجود</span>
                            </div>
                          )}
                          {hotel.PlainTextCancellationPolicy && (
                            <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-2xl border border-blue-200">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="font-medium">کنسلاسیون رایگان</span>
                            </div>
                          )}
                        </div>
                        
                        <Link 
                          href={`/hotels/${hotel.HotelId}?&checkIn=${hotelData.CheckIn}&checkOut=${hotelData.CheckOut}`}
                          className="w-full lg:w-auto"
                        >
                          <Button className="w-full lg:w-auto bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white px-10 py-4 rounded-2xl font-black text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-105 border-0">
                            <span>مشاهده و رزرو اتاق</span>
                            <ChevronLeft className="h-5 w-5 mr-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Load More Button */}
      {hasMoreHotels && (
        <div className="flex justify-center mt-12">
          <Button 
            onClick={loadMoreHotels} 
            disabled={loadingMore}
            className="bg-gradient-to-r from-emerald-400 to-green-400 hover:from-emerald-500 hover:to-green-500 text-white px-12 py-6 rounded-2xl font-black text-lg shadow-2xl hover:shadow-3xl transition-all duration-300 border-0"
            size="lg"
          >
            {loadingMore ? (
              <span className="flex items-center gap-3">
                <div className="h-6 w-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-xl">در حال بارگذاری...</span>
              </span>
            ) : (
              <span className="flex items-center gap-4 text-xl">
                نمایش هتل‌های بیشتر
                <span className="bg-white/30 text-white px-3 py-1 rounded-xl text-base font-bold">
                  +{Math.min(HOTELS_PER_PAGE, allHotelIds.length - displayedHotels.length)}
                </span>
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Completion Message */}
      {!hasMoreHotels && displayedHotels.length > 0 && (
        <div className="text-center py-12">
          <div className="bg-gradient-to-r from-emerald-400 to-green-400 rounded-3xl p-8 inline-block shadow-2xl">
            <p className="text-white font-black text-xl">
              ✅ تمام {displayedHotels.length} هتل نمایش داده شد
            </p>
          </div>
        </div>
      )}
    </div>
  )
}