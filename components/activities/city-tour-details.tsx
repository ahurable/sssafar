// components/activities/city-tour-details.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, ChevronLeft, ChevronRight, Check, X, Calendar, ExternalLink } from "lucide-react"
import { useState } from "react"
import Image from "next/image"
import dynamic from 'next/dynamic'

// Dynamically import Leaflet to avoid SSR issues
const Map = dynamic(() => import('@/components/ui/map').then(mod => mod.Map), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 flex items-center justify-center">
      <div className="text-center text-gray-500">
        <MapPin className="h-8 w-8 mx-auto mb-2" />
        <p>در حال بارگذاری نقشه...</p>
      </div>
    </div>
  )
})

interface CityTourDetailsProps {
  tour: {
    id: string
    title: string
    description: string
    shortDescription: string
    city: {
      id: string
      name: string
      description: string
      image: string
    }
    location: string
    latitude?: number
    longitude?: number
    meetingPoint: string
    meetingLatitude?: number
    meetingLongitude?: number
    duration: number
    maxCapacity: number
    featured: boolean
    isActive: boolean
    images: string[]
    prices: { 
      id: string
      type: string
      price: number
      currency: string
      date: string
    }[]
    inclusions: { item: string }[]
    exclusions: { item: string }[]
    itineraries: { order: number; title: string; description: string; duration: number }[]
    createdAt: string
    updatedAt: string
  }
}

