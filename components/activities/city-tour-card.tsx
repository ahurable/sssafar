// components/activities/city-tour-card.tsx
"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Clock, Users, Star } from "lucide-react"
import Image from "next/image"

interface CityTourCardProps {
  tour: {
    id: string
    title: string
    slug: string
    shortDescription: string
    city: string
    location: string
    duration: number
    maxCapacity: number
    featured: boolean
    images: string[]
    prices: { type: string; price: number }[]
    inclusions: { item: string }[]
  }
}

export function CityTourCard({ tour }: CityTourCardProps) {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours} ساعت و ${mins} دقیقه` : `${mins} دقیقه`
  }

  const getMinPrice = () => {
    if (!tour.prices.length) return 0
    return Math.min(...tour.prices.map(p => p.price))
  }

  const getImageUrl = () => {
    return tour.images.length > 0 ? tour.images[0] : '/placeholder-tour.jpg'
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] group">
      <CardContent className="p-0">
        {/* Image */}
        <div className="h-48 relative overflow-hidden rounded-t-lg">
          <Image
            src={getImageUrl()}
            alt={tour.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
          />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {tour.featured && (
              <Badge className="bg-yellow-500 text-white">
                <Star className="h-3 w-3 ml-1" />
                ویژه
              </Badge>
            )}
            <Badge variant="secondary" className="bg-[#fffefe]/90 backdrop-blur-sm">
              {tour.city}
            </Badge>
          </div>
        </div>

        <div className="p-6">
          {/* Title and Description */}
          <div className="mb-4">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">
              {tour.title}
            </h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
              {tour.shortDescription}
            </p>
          </div>

          {/* Tour Details */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="line-clamp-1">{tour.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{formatDuration(tour.duration)}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>ظرفیت: {tour.maxCapacity} نفر</span>
            </div>
          </div>

          {/* Inclusions Preview */}
          {tour.inclusions.length > 0 && (
            <div className="mb-4">
              <div className="text-xs text-muted-foreground mb-2">شامل:</div>
              <div className="flex flex-wrap gap-1">
                {tour.inclusions.slice(0, 3).map((inclusion, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {inclusion.item}
                  </Badge>
                ))}
                {tour.inclusions.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{tour.inclusions.length - 3} بیشتر
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Price and CTA */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">شروع از</span>
              <span className="text-xl font-bold text-green-600">
                {getMinPrice().toLocaleString('fa-IR')} تومان
              </span>
            </div>

            <Link href={`/activities/${tour.id}`}>
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