"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Hotel, Plane, Train, Calendar, MapPin, Download } from "lucide-react"

const mockBookings = [
  {
    id: "B001",
    type: "hotel",
    title: "هتل پارسیان آزادی",
    location: "تهران",
    date: "1403/08/20 - 1403/08/23",
    status: "confirmed",
    price: 7500000,
  },
  {
    id: "B002",
    type: "flight",
    title: "پرواز تهران - مشهد",
    location: "ایران ایر - IR701",
    date: "1403/08/25",
    status: "confirmed",
    price: 1200000,
  },
  {
    id: "B003",
    type: "train",
    title: "قطار تهران - اصفهان",
    location: "قطار شماره ۵۰۳",
    date: "1403/09/05",
    status: "pending",
    price: 450000,
  },
]

const getTypeIcon = (type: string) => {
  switch (type) {
    case "hotel":
      return Hotel
    case "flight":
      return Plane
    case "train":
      return Train
    default:
      return Hotel
  }
}

const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmed":
      return "تایید شده"
    case "pending":
      return "در انتظار"
    case "cancelled":
      return "لغو شده"
    default:
      return status
  }
}

const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
  switch (status) {
    case "confirmed":
      return "default"
    case "pending":
      return "secondary"
    case "cancelled":
      return "destructive"
    default:
      return "secondary"
  }
}

export function BookingsList() {
  if (mockBookings.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <Plane className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-2 text-xl font-bold">هنوز رزروی ندارید</h3>
          <p className="text-muted-foreground mb-6">برای شروع سفر، اولین رزرو خود را انجام دهید</p>
          <Button>شروع رزرو</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {mockBookings.map((booking) => {
        const Icon = getTypeIcon(booking.type)
        return (
          <Card key={booking.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold">{booking.title}</h3>
                      <Badge variant={getStatusVariant(booking.status)}>{getStatusLabel(booking.status)}</Badge>
                    </div>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>{booking.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{booking.date}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-3 md:border-r md:pr-6">
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">مبلغ پرداختی</p>
                    <p className="text-xl font-bold text-primary">
                      {booking.price.toLocaleString("fa-IR")} <span className="text-sm font-normal">تومان</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    <Download className="ml-2 h-4 w-4" />
                    دانلود بلیط
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
