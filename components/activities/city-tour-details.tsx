// components/activities/city-tour-details.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { useState, useRef } from "react"
import Image from "next/image"

interface CityTourDetailsProps {
  tour: {
    id: string
    title: string
    description: string
    shortDescription: string
    city: string
    location: string
    latitude?: number
    longitude?: number
    meetingPoint: string
    meetingLatitude?: number
    meetingLongitude?: number
    duration: number
    maxCapacity: number
    featured: boolean
    images: string[]
    prices: { type: string; price: number; currency: string }[]
    inclusions: { id: string; item: string }[]
    exclusions: { id: string; item: string }[]
    itineraries: { id: string; order: number; title: string; description: string; duration: number }[]
  }
}

export function CityTourDetails({ tour }: CityTourDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const itineraryRef = useRef<HTMLDivElement>(null)
  const inclusionsRef = useRef<HTMLDivElement>(null)
  const locationRef = useRef<HTMLDivElement>(null)

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours} ساعت و ${mins} دقیقه` : `${mins} دقیقه`
  }

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === tour.images.length - 1 ? 0 : prev + 1
    )
  }

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? tour.images.length - 1 : prev - 1
    )
  }

  const currentImage = tour.images[currentImageIndex] || tour.images[0]

  return (
    <div className="space-y-6">
      {/* Navigation Buttons */}
      <Card className="sticky py-6 top-4 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => scrollToSection(itineraryRef)}
            >
              برنامه گشت
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => scrollToSection(inclusionsRef)}
            >
              شامل‌ها و غیر شامل‌ها
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => scrollToSection(locationRef)}
            >
              موقعیت مکانی
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {tour.featured && (
                <Badge variant="secondary" className="bg-yellow-500 text-white">
                  ویژه
                </Badge>
              )}
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                {tour.city}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>
            <p className="text-blue-100 text-lg">{tour.shortDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="font-semibold">{tour.city}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      {tour.images.length > 0 && (
        <Card className="py-6">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={currentImage}
                alt={tour.title}
                fill
                className="object-cover"
              />
              
              {/* Navigation Arrows */}
              {tour.images.length > 1 && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={prevImage}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white"
                    onClick={nextImage}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </>
              )}

              {/* Image Counter */}
              {tour.images.length > 1 && (
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {tour.images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {tour.images.length > 1 && (
              <div className="p-4">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {tour.images.map((image, index) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 ${
                        index === currentImageIndex 
                          ? 'border-blue-500' 
                          : 'border-gray-200'
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
      <Card className="py-6">
        <CardHeader>
          <CardTitle>توضیحات گشت</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed text-lg">{tour.description}</p>
        </CardContent>
      </Card>

      {/* Itinerary Section */}
      <div ref={itineraryRef}>
        <Card className="py-6">
          <CardHeader>
            <CardTitle>برنامه گشت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {tour.itineraries.map((item) => (
              <div key={item.id} className="border-r-4 border-blue-500 pr-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg">{item.order}. {item.title}</h3>
                  {item.duration > 0 && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      {item.duration} دقیقه
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Inclusions & Exclusions Section */}
      <div ref={inclusionsRef}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Inclusions */}
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                شامل‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tour.inclusions.map((inclusion) => (
                  <li key={inclusion.id} className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{inclusion.item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Exclusions */}
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <X className="h-5 w-5" />
                غیر شامل‌ها
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {tour.exclusions.map((exclusion) => (
                  <li key={exclusion.id} className="flex items-center gap-2 text-sm">
                    <X className="h-4 w-4 text-red-500" />
                    <span>{exclusion.item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Location Section */}
      <div ref={locationRef}>
        <Card className="py-6">
          <CardHeader>
            <CardTitle>موقعیت مکانی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">موقعیت اصلی</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{tour.location}</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">نقطه تجمع</h4>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>{tour.meetingPoint}</span>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="h-64 bg-blue-50 rounded-lg border flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-12 w-12 mx-auto mb-2" />
                <p>نقشه در اینجا نمایش داده می‌شود</p>
                <p className="text-sm">مختصات: {tour.latitude?.toFixed(6)}, {tour.longitude?.toFixed(6)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Prices Section */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>قیمت‌ها</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tour.prices.map((price, index) => (
              <div key={index} className="border rounded-lg p-4 text-center">
                <div className="font-semibold text-lg mb-2">
                  {price.type === 'adult' && 'بزرگسال'}
                  {price.type === 'child' && 'کودک'}
                  {price.type === 'infant' && 'نوزاد'}
                  {price.type === 'student' && 'دانشجو'}
                  {price.type === 'senior' && 'سالمند'}
                </div>
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {price.price.toLocaleString('fa-IR')} تومان
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}