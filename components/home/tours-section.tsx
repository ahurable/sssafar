'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronLeft, MapPin, Calendar, Users } from "lucide-react"

interface Tour {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  isActive: boolean
  featured: boolean
  images: { id: string; path: string; alt?: string }[]
  prices: { id: string; price: number; currency: string }[]
}

interface ToursSectionProps {
  tours: Tour[]
}

export default function ToursSection() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isMounted, setIsMounted] = useState(false)
  const [tours, setTours] = useState<Tour[]>()

  useEffect(() => {
    // setIsMounted(true)
    const fetchTours = async () => {
      const res = await fetch('/api/tours/search')
      const data = await res.json()

      console.log(data)

      setTours(data)
    }
    fetchTours()
  }, [])

  // Calculate average price
  const getAveragePrice = (prices: Tour['prices']) => {
    if (!prices || !prices.length) return 0
    const sum = prices.reduce((acc, price) => acc + price.price, 0)
    return Math.round(sum / prices.length)
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      month: 'long',
      day: 'numeric'
    })
  }

  // Get duration in days
  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Carousel navigation
  const nextSlide = () => {
    if (!tours) return
    setCurrentSlide((prev) => (prev + 2) % Math.ceil(tours.length / 2))
  }

  const prevSlide = () => {
    if (!tours) return 
    setCurrentSlide((prev) => (prev - 2 + Math.ceil(tours.length / 2)) % Math.ceil(tours.length / 2))
  }

  // Get visible tours for carousel
  const getVisibleTours = () => {
    const startIndex = currentSlide * 2
    return tours && tours.slice(startIndex, startIndex + 2)
  }

  if (!tours) {
    return (
      <section className="py-16 bg-[#fffefe] border-t border-blue-950/20" dir="rtl">
        <div className="container mx-auto px-4 lg:px-0">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-blue-950">تور ها</h2>
            <p className="text-lg text-blue-950/70 max-w-2xl">
              کشف دنیا با بهترین تجربه‌های سفر
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 animate-pulse rounded-none"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-[#fffefe] border-t border-blue-950/20" dir="rtl">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-blue-950 mb-4">تور ها</h2>
            <p className="text-lg text-blue-950/70 max-w-2xl leading-relaxed">
              کشف دنیا با بهترین تجربه‌های سفر | از ماجراجویی‌های کوهستانی تا گشت‌های شهری
            </p>
          </div>
          
          <Button className="bg-blue-950 text-white hover:bg-blue-900 px-8 py-2 rounded-sm md:block hidden">
            مشاهده همه تور ها
          </Button>
        </div>

        {/* Desktop Grid - Hidden on mobile */}
        <div className="hidden md:grid grid-cols-2 lg:grid-cols-5 gap-6">
          {tours && tours.slice(0, 5).map((tour, index) => (
            <Card 
              key={tour.id}
              className="relative overflow-hidden border-2 border-blue-950/20 bg-white hover:border-blue-950 transition-all duration-500 hover:scale-105 cursor-pointer group rounded-none"
            >
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{
                  backgroundImage: tour.images && tour.images.length > 0 
                    ? `url(${process.env.NEXT_PUBLIC_APP_URL + tour.images[0].path})`
                    : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                }}
              >
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/50 to-transparent" />
              </div>

              <CardContent className="relative p-4 h-64 flex flex-col justify-end text-white">
                {/* Tour Title */}
                <h3 className="text-lg font-bold mb-2 leading-tight group-hover:text-blue-200 transition-colors duration-300">
                  {tour.title}
                </h3>

                {/* Tour Info */}
                <div className="flex items-center justify-between text-sm opacity-90 mb-3">
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(tour.startDate)}</span>
                  </div>
                  <div className="flex items-center space-x-2 space-x-reverse">
                    <Users className="h-3 w-3" />
                    <span>{getDuration(tour.startDate, tour.endDate)} روز</span>
                  </div>
                </div>

                {/* Price */}
                <div className="flex items-center justify-between">
                  <div className="bg-blue-900 px-3 py-1 rounded-sm">
                    <span className="text-sm font-medium">
                      {getAveragePrice(tour.prices).toLocaleString()} تومان
                    </span>
                  </div>
                  <Button 
                    size="sm" 
                    className="bg-white text-blue-950 hover:bg-gray-100 text-xs px-3 py-1 h-auto rounded-sm"
                  >
                    مشاهده
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Mobile Carousel - Hidden on desktop */}
        <div className="md:hidden relative">
          <div className="flex space-x-4 space-x-reverse overflow-hidden">
            {getVisibleTours().map((tour, index) => (
              
              <div key={tour.id} className="flex-1 min-w-0">
                <Card className="relative overflow-hidden border-2 border-blue-950/20 bg-white rounded-none">
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: tour.images && tour.images.length > 0 
                        ? `url(${process.env.NEXT_PUBLIC_APP_URL + tour.images[0].path})`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-950/90 via-blue-950/50 to-transparent" />
                  </div>

                  <CardContent className="relative p-4 h-56 flex flex-col justify-end text-white">
                    <h3 className="text-base font-bold mb-2 leading-tight">
                      {tour.title}
                    </h3>

                    <div className="flex items-center justify-between text-xs opacity-90 mb-3">
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(tour.startDate)}</span>
                      </div>
                      <div className="flex items-center space-x-1 space-x-reverse">
                        <Users className="h-3 w-3" />
                        <span>{getDuration(tour.startDate, tour.endDate)} روز</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="bg-blue-900 px-2 py-1 rounded-sm">
                        <span className="text-xs font-medium">
                          {getAveragePrice(tour.prices).toLocaleString()} تومان
                        </span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-white text-blue-950 hover:bg-gray-100 text-xs px-2 py-1 h-auto rounded-sm"
                      >
                        مشاهده
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {/* Carousel Controls */}
          {tours.length > 2 && (
            <div className="flex justify-center space-x-4 space-x-reverse mt-6">
              <Button
                onClick={prevSlide}
                className="bg-blue-950 text-white hover:bg-blue-900 w-10 h-10 p-0 rounded-sm"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                onClick={nextSlide}
                className="bg-blue-950 text-white hover:bg-blue-900 w-10 h-10 p-0 rounded-sm"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Carousel Indicators */}
          {tours.length > 2 && (
            <div className="flex justify-center space-x-2 space-x-reverse mt-4">
              {[...Array(Math.ceil(tours.length / 2))].map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-blue-950 w-4' : 'bg-blue-950/30'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-8 block md:hidden">
          <Button className="bg-blue-950 text-white hover:bg-blue-900 px-8 py-2 rounded-sm">
            مشاهده همه تور ها
          </Button>
        </div>
      </div>
    </section>
  )
}