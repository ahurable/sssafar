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
  const displayedHotels = (filteredHotels|| []).slice(0, currentPage * HOTELS_PER_PAGE) || (hotelData?.PricedItineraries || []).slice(0, currentPage * HOTELS_PER_PAGE)

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

  // Minimal loading skeleton
  if (loading) {
    return (
      <div className="grid gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="bg-[#fffefe] border border-gray-200 overflow-hidden">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-80 h-64 bg-gray-200 animate-pulse" />
              <div className="flex-1 p-4 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-3 flex-1">
                    <div className="h-6 bg-gray-200 animate-pulse w-3/4" />
                    <div className="h-4 bg-gray-200 animate-pulse w-1/2" />
                  </div>
                  <div className="h-8 bg-gray-200 animate-pulse w-24" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {[1, 2, 3].map((badge) => (
                    <div key={badge} className="h-6 bg-gray-200 animate-pulse w-20" />
                  ))}
                </div>
                <div className="h-12 bg-gray-200 animate-pulse w-full" />
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
      <div className="text-center py-8">
        <div className="bg-gray-50 p-6 max-w-md mx-auto border border-gray-200">
          <p className="text-gray-700">
            لطفاً جستجوی هتل را انجام دهید
          </p>
        </div>
      </div>
    )
  }

  if (!hotelData.Success) {
    return (
      <div className="text-center py-8">
        <div className="bg-red-50 p-6 max-w-md mx-auto border border-red-200">
          <p className="text-red-700">
            {hotelData.Error?.Message || "خطا در دریافت اطلاعات هتل‌ها"}
          </p>
        </div>
      </div>
    )
  }

  if (displayedHotels.length === 0 && !loading) {
    return (
      <div className="text-center py-8">
        <div className="bg-blue-50 p-6 max-w-md mx-auto border border-blue-200">
          <p className="text-blue-700">هتلی با مشخصات درخواستی یافت نشد</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header Stats */}
      <div className="bg-blue-900 p-4 text-white">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-right">
            <h2 className="text-xl font-bold mb-1">
              {allHotelIds.length} هتل پیدا شد
            </h2>
            <p className="text-gray-300 text-sm">
              تاریخ اقامت: {new Date(hotelData.CheckIn).toLocaleDateString("fa-IR")} - {new Date(hotelData.CheckOut).toLocaleDateString("fa-IR")}
            </p>
          </div>
          {displayedHotels.length < allHotelIds.length && (
            <div className="bg-gray-800 px-4 py-2 border border-gray-600">
              <p className="text-sm font-medium">
                {displayedHotels.length} از {allHotelIds.length} هتل
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hotel Grid */}
      <div className="grid gap-4">
        {displayedHotels.map((hotel, index) => {
          const hasDiscount = hotel.NetRateWithoutDiscount > hotel.NetRate
          const discountPercentage = hasDiscount 
            ? calculateDiscount(hotel.NetRateWithoutDiscount, hotel.NetRate)
            : 0

          return (
            <Card 
              key={hotel.FareSourceCode || index} 
              className="overflow-hidden hover:shadow-md transition-all duration-200 border border-gray-200 bg-[#fffefe]"
            >
              <CardContent className="p-0">
                <div className="flex flex-col xl:flex-row">
                  {/* Hotel Image Section */}
                  <div className="relative xl:w-80 h-64 xl:h-auto">
                    <div className="relative w-full h-full overflow-hidden">
                      <Image 
                        src={getMainImage(hotel.HotelId)} 
                        alt={getHotelName(hotel.HotelId)} 
                        fill
                        sizes="(max-width: 768px) 100vw, 320px"
                        className="object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = getRandomImage(hotel.HotelId)
                        }}
                      />
                      
                      <div className="absolute inset-0 bg-black/20"></div>
                      
                      {/* Image Overlay Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {hotel.NonRefundable && (
                          <Badge className="bg-red-600 text-white px-3 py-1 text-xs font-medium border-0">
                            غیرقابل استرداد
                          </Badge>
                        )}
                        {hasDiscount && (
                          <Badge className="bg-green-600 text-white px-3 py-1 text-xs font-medium border-0">
                            {discountPercentage}% تخفیف
                          </Badge>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <Button
                          variant="secondary"
                          size="icon"
                          className="h-8 w-8 bg-[#fffefe]/90 hover:bg-[#fffefe] shadow-sm border-0"
                          onClick={() => toggleFavorite(hotel.HotelId)}
                        >
                          <Heart 
                            className={`h-4 w-4 ${
                              favorites.has(hotel.HotelId) 
                                ? "fill-red-500 text-red-500" 
                                : "text-gray-700"
                            }`} 
                          />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Hotel Details Section */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-col h-full">
                      {/* Header */}
                      <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                        <div className="flex-1 space-y-3">
                          <div className="space-y-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                              <h3 className="text-xl font-bold text-blue-900">
                                {getHotelName(hotel.HotelId)}
                              </h3>
                              {hotel.Offer && (
                                <Badge className="bg-orange-500 text-white px-3 py-1 text-xs font-medium border-0">
                                  {hotel.Offer}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Rating and Location */}
                            <div className="flex flex-wrap items-center gap-3 text-sm">
                              <div className="flex items-center gap-1 bg-gray-100 px-3 py-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-medium text-blue-900">5.0</span>
                                <span className="text-gray-600 text-xs">(120 نظر)</span>
                              </div>
                            </div>
                          </div>

                          {/* Room Information */}
                          <div className="space-y-2">
                            {hotel.Rooms && hotel.Rooms.map((room, roomIndex) => (
                              <div key={roomIndex} className="bg-gray-50 p-3 border border-gray-200">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                  <div className="space-y-1">
                                    <h4 className="font-bold text-blue-900">
                                      {room.Name || room.RoomMapName}
                                    </h4>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                      <span className="bg-[#fffefe] px-2 py-1 text-gray-700 font-medium border border-gray-300">
                                        {getMealTypeText(room.MealType)}
                                      </span>
                                      <div className="flex items-center gap-1 text-gray-700">
                                        <User className="h-3 w-3" />
                                        <span className="font-medium">{room.AdultCount} بزرگسال</span>
                                      </div>
                                      {room.ChildCount > 0 && (
                                        <div className="flex items-center gap-1 text-gray-700">
                                          <Child className="h-3 w-3" />
                                          <span className="font-medium">{room.ChildCount} کودک</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Price Section */}
                        <div className="text-center w-full lg:w-max lg:h-full lg:flex lg:items-center bg-blue-50 p-4 text-blue-900 min-w-[160px]">
                          <div className="space-y-2">
                            {hasDiscount && (
                              <p className="text-sm line-through text-blue-900">
                                {formatPrice(hotel.NetRateWithoutDiscount, hotel.Currency)}
                              </p>
                            )}
                            <p className="text-lg font-bold mb-1">
                              {formatPrice(hotel.NetRate, hotel.Currency)}
                            </p>
                            <p className="text-blue-900 text-sm">برای هر شب</p>
                          </div>
                        </div>
                      </div>

                      {/* Amenities */}
                      {hotel.Amenities && hotel.Amenities.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-bold text-blue-900 mb-2">امکانات هتل</h4>
                          <div className="flex flex-wrap gap-2">
                            {hotel.Amenities.slice(0, 5).map((amenity, amenityIndex) => {
                              const Icon = amenityIcons[amenity]
                              return (
                                <Badge 
                                  key={amenityIndex} 
                                  className="flex items-center gap-1 text-xs px-3 py-1 bg-[#fffefe] border border-gray-300 text-gray-700 font-medium"
                                >
                                  {Icon && <Icon className="h-3 w-3 text-gray-500" />}
                                  {amenity}
                                </Badge>
                              )
                            })}
                            {hotel.Amenities.length > 5 && (
                              <Badge className="text-xs px-3 py-1 bg-gray-600 text-white font-medium border-0">
                                +{hotel.Amenities.length - 5} بیشتر
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Footer Actions */}
                      <div className="flex flex-col lg:flex-row justify-between items-center gap-3 mt-auto pt-4 border-t border-gray-200">
                        <div className="flex flex-wrap gap-3 text-xs text-gray-700">
                          {hotel.AvailableRoom > 0 && (
                            <div className="flex items-center gap-1 bg-green-50 px-3 py-1 border border-green-200">
                              <div className="w-2 h-2 bg-green-500"></div>
                              <span className="font-medium">{hotel.AvailableRoom} اتاق موجود</span>
                            </div>
                          )}
                        </div>
                        
                        <Link 
                          href={`/hotels/${hotel.HotelId}?&checkIn=${hotelData.CheckIn}&checkOut=${hotelData.CheckOut}`}
                          className="w-full lg:w-auto"
                        >
                          <Button className="w-full lg:w-auto bg-blue-900 hover:bg-gray-800 text-white px-6 py-3 font-medium text-sm border-0">
                            <span>مشاهده و رزرو</span>
                            <ChevronLeft className="h-4 w-4 mr-2" />
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
        <div className="flex justify-center mt-8">
          <Button 
            onClick={loadMoreHotels} 
            disabled={loadingMore}
            className="bg-blue-900 hover:bg-gray-800 text-white px-8 py-4 font-medium border-0"
          >
            {loadingMore ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin"></div>
                <span>در حال بارگذاری...</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                نمایش هتل‌های بیشتر
                <span className="bg-[#fffefe]/20 text-white px-2 py-1 text-xs font-medium">
                  +{Math.min(HOTELS_PER_PAGE, allHotelIds.length - displayedHotels.length)}
                </span>
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Completion Message */}
      {!hasMoreHotels && displayedHotels.length > 0 && (
        <div className="text-center py-8">
          <div className="bg-blue-900 p-4 inline-block">
            <p className="text-white font-medium text-sm">
              تمام {displayedHotels.length} هتل نمایش داده شد
            </p>
          </div>
        </div>
      )}
    </div>
  )
}