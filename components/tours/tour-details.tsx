// components/tours/tour-details.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, Plane, Train, Bus, Ship, ChevronLeft, ChevronRight } from "lucide-react"
import { useState, useRef } from "react"

interface TourDetailsProps {
  tour: {
    id: string
    title: string
    description: string
    startDate: Date
    endDate: Date
    featured: boolean
    prices: { type: string; price: number; description?: string }[]
    itineraries: { day: number; title: string; description: string; activities?: any }[]
    routes: { order: number; city: string; country: string; duration?: number; description?: string }[]
    rules: { title: string; description: string }[]
    transports: {
      type: string;
      departure: Date;
      arrival: Date;
      fromCity: string;
      toCity: string;
      carrier?: string;
      flightNumber?: string;
      trainNumber?: string
    }[]
    images: {
      id: string
      filename: string
      path: string
      altText?: string
      isPrimary: boolean
      order: number
    }[]
    // _count: { bookings: number }
  }
}

const getTransportIcon = (type: string) => {
  switch (type) {
    case 'FLIGHT': return <Plane className="h-4 w-4" />
    case 'TRAIN': return <Train className="h-4 w-4" />
    case 'BUS': return <Bus className="h-4 w-4" />
    case 'FERRY': return <Ship className="h-4 w-4" />
    default: return <Plane className="h-4 w-4" />
  }
}

const formatDateTime = (date: Date) => {
  return new Date(date).toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function TourDetails({ tour }: TourDetailsProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const itineraryRef = useRef<HTMLDivElement>(null)
  const routesRef = useRef<HTMLDivElement>(null)
  const transportRef = useRef<HTMLDivElement>(null)
  const rulesRef = useRef<HTMLDivElement>(null)

  const getDuration = () => {
    const start = new Date(tour.startDate)
    const end = new Date(tour.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
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

  const primaryImage = tour.images.find(img => img.isPrimary) || tour.images[0]
  const currentImage = tour.images[currentImageIndex] || primaryImage

  return (
    <div className="space-y-6">
      {/* Navigation Buttons */}


      {/* Header */}
      <div className="bg-gradient-to-r bg-blue-900 p-8 text-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {tour.featured && (
                <Badge variant="secondary" className="bg-yellow-500 text-white">
                  ویژه
                </Badge>
              )}
              <Badge variant="outline" className="bg-[#fffefe]/20 text-white border-white/30">
                {getDuration()} روزه
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-4">{tour.title}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            <div>
              <div className="text-sm opacity-90">تاریخ شروع</div>
              <div className="font-semibold">{formatDateTime(tour.startDate)}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <div>
              <div className="text-sm opacity-90">تاریخ پایان</div>
              <div className="font-semibold">{formatDateTime(tour.endDate)}</div>
            </div>
          </div>

          {/* <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <div>
              <div className="text-sm opacity-90">رزرواسیون</div>
              <div className="font-semibold">{tour._count.bookings} نفر</div>
            </div>
          </div> */}
        </div>
      </div>

      {/* Image Gallery */}
      {tour.images.length > 0 && (
        <Card className="">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gray-100 overflow-hidden">
              <img
                src={currentImage.path}
                alt={currentImage.altText || tour.title}
                className="w-full h-full object-cover"
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
                      key={image.id}
                      className={`flex-shrink-0 w-20 h-16 rounded-md overflow-hidden border-2 ${index === currentImageIndex
                          ? 'border-blue-800'
                          : 'border-blue-900'
                        }`}
                      onClick={() => setCurrentImageIndex(index)}
                    >
                      <img
                        src={image.path}
                        alt={image.altText || `تصویر ${index + 1}`}
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
      <Card className="sticky top-4 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(itineraryRef)}
            >
              برنامه سفر
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(routesRef)}
            >
              مسیر تور
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(transportRef)}
            >
              حمل و نقل
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => scrollToSection(rulesRef)}
            >
              قوانین
            </Button>
          </div>
        </CardContent>
      </Card>
      {/* Description */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>توضیحات تور</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground leading-relaxed text-lg">{tour.description}</p>
        </CardContent>
      </Card>

      {/* Itinerary Section */}
      <div ref={itineraryRef}>
        <Card className="py-6">
          <CardHeader>
            <CardTitle>برنامه روزانه تور</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {tour.itineraries.map((day) => (
              <div key={day.day} className="border-r-4 border-blue-800 pr-4">
                <h3 className="font-semibold text-lg mb-2">روز {day.day}: {day.title}</h3>
                <p className="text-muted-foreground">{day.description}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Routes Section */}
      <div ref={routesRef}>
        <Card className="py-6">
          <CardHeader>
            <CardTitle>مسیر تور</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tour.routes.map((route, index) => (
                <div key={route.order} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-blue-800 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    {index < tour.routes.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-300 my-1"></div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{route.city}, {route.country}</h4>
                    {route.duration && (
                      <p className="text-sm text-muted-foreground">
                        اقامت: {route.duration} شب
                      </p>
                    )}
                    {route.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {route.description}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transport Section */}
      <div ref={transportRef}>
        <Card className="py-6">
          <CardHeader>
            <CardTitle>حمل و نقل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tour.transports.map((transport, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {getTransportIcon(transport.type)}
                  <span className="font-semibold">
                    {transport.type === 'FLIGHT' ? 'پرواز' :
                      transport.type === 'TRAIN' ? 'قطار' :
                        transport.type === 'BUS' ? 'اتوبوس' : 'کشتی'}
                  </span>
                  {transport.carrier && (
                    <Badge variant="outline">{transport.carrier}</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">مبدا</div>
                    <div className="font-medium">{transport.fromCity}</div>
                    <div className="text-muted-foreground">
                      {formatDateTime(transport.departure)}
                    </div>
                  </div>

                  <div>
                    <div className="text-muted-foreground">مقصد</div>
                    <div className="font-medium">{transport.toCity}</div>
                    <div className="text-muted-foreground">
                      {formatDateTime(transport.arrival)}
                    </div>
                  </div>
                </div>

                {(transport.flightNumber || transport.trainNumber) && (
                  <div className="mt-3 text-sm">
                    <span className="text-muted-foreground">شماره: </span>
                    <span className="font-medium">
                      {transport.flightNumber || transport.trainNumber}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Rules Section */}
      <div ref={rulesRef}>
        <Card className="py-6">
          <CardHeader>
            <CardTitle>قوانین و مقررات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tour.rules.map((rule, index) => (
              <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
                <h4 className="font-semibold mb-2">{rule.title}</h4>
                <p className="text-muted-foreground">{rule.description}</p>
              </div>
            ))}
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
              <div key={index} className="border-2 border-blue-900  hover:bg-blue-900 hover:text-white hover:scale-110 text-blue-900 transition-all p-4 text-center">
                <div className="font-semibold text-lg mb-2">
                  {price.type === 'ADULT' && 'بزرگسال'}
                  {price.type === 'CHILD' && 'کودک'}
                  {price.type === 'INFANT' && 'نوزاد'}
                  {price.type === 'STUDENT' && 'دانشجو'}
                  {price.type === 'SENIOR' && 'سالمند'}
                </div>
                <div className="text-2xl font-bold mb-2">
                  {price.price.toLocaleString('fa-IR')} تومان
                </div>
                {price.description && (
                  <p className="text-lg">
                    {price.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}