export function CityTourDetails({ tour }: CityTourDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours} ساعت و ${mins} دقیقه` : `${mins} دقیقه`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR')
  }

  const scrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const nextImage = () => {
    setCurrentImageIndex(prev => prev === tour.images.length - 1 ? 0 : prev + 1)
  }

  const prevImage = () => {
    setCurrentImageIndex(prev => prev === 0 ? tour.images.length - 1 : prev - 1)
  }

  const openInOpenStreetMap = (lat: number, lng: number) => {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=17/${lat}/${lng}`, '_blank')
  }

  const currentImage = tour.images[currentImageIndex] || tour.images[0]

  // Navigation sections
  const sections = [
    { id: 'itinerary', label: 'برنامه گشت' },
    { id: 'inclusions', label: 'شامل‌ها و غیر شامل‌ها' },
    { id: 'location', label: 'موقعیت مکانی' },
    { id: 'prices', label: 'قیمت‌ها و تاریخ‌ها' }
  ]

  return (
    <div className="space-y-6 bg-[#fffefe] p-4">
      {/* Navigation */}
      <Card className="sticky top-4 z-10 bg-[#fffefe] border border-gray-300 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {sections.map((section) => (
              <Button 
                key={section.id}
                variant="outline" 
                size="sm"
                className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                onClick={() => scrollToSection(section.id)}
              >
                {section.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <Card className="border border-gray-300 bg-blue-900 text-white">
        <CardContent className="p-6">
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              {tour.featured && (
                <Badge className="bg-yellow-500 text-white border-none">
                  ویژه
                </Badge>
              )}
              <Badge variant="secondary" className="bg-white/20 text-white border-none">
                {tour.city && tour.city.name}
              </Badge>
              {!tour.isActive && (
                <Badge variant="secondary" className="bg-red-500 text-white border-none">
                  غیرفعال
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-3">{tour.title}</h1>
            <p className="text-blue-100 text-lg">{tour.shortDescription}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <div>
                <div className="text-sm opacity-90">مدت زمان</div>
                <div className="font-semibold">{formatDuration(tour.duration)}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <div>
                <div className="text-sm opacity-90">ظرفیت</div>
                <div className="font-semibold">{tour.maxCapacity} نفر</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <div>
                <div className="text-sm opacity-90">شهر</div>
                <div className="font-semibold">{tour.city && tour.city.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <div>
                <div className="text-sm opacity-90">آخرین بروزرسانی</div>
                <div className="font-semibold text-sm">{formatDate(tour.updatedAt)}</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Gallery */}
      {tour.images.length > 0 && (
        <Card className="border border-gray-300 py-6">
          <CardContent className="p-0">
            <div className="relative h-96 bg-gray-100 overflow-hidden">
              <Image
                src={currentImage}
                alt={tour.title}
                fill
                className="object-cover"
                priority
              />
              
              {tour.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none"
                    onClick={prevImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white border-none"
                    onClick={nextImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 text-sm">
                    {currentImageIndex + 1} / {tour.images.length}
                  </div>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {tour.images.length > 1 && (
              <div className="p-4 border-t border-gray-300">
                <div className="flex gap-2 overflow-x-auto">
                  {tour.images.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-20 h-16 overflow-hidden border-2 ${
                        index === currentImageIndex ? 'border-blue-900' : 'border-gray-300'
                      }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <Image
                        src={image}
                        alt={`تصویر ${index + 1}`}
                        width={80}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card className="border border-gray-300 py-6">
        <CardHeader className="border-b border-gray-300">
          <CardTitle className="text-blue-900">توضیحات گشت</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-700 leading-relaxed text-lg">{tour.description}</p>
        </CardContent>
      </Card>

      {/* Itinerary */}
      <Card id="itinerary" className="border border-gray-300 py-6">
        <CardHeader className="border-b border-gray-300">
          <CardTitle className="text-blue-900">برنامه گشت</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {tour.itineraries.map((item, index) => (
            <div key={index} className="border-r-4 border-blue-900 pr-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg text-gray-900">
                  {item.order}. {item.title}
                </h3>
                {item.duration > 0 && (
                  <Badge className="bg-blue-100 text-blue-900 border-none">
                    {item.duration} دقیقه
                  </Badge>
                )}
              </div>
              <p className="text-gray-700">{item.description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Inclusions & Exclusions */}
      <div id="inclusions" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-gray-300 py-6">
          <CardHeader className="border-b border-gray-300">
            <CardTitle className="flex items-center gap-2 text-green-700">
              <Check className="h-5 w-5" />
              شامل‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              {tour.inclusions.map((inclusion, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span>{inclusion.item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="border border-gray-300 py-6">
          <CardHeader className="border-b border-gray-300">
            <CardTitle className="flex items-center gap-2 text-red-700">
              <X className="h-5 w-5" />
              غیر شامل‌ها
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <ul className="space-y-3">
              {tour.exclusions.map((exclusion, index) => (
                <li key={index} className="flex items-center gap-3 text-gray-700">
                  <X className="h-5 w-5 text-red-600 flex-shrink-0" />
                  <span>{exclusion.item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Location */}
      <Card id="location" className="border border-gray-300 py-6">
        <CardHeader className="border-b border-gray-300">
          <CardTitle className="text-blue-900">موقعیت مکانی</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">موقعیت اصلی</h4>
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <MapPin className="h-4 w-4" />
                <span>{tour.location}</span>
              </div>
              {tour.latitude && tour.longitude && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                  onClick={() => openInOpenStreetMap(tour.latitude!, tour.longitude!)}
                >
                  <ExternalLink className="h-4 w-4 ml-2" />
                  مشاهده در OpenStreetMap
                </Button>
              )}
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">نقطه تجمع</h4>
              <div className="flex items-center gap-2 text-gray-700 mb-2">
                <MapPin className="h-4 w-4" />
                <span>{tour.meetingPoint}</span>
              </div>
              {tour.meetingLatitude && tour.meetingLongitude && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                  onClick={() => openInOpenStreetMap(tour.meetingLatitude!, tour.meetingLongitude!)}
                >
                  <ExternalLink className="h-4 w-4 ml-2" />
                  مشاهده در OpenStreetMap
                </Button>
              )}
            </div>
          </div>

          {/* Map */}
          {tour.latitude && tour.longitude && (
            <div className="h-96 border border-gray-300">
              <Map 
                center={[tour.latitude, tour.longitude]} 
                zoom={15}
                className="h-full w-full"
                markers={[
                  {
                    position: [tour.latitude, tour.longitude],
                    popup: tour.location
                  },
                  ...(tour.meetingLatitude && tour.meetingLongitude ? [{
                    position: [tour.meetingLatitude, tour.meetingLongitude],
                    popup: `نقطه تجمع: ${tour.meetingPoint}`
                  }] : [])
                ]}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prices & Dates */}
      <Card id="prices" className="border border-gray-300 py-6">
        <CardHeader className="border-b border-gray-300">
          <CardTitle className="text-blue-900">قیمت‌ها و تاریخ‌ها</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tour.prices.map((price, index) => (
              <Card key={price.id} className="border border-gray-300 bg-gray-50 py-6">
                <CardContent className="p-4 text-center">
                  <div className="font-semibold text-lg text-gray-900 mb-2">
                    {price.type}
                  </div>
                  <div className="text-2xl font-bold text-green-700 mb-3">
                    {price.price.toLocaleString('fa-IR')} {price.currency}
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>تاریخ: {formatDate(price.date)}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    آخرین بروزرسانی: {formatDateTime(price.date)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Status */}
      <Card className="border border-gray-300 py-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">وضعیت فعالیت</h3>
              <p className="text-gray-600">
                {tour.isActive ? 'این گشت شهری در حال حاضر فعال است' : 'این گشت شهری در حال حاضر غیرفعال است'}
              </p>
            </div>
            <Badge className={tour.isActive ? "bg-green-100 text-green-800 border-none" : "bg-red-100 text-red-800 border-none"}>
              {tour.isActive ? 'فعال' : 'غیرفعال'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}