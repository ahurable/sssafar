"use client"

import React, { useState, useEffect, useMemo, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  ChevronLeft,
  Heart,
  Clock,
  User
} from "lucide-react"
import { useHotel } from "@/contexts/search/HotelContext"
import Link from "next/link"

// Interfaces
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

interface HotelData {
  Success: boolean
  PricedItineraries: HotelPricedItinerary[]
  CheckIn: string
  CheckOut: string
  Error?: {
    Message: string
  }
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
  "Spa": Users,
  "Business Center": Users,
  "Bar": Coffee,
}

// Constants
const HOTELS_PER_PAGE = 10
const BATCH_SIZE = 50
const MAX_INITIAL_LOAD = 100

// Helper function to get random placeholder image
const getRandomPlaceholderImage = (hotelId: number) => {
  const images = [
    "/luxury-hotel-lobby-tehran.jpg",
    "/hotel-room-tehran.jpg",
    "/hotel-exterior-tehran.jpg",
  ]
  const index = hotelId % images.length
  return images[index]
}

// Loading Skeleton Component
const LoadingSkeleton = ({ count = 3 }: { count?: number }) => (
  <div className="grid gap-4">
    {Array.from({ length: count }).map((_, index) => (
      <div key={index} className="bg-white border border-blue-900 rounded-lg overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-80 h-64 bg-gray-200 animate-pulse" />
          <div className="flex-1 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="space-y-3 flex-1">
                <div className="h-7 bg-gray-200 animate-pulse rounded w-3/4" />
                <div className="h-4 bg-gray-200 animate-pulse rounded w-1/2" />
              </div>
              <div className="h-10 bg-gray-200 animate-pulse rounded w-32" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {[1, 2, 3].map((badge) => (
                <div key={badge} className="h-6 bg-gray-200 animate-pulse rounded w-20" />
              ))}
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 animate-pulse rounded w-full" />
              <div className="h-4 bg-gray-200 animate-pulse rounded w-5/6" />
            </div>
            <div className="h-12 bg-gray-200 animate-pulse rounded w-full" />
          </div>
        </div>
      </div>
    ))}
  </div>
)

// Error Message Component
const ErrorMessage = ({ message = "خطا در دریافت اطلاعات هتل‌ها" }: { message?: string }) => (
  <div className="text-center py-12">
    <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
      <div className="text-red-600 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-red-700 font-medium">{message}</p>
    </div>
  </div>
)

// No Hotel Data Message Component
const NoHotelDataMessage = () => (
  <div className="text-center py-12">
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 max-w-md mx-auto">
      <div className="text-blue-600 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <p className="text-blue-700 font-medium">لطفاً جستجوی هتل را انجام دهید</p>
    </div>
  </div>
)

// No Hotels Found Message Component
const NoHotelsFoundMessage = () => (
  <div className="text-center py-12">
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 max-w-md mx-auto">
      <div className="text-yellow-600 mb-4">
        <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-yellow-700 font-medium">هتلی با مشخصات درخواستی یافت نشد</p>
    </div>
  </div>
)

// Hotel Card Component
interface HotelCardProps {
  hotel: HotelPricedItinerary
  hotelName: string
  hotelImage: string
  hasDiscount: boolean
  discountPercentage: number
  isFavorite: boolean
  checkIn: string
  checkOut: string
  toggleFavorite: (hotelId: number) => void
}

