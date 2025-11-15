// app/tours/page.tsx
"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, Users, Star, Clock, Plane, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface Tour {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  featured: boolean
  isActive: boolean
  prices: {
    type: string
    price: number
    description: string
  }[]
  routes: {
    city: string
    country: string
    duration: number
  }[]
  images: {
    path: string
    isPrimary: boolean
    altText: string
  }[]
  transports: any[]
  tourCity?: {
    id: string
    name: string
    description: string
    image: string
  }
}

interface TourCity {
  id: string
  name: string
  description: string
  image: string
  _count: {
    tours: number
  }
}

// Tour City Card Component
function TourCityCard({ 
  city, 
  isSelected, 
  onSelect 
}: { 
  city: TourCity
  isSelected: boolean
  onSelect: (city: TourCity) => void 
}) {
  return (
    <Card 
      className={`cursor-pointer transition-all duration-300 overflow-hidden border-2 ${
        isSelected 
          ? 'border-blue-500 shadow-lg scale-105' 
          : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
      }`}
      onClick={() => onSelect(city)}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={city.image || "/placeholder-city.jpg"}
          alt={city.name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-bold text-xl mb-2">{city.name}</h3>
          <Badge className="bg-white/20 text-white border-none backdrop-blur-sm">
            {city._count.tours} تور
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <p className="text-gray-600 text-sm line-clamp-2">
          {city.description}
        </p>
      </CardContent>
    </Card>
  )
}

// Tour Card Component
function TourCard({ tour }: { tour: Tour }) {
  const router = useRouter()
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const getPriceRange = (prices: { price: number }[]) => {
    if (!prices || prices && !prices.length) return "تعیین نشده"
    const minPrice = Math.min(...prices.map(p => p.price))
    const maxPrice = Math.max(...prices.map(p => p.price))
    return minPrice === maxPrice 
      ? `${minPrice.toLocaleString('fa-IR')} تومان`
      : `${minPrice.toLocaleString('fa-IR')} - ${maxPrice.toLocaleString('fa-IR')} تومان`
  }

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return `${diffDays} روز`
  }

  const primaryImage = tour.images?.find(img => img.isPrimary) || tour.images?.[0]

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 group">
      {/* Image Section */}
      {primaryImage && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={primaryImage.path}
            alt={primaryImage.altText || tour.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            {tour.featured && (
              <Badge className="bg-amber-500 text-white">
                <Star className="h-3 w-3 ml-1" />
                ویژه
              </Badge>
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        </div>
      )}
      
      <CardContent className="p-6">
        {/* Title and Description */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{tour.title}</h3>
          <p className="text-gray-600 text-sm line-clamp-2">{tour.description}</p>
        </div>

        {/* Tour Details */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(tour.startDate)}</span>
            <span className="text-gray-400">تا</span>
            <span>{formatDate(tour.endDate)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>{getDuration(tour.startDate, tour.endDate)}</span>
          </div>

          {tour.routes && tour.routes.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">
                {tour.routes.map(route => route.city).join('، ')}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm font-bold text-green-600">
            <span>{getPriceRange(tour.prices)}</span>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700 py-2"
          onClick={() => router.push(`/tours/${tour.id}`)}
        >
          مشاهده جزئیات و رزرو
        </Button>
      </CardContent>
    </Card>
  )
}

// Loading Component
function ToursLoading() {
  return (
    <div className="min-h-screen bg-[#fffefe]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">تورهای مسافرتی</h1>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
        </div>
        
        {/* Cities Loading */}
        <div className="mb-8">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Tours Loading */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Content Component
function ToursContent() {
  const [tourCities, setTourCities] = useState<TourCity[]>([])
  const [tours, setTours] = useState<Tour[]>([])
  const [selectedCity, setSelectedCity] = useState<TourCity | null>(null)
  const [loading, setLoading] = useState(true)
  const [citiesLoading, setCitiesLoading] = useState(true)
  const router = useRouter()

  // Fetch tour cities
  useEffect(() => {
    const fetchTourCities = async () => {
      try {
        setCitiesLoading(true)
        const response = await fetch('/api/tour-cities')
        if (response.ok) {
          const data = await response.json()
          setTourCities(data.cities || [])
          
          // Select first city by default
          if (data.cities?.length > 0) {
            setSelectedCity(data.cities[0])
          }
        }
      } catch (error) {
        console.error('Error fetching tour cities:', error)
      } finally {
        setCitiesLoading(false)
      }
    }

    fetchTourCities()
  }, [])

  // Fetch tours when city changes
  useEffect(() => {
    const fetchTours = async () => {
      if (!selectedCity) return
      
      try {
        setLoading(true)
        const queryParams = new URLSearchParams()
        queryParams.append('city', selectedCity.id)
        
        const response = await fetch(`/api/tours/search?${queryParams.toString()}`)
        if (response.ok) {
          const data = await response.json()
          console.log(data)
          setTours(data)
        }
        console.log(tours)
      } catch (error) {
        console.error('Error fetching tours:', error)
        setTours([])
      } finally {
        setLoading(false)
      }
    }

    fetchTours()
  }, [selectedCity])

  const handleCitySelect = (city: TourCity) => {
    setSelectedCity(city)
  }

  if (citiesLoading) {
    return <ToursLoading />
  }

  return (
    <div className="min-h-screen bg-[#fffefe]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-4">
            تورهای مسافرتی
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            بهترین تجربه‌های سفر را با تورهای اختصاصی ما تجربه کنید
          </p>
        </div>

        {/* Tour Cities Selection */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              انتخاب مقصد
            </h2>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4" />
              <span>{tourCities.length} شهر توریستی</span>
            </div>
          </div>

          {tourCities.length === 0 ? (
            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <MapPin className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-blue-800">
                  هنوز شهری تعریف نشده
                </h3>
                <p className="text-blue-600 mb-6">
                  برای مشاهده تورها، ابتدا شهرهای توریستی را ایجاد کنید
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {tourCities.map((city) => (
                <TourCityCard
                  key={city.id}
                  city={city}
                  isSelected={selectedCity?.id === city.id}
                  onSelect={handleCitySelect}
                />
              ))}
            </div>
          )}
        </div>

        {/* Selected City Info */}
        {selectedCity && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {selectedCity.image && (
                  <div className="w-24 h-24 md:w-32 md:h-32 overflow-hidden rounded-xl flex-shrink-0">
                    <img
                      src={selectedCity.image}
                      alt={selectedCity.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 text-center md:text-right">
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                    تورهای {selectedCity.name}
                  </h2>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-3xl">
                    {selectedCity.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tours Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              تورهای موجود
              {selectedCity && (
                <span className="text-blue-600 mr-2"> در {selectedCity.name}</span>
              )}
            </h2>
            
            {tours.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{tours.length} تور فعال</span>
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <div className="h-48 bg-gray-200"></div>
                  <CardContent className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tours.length === 0 ? (
            <Card className="border-blue-100 bg-blue-50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Plane className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-blue-800">
                  {selectedCity ? `هیچ توری برای ${selectedCity.name} یافت نشد` : "تور فعالی یافت نشد"}
                </h3>
                <p className="text-blue-600 mb-6">
                  {selectedCity 
                    ? "به زودی تورهای جدیدی برای این شهر اضافه خواهد شد"
                    : "لطفاً یک شهر را انتخاب کنید"
                  }
                </p>
                {!selectedCity && tourCities.length > 0 && (
                  <Button 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setSelectedCity(tourCities[0])}
                  >
                    مشاهده تورهای {tourCities[0].name}
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tours.map((tour) => (
                  <TourCard key={tour.id} tour={tour} />
                ))}
              </div>

              {/* Load More Button (if needed) */}
              {tours.length >= 9 && (
                <div className="text-center mt-8">
                  <Button variant="outline" className="px-8">
                    مشاهده تورهای بیشتر
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default function ToursPage() {
  return (
    <>
      <Header />
      <ToursContent />
      <Footer />
    </>
  )
}