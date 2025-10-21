// components/tours/tour-card.tsx
"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Star } from "lucide-react"
import Image from "next/image"

interface TourCardProps {
  tour: {
    id: string
    title: string
    description: string
    startDate: Date
    endDate: Date
    featured: boolean
    prices: { type: string; price: number }[]
    routes: { city: string; country: string }[]
    transports: { type: string; fromCity: string; toCity: string }[]
    images: { path: string }[]
    // _count: { bookings: number }
  }
}

export function TourCard({ tour }: TourCardProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('fa-IR')
  }

  const getDuration = () => {
    const start = new Date(tour.startDate)
    const end = new Date(tour.endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMinPrice = () => {
    if (!tour.prices.length) return 0
    return Math.min(...tour.prices.map(p => p.price))
  }

  const getMainRoute = () => {
    if (tour.routes.length > 0) {
      return `${tour.routes[0].city}, ${tour.routes[0].country}`
    }
    if (tour.transports.length > 0) {
      return `${tour.transports[0].fromCity} - ${tour.transports[0].toCity}`
    }
    return "تعیین نشده"
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-0">
        {/* Image Placeholder */}
        <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg relative">
          <div className="w-full h-full absolute top-0">
            <Image 
            src={tour.images[0].path}
            alt=""
            width={400}
            height={300}
            className="rounded-t-xl object-cover"
            />
          </div>
          {tour.featured && (
            <Badge className="absolute top-3 left-3 bg-yellow-500 text-white">
              <Star className="h-3 w-3 ml-1" />
              ویژه
            </Badge>
          )}
          <div className="absolute bottom-3 right-3">
            <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm">
              {getDuration()} روز
            </Badge>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">
              {tour.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {tour.description}
            </p>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{formatDate(tour.startDate)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1">{getMainRoute()}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              {/* <span>{tour._count.bookings} نفر رزرو کرده‌اند</span> */}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">شروع از</span>
              <span className="text-xl font-bold text-green-600">
                {getMinPrice().toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <Link href={`/tours/${tour.id}`}>
              <Button>
                مشاهده جزئیات
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}