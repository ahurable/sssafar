"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Wifi, Coffee, Car, Dumbbell } from "lucide-react"
import { hotels } from "@/lib/data/hotels"

const amenityIcons: Record<string, any> = {
  "وای‌فای رایگان": Wifi,
  رستوران: Coffee,
  پارکینگ: Car,
  "سالن ورزشی": Dumbbell,
}

export function HotelList() {
  const [hotelList] = useState(hotels)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{hotelList.length} هتل یافت شد</p>
      </div>

      {hotelList.map((hotel) => (
        <Card key={hotel.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="relative h-48 md:h-full">
                <Image src={hotel.image || "/placeholder.svg"} alt={hotel.name} fill className="object-cover" />
              </div>
              <div className="p-4 md:col-span-2">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{hotel.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{hotel.city}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-bold">{hotel.rating}</span>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{hotel.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.amenities.slice(0, 4).map((amenity, index) => {
                    const Icon = amenityIcons[amenity]
                    return (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {Icon && <Icon className="h-3 w-3" />}
                        {amenity}
                      </Badge>
                    )
                  })}
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">قیمت هر شب از</p>
                    <p className="text-2xl font-bold text-primary">
                      {hotel.price.toLocaleString("fa-IR")} <span className="text-sm font-normal">تومان</span>
                    </p>
                  </div>
                  <Button>رزرو هتل</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
