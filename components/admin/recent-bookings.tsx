"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { faIR } from "date-fns/locale"

interface Booking {
  id: string
  type: string
  status: string
  bookingCode: string
  totalPrice: number
  createdAt: string
  user: {
    firstName: string | null
    lastName: string | null
    email: string | null
  }
}

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500",
  CONFIRMED: "bg-green-500",
  CANCELLED: "bg-red-500",
  COMPLETED: "bg-blue-500",
}

const statusLabels: Record<string, string> = {
  PENDING: "در انتظار",
  CONFIRMED: "تایید شده",
  CANCELLED: "لغو شده",
  COMPLETED: "تکمیل شده",
}

export function RecentBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setBookings(data.recentBookings)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error fetching recent bookings:", error)
        setLoading(false)
      })
      // console.log(bookings)
  }, [])

  if (loading) {
    return (
      <Card className="py-6">
        <CardHeader>
          <CardTitle>رزروهای اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">در حال بارگذاری...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle>رزروهای اخیر</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* {bookings.map((booking) => (
            <div key={booking.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{booking.bookingCode}</p>
                  <Badge className={statusColors[booking.status]}>{statusLabels[booking.status]}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {booking.user.firstName && booking.user.lastName
                    ? `${booking.user.firstName} ${booking.user.lastName}`
                    : booking.user.email}
                </p>
              </div>
              <div className="text-left">
                <p className="font-medium">{booking.totalPrice.toLocaleString("fa-IR")} تومان</p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(booking.createdAt), {
                    addSuffix: true,
                    locale: faIR,
                  })}
                </p>
              </div>
            </div>
          ))} */}
        </div>
      </CardContent>
    </Card>
  )
}