const HotelCard = React.memo(({
  hotel,
  hotelName,
  hotelImage,
  hasDiscount,
  discountPercentage,
  isFavorite,
  checkIn,
  checkOut,
  toggleFavorite
}: HotelCardProps) => {
  const formatPrice = useCallback((price: number, currency: string = "IRR") => {
    if (currency === "IRR" || currency === "تومان") {
      return price.toLocaleString("fa-IR") + " تومان"
    }
    return price.toLocaleString("fa-IR") + " " + currency
  }, [])

  const getMealTypeText = useCallback((mealType: string) => {
    const mealTypes: Record<string, string> = {
      "BB": "صبحانه",
      "HB": "صبحانه و ناهار",
      "FB": "تمام وعده‌ها",
      "AI": "همه‌شمول",
      "RO": "بدون غذا",
      "SC": "صبحانه قاره‌ای",
      "CB": "صبحانه کامل"
    }
    return mealTypes[mealType] || mealType
  }, [])

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-200 border border-blue-900 bg-white hover:border-blue-300">
      <CardContent className="p-0">
        <div className="flex flex-col xl:flex-row">
          {/* Hotel Image Section */}
          <div className="relative xl:w-80 h-64 xl:h-auto">
            <div className="relative w-full h-full overflow-hidden">
              <Image
                src={hotelImage}
                alt={hotelName}
                fill
                sizes="(max-width: 768px) 100vw, 320px"
                className="object-cover hover:scale-105 transition-transform duration-300"
                priority={false}
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = getRandomPlaceholderImage(hotel.HotelId)
                }}
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

              {/* Image Overlay Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1">
                {hotel.NonRefundable && (
                  <Badge className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-xs font-medium border-0 shadow-sm">
                    غیرقابل استرداد
                  </Badge>
                )}
                {hasDiscount && (
                  <Badge className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs font-medium border-0 shadow-sm">
                    {discountPercentage}% تخفیف
                  </Badge>
                )}
                {hotel.Promotion && (
                  <Badge className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 text-xs font-medium border-0 shadow-sm">
                    {hotel.Promotion}
                  </Badge>
                )}
              </div>

              {/* Favorite Button */}
              <div className="absolute top-3 right-3">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-9 w-9 bg-white/90 hover:bg-white shadow-md rounded-full border border-blue-900"
                  onClick={() => toggleFavorite(hotel.HotelId)}
                >
                  <Heart
                    className={`h-5 w-5 transition-colors ${isFavorite
                      ? "fill-red-500 text-red-500"
                      : "text-gray-600 hover:text-red-500"
                      }`}
                  />
                </Button>
              </div>
            </div>
          </div>

          {/* Hotel Details Section */}
          <div className="flex-1 p-6">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-4">
                <div className="flex-1 space-y-4">
                  {/* Hotel Name and Offer */}
                  <div className="space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-2">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1">
                        {hotelName}
                      </h3>
                      {hotel.Offer && (
                        <Badge className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 text-xs font-medium border-0 self-start">
                          {hotel.Offer}
                        </Badge>
                      )}
                    </div>

                    {/* Rating and Location */}
                    <div className="flex flex-wrap items-center gap-3 text-sm">
                      <div className="flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-lg">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-blue-900">5.0</span>
                        <span className="text-gray-600 text-xs pr-1">(120 نظر)</span>
                      </div>
                      <div className="flex items-center gap-1 text-gray-600">
                        <MapPin className="h-4 w-4" />
                        <span className="text-sm">تهران، میدان آزادی</span>
                      </div>
                    </div>
                  </div>

                  {/* Room Information */}
                  <div className="space-y-2">
                    {hotel.Rooms && hotel.Rooms.map((room, roomIndex) => (
                      <div key={roomIndex} className="bg-gray-50 p-4 rounded-lg border border-blue-900">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="space-y-2">
                            <h4 className="font-bold text-gray-900 text-sm">
                              {room.Name || room.RoomMapName}
                            </h4>
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge variant="outline" className="text-xs px-3 py-1">
                                {getMealTypeText(room.MealType)}
                              </Badge>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 text-gray-700">
                                  <User className="h-3.5 w-3.5" />
                                  <span className="text-xs font-medium">{room.AdultCount} بزرگسال</span>
                                </div>
                                {room.ChildCount > 0 && (
                                  <div className="flex items-center gap-1 text-gray-700">
                                    <User className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">{room.ChildCount} کودک</span>
                                  </div>
                                )}
                              </div>
                              {room.BedGroups && (
                                <Badge variant="outline" className="text-xs px-3 py-1">
                                  {room.BedGroups}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Section */}
                <div className="text-center w-full lg:w-auto lg:min-w-[180px] bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border border-blue-200">
                  <div className="space-y-2">
                    {hasDiscount && (
                      <div className="space-y-1">
                        <p className="text-sm line-through text-gray-500">
                          {formatPrice(hotel.NetRateWithoutDiscount, hotel.Currency)}
                        </p>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 text-xs font-medium">
                          صرفه‌جویی {discountPercentage}%
                        </Badge>
                      </div>
                    )}
                    <div>
                      <p className="text-2xl font-bold text-gray-900 mb-1">
                        {formatPrice(hotel.NetRate, hotel.Currency)}
                      </p>
                      <p className="text-gray-600 text-sm">برای هر شب</p>
                    </div>
                    {hotel.AvailableRoom > 0 && hotel.AvailableRoom < 5 && (
                      <div className="pt-2">
                        <Badge className="bg-red-100 text-red-800 hover:bg-red-100 text-xs font-medium">
                          فقط {hotel.AvailableRoom} اتاق باقی مانده
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Amenities */}
              {hotel.Amenities && hotel.Amenities.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-sm font-bold text-gray-900 mb-3">امکانات هتل</h4>
                  <div className="flex flex-wrap gap-2">
                    {hotel.Amenities.slice(0, 6).map((amenity, amenityIndex) => {
                      const Icon = amenityIcons[amenity]
                      return (
                        <Badge
                          key={amenityIndex}
                          variant="outline"
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-white border-blue-900 text-gray-700 hover:bg-gray-50"
                        >
                          {Icon && <Icon className="h-3.5 w-3.5 text-blue-600" />}
                          <span>{amenity}</span>
                        </Badge>
                      )
                    })}
                    {hotel.Amenities.length > 6 && (
                      <Badge className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 border-0">
                        +{hotel.Amenities.length - 6} بیشتر
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mt-auto pt-5 border-t border-blue-900">
                <div className="flex flex-wrap gap-3 text-xs">
                  {hotel.AvailableRoom > 4 && (
                    <div className="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="font-medium text-green-800">{hotel.AvailableRoom} اتاق موجود</span>
                    </div>
                  )}
                  {hotel.PlainTextCancellationPolicy && (
                    <div className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                      <Clock className="h-3.5 w-3.5 text-blue-600" />
                      <span className="font-medium text-blue-800">سیاست لغو رزرو</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 w-full lg:w-auto">
                  <Button
                    variant="outline"
                    className="flex-1 lg:flex-none bg-white hover:bg-gray-50 text-gray-700 border-blue-900"
                    onClick={() => window.open(`/hotels/${hotel.HotelId}`, '_blank')}
                  >
                    <span>مشاهده جزئیات</span>
                  </Button>
                  <Link
                    href={`/hotels/${hotel.HotelId}?checkIn=${checkIn}&checkOut=${checkOut}&fareSourceCode=${hotel.FareSourceCode}`}
                    className="flex-1 lg:flex-none"
                  >
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md">
                      <span className="font-medium">رزرو هتل</span>
                      <ChevronLeft className="h-4 w-4 mr-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

HotelCard.displayName = 'HotelCard'

// Main Hotel List Component
export function HotelList() {
  const { filteredHotels, hotelData, getHotelNames, getHotelsImages, request } = useHotel()
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [hotelNames, setHotelNames] = useState<Record<number, string>>({})
  const [hotelImages, setHotelImages] = useState<Record<number, string>>({})
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [loadedHotelIds, setLoadedHotelIds] = useState<Set<number>>(new Set())
  const [error, setError] = useState<string | null>(null)

  // Memoize hotel data
  const allHotels = useMemo(() => {
    if (filteredHotels && filteredHotels.length > 0) {
      return filteredHotels
    }
    return hotelData?.Success ? hotelData.PricedItineraries || [] : []
  }, [filteredHotels, hotelData])

  const allHotelIds = useMemo(() => {
    return allHotels.map(hotel => hotel.HotelId)
  }, [allHotels])

  // Calculate pagination
  const totalPages = useMemo(() => {
    return Math.ceil(allHotelIds.length / HOTELS_PER_PAGE)
  }, [allHotelIds.length])

  const hasMoreHotels = currentPage < totalPages

  // Get displayed hotels
  const displayedHotels = useMemo(() => {
    const startIndex = 0
    const endIndex = currentPage * HOTELS_PER_PAGE
    return allHotels.slice(startIndex, endIndex)
  }, [allHotels, currentPage])

  // Load hotel data in batches
  const loadHotelDataBatch = useCallback(async (hotelIds: number[]) => {
    if (!hotelIds || hotelIds.length === 0) return

    try {
      // Split into batches
      const batches = []
      for (let i = 0; i < hotelIds.length; i += BATCH_SIZE) {
        batches.push(hotelIds.slice(i, i + BATCH_SIZE))
      }

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i]

        // Skip if already loaded
        const needsLoading = batch.filter(id => !loadedHotelIds.has(id))
        if (needsLoading.length === 0) continue

        const [names, images] = await Promise.all([
          getHotelNames(needsLoading),
          getHotelsImages(needsLoading)
        ])

        // Update hotel names
        if (names && Array.isArray(names)) {
          setHotelNames(prev => {
            const newNames = { ...prev }
            names.forEach(name => {
              if (name && name.hotelId && !newNames[name.hotelId]) {
                newNames[name.hotelId] = name.name
              }
            })
            return newNames
          })
        }

        // Update hotel images
        if (images && Array.isArray(images)) {
          setHotelImages(prev => {
            const newImages = { ...prev }
            images.forEach(image => {
              if (image && image.hotelId && !newImages[image.hotelId]) {
                newImages[image.hotelId] = image.imageUrl
              }
            })
            return newImages
          })
        }

        // Mark as loaded
        setLoadedHotelIds(prev => {
          const newSet = new Set(prev)
          needsLoading.forEach(id => newSet.add(id))
          return newSet
        })

        // Add delay between batches for better performance
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 50))
        }
      }
    } catch (error) {
      console.error("Error loading hotel data:", error)
      setError("خطا در بارگذاری اطلاعات هتل‌ها")
    }
  }, [getHotelNames, getHotelsImages, loadedHotelIds])

  // Initial load effect
  useEffect(() => {
    if (!allHotels || allHotels.length === 0) {
      setLoading(false)
      return
    }

    const initialLoad = async () => {
      setLoading(true)
      setError(null)

      try {
        // Load initial batch
        const initialIds = allHotelIds.slice(0, Math.min(MAX_INITIAL_LOAD, allHotelIds.length))

        if (initialIds.length > 0) {
          await loadHotelDataBatch(initialIds)
        }

        setCurrentPage(1)
      } catch (error) {
        console.error("Initial load error:", error)
        setError("خطا در بارگذاری اولیه اطلاعات")
      } finally {
        setLoading(false)
      }
    }

    initialLoad()
  }, [allHotels, allHotelIds, loadHotelDataBatch])

  // Handle load more
  const handleLoadMore = async () => {
    if (!hasMoreHotels || loadingMore) return

    setLoadingMore(true)

    try {
      // Pre-load data for next page
      const nextBatchStart = displayedHotels.length
      const nextBatchEnd = Math.min(
        nextBatchStart + (HOTELS_PER_PAGE * 2),
        allHotelIds.length
      )
      const nextBatchIds = allHotelIds.slice(nextBatchStart, nextBatchEnd)

      // Load any missing data
      const idsToLoad = nextBatchIds.filter(id => !loadedHotelIds.has(id))
      if (idsToLoad.length > 0) {
        await loadHotelDataBatch(idsToLoad)
      }

      setCurrentPage(prev => prev + 1)
    } catch (error) {
      console.error("Load more error:", error)
      setError("خطا در بارگذاری هتل‌های بیشتر")
    } finally {
      setLoadingMore(false)
    }
  }

  // Toggle favorite
  const toggleFavorite = useCallback((hotelId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(hotelId)) {
        newFavorites.delete(hotelId)
      } else {
        newFavorites.add(hotelId)
      }
      return newFavorites
    })
  }, [])

  // Get hotel name with fallback
  const getHotelName = useCallback((hotelId: number): string => {
    return hotelNames[hotelId] || `هتل ${hotelId}`
  }, [hotelNames])

  // Get hotel image with fallback
  const getHotelImage = useCallback((hotelId: number): string => {
    const image = hotelImages[hotelId]
    // Ensure the URL is valid
    if (image && (image.startsWith('http') || image.startsWith('/'))) {
      return image
    }
    return getRandomPlaceholderImage(hotelId)
  }, [hotelImages])


  // Calculate discount
  const calculateDiscount = useCallback((original: number, discounted: number) => {
    if (original <= 0 || discounted <= 0) return 0
    return Math.round(((original - discounted) / original) * 100)
  }, [])

  // Render hotel card
  const renderHotelCard = useCallback((hotel: HotelPricedItinerary) => {
    const hasDiscount = hotel.NetRateWithoutDiscount > hotel.NetRate
    const discountPercentage = calculateDiscount(hotel.NetRateWithoutDiscount, hotel.NetRate)
    const hotelName = getHotelName(hotel.HotelId)
    const hotelImage = getHotelImage(hotel.HotelId)
    const isFavorite = favorites.has(hotel.HotelId)

    return (
      <HotelCard
        key={`${hotel.HotelId}-${hotel.FareSourceCode}`}
        hotel={hotel}
        hotelName={hotelName}
        hotelImage={hotelImage}
        hasDiscount={hasDiscount}
        discountPercentage={discountPercentage}
        isFavorite={isFavorite}
        checkIn={hotelData?.CheckIn || ""}
        checkOut={hotelData?.CheckOut || ""}
        toggleFavorite={toggleFavorite}
      />
    )
  }, [getHotelName, getHotelImage, calculateDiscount, favorites, hotelData, toggleFavorite])

  // Loading state
  if (loading && displayedHotels.length === 0) {
    return <LoadingSkeleton count={3} />
  }

  // Error state
  if (error) {
    return <ErrorMessage message={error} />
  }

  // No hotel data
  if (!hotelData) {
    return <NoHotelDataMessage />
  }

  // API error
  if (!hotelData.Success) {
    return <ErrorMessage message={hotelData.Error?.Message || "خطا در دریافت اطلاعات هتل‌ها"} />
  }

  // No hotels found
  if (displayedHotels.length === 0 && !loading) {
    return <NoHotelsFoundMessage />
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 p-6 text-white rounded-lg shadow-sm">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-right space-y-2">
            <h2 className="text-2xl font-bold">
              {allHotelIds.length.toLocaleString("fa-IR")} هتل پیدا شد
            </h2>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-sm text-blue-100">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  تاریخ اقامت: {new Date(hotelData.CheckIn).toLocaleDateString("fa-IR")} - {new Date(hotelData.CheckOut).toLocaleDateString("fa-IR")}
                </span>
              </div>
              <div className="hidden sm:block">•</div>
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  {request?.guests} مهمان
                </span>
              </div>
            </div>
          </div>

          {displayedHotels.length < allHotelIds.length && (
            <div className="bg-blue-800/50 backdrop-blur-sm px-5 py-3 rounded-lg border border-blue-700">
              <p className="text-sm font-medium text-center">
                <span className="block text-lg font-bold mb-1">
                  {displayedHotels.length.toLocaleString("fa-IR")}
                </span>
                از {allHotelIds.length.toLocaleString("fa-IR")} هتل
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Hotel List */}
      <div className="space-y-6">
        {displayedHotels.map(hotel => renderHotelCard(hotel))}
      </div>

      {/* Load More Button */}
      {hasMoreHotels && (
        <div className="flex justify-center mt-8">
          <Button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-6 font-medium shadow-lg hover:shadow-xl transition-all duration-200 border-0"
            size="lg"
          >
            {loadingMore ? (
              <span className="flex items-center gap-3">
                <div className="h-5 w-5 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                <span className="font-medium">در حال بارگذاری...</span>
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <span className="font-medium">نمایش هتل‌های بیشتر</span>
                <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                  +{Math.min(HOTELS_PER_PAGE, allHotelIds.length - displayedHotels.length).toLocaleString("fa-IR")}
                </span>
              </span>
            )}
          </Button>
        </div>
      )}

      {/* Completion Message */}
      {!hasMoreHotels && displayedHotels.length > 0 && (
        <div className="text-center py-10">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200 inline-block">
            <div className="flex items-center gap-3 text-green-700">
              <CheckCircleIcon className="h-6 w-6" />
              <div className="text-right">
                <p className="font-bold text-lg">بارگذاری کامل شد!</p>
                <p className="text-sm mt-1">
                  تمام {displayedHotels.length.toLocaleString("fa-IR")} هتل نمایش داده شد
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator for initial load */}
      {loading && displayedHotels.length > 0 && (
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-blue-600">
            <div className="h-4 w-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full"></div>
            <span className="text-sm font-medium">در حال بارگذاری هتل‌های بیشتر...</span>
          </div>
        </div>
      )}
    </div>
  )
}

// Calendar Icon Component
const CalendarIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
)

// Check Circle Icon Component
const CheckCircleIcon = ({ className = "h-6 w-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)