// components/admin/city-tour-bookings.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Phone, Mail, Calendar } from "lucide-react"

interface Reservation {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  status: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface CityTourBookingsProps {
  tourId: string
  tourTitle: string
  bookings: Reservation[]
}

const STATUS_CONFIG = {
  PENDING: { label: "در انتظار", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "تأیید شده", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "لغو شده", color: "bg-red-100 text-red-800" }
} as const

export function CityTourBookings({ tourId, tourTitle, bookings }: CityTourBookingsProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)

  const filteredBookings = statusFilter === "ALL" 
    ? bookings 
    : bookings.filter(booking => booking.status === statusFilter)

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdatingStatus(bookingId)
    try {
      const response = await fetch(`/api/admin/reservations/${bookingId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the page to get updated data
        window.location.reload()
      } else {
        const error = await response.json()
        alert(error.error || "خطا در بروزرسانی وضعیت")
      }
    } catch (error) {
      console.error("Error updating booking status:", error)
      alert("خطا در بروزرسانی وضعیت")
    } finally {
      setUpdatingStatus(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || 
                  { label: status, color: "bg-gray-100 text-gray-800" }
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">هیچ رزروی ثبت نشده است</h3>
          <p className="text-muted-foreground">
            هنوز هیچ درخواست رزروی برای این گشت شهری ثبت نشده است.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{bookings.length}</div>
            <div className="text-sm text-muted-foreground">کل رزروها</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {bookings.filter(b => b.status === "PENDING").length}
            </div>
            <div className="text-sm text-muted-foreground">در انتظار</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === "CONFIRMED").length}
            </div>
            <div className="text-sm text-muted-foreground">تأیید شده</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {bookings.filter(b => b.status === "CANCELLED").length}
            </div>
            <div className="text-sm text-muted-foreground">لغو شده</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>لیست رزروها</CardTitle>
              <CardDescription>
                مدیریت درخواست‌های رزرو برای گشت: {tourTitle}
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="فیلتر بر اساس وضعیت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">همه وضعیت‌ها</SelectItem>
                <SelectItem value="PENDING">در انتظار</SelectItem>
                <SelectItem value="CONFIRMED">تأیید شده</SelectItem>
                <SelectItem value="CANCELLED">لغو شده</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نام و نام خانوادگی</TableHead>
                  <TableHead>شماره تماس</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تاریخ ثبت</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium">
                      {booking.firstName} {booking.lastName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        {booking.phoneNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={booking.status}
                        onValueChange={(value) => handleStatusChange(booking.id, value)}
                        disabled={updatingStatus === booking.id}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PENDING">در انتظار</SelectItem>
                          <SelectItem value="CONFIRMED">تأیید شده</SelectItem>
                          <SelectItem value="CANCELLED">لغو شده</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(booking.createdAt)}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Show booking details
                            alert(`جزئیات رزرو:\n\nنام: ${booking.firstName} ${booking.lastName}\nتلفن: ${booking.phoneNumber}\nوضعیت: ${STATUS_CONFIG[booking.status as keyof typeof STATUS_CONFIG]?.label}\nتاریخ: ${formatDate(booking.createdAt)}\n${booking.notes ? `یادداشت: ${booking.notes}` : ''}`)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`tel:${booking.phoneNumber}`)}
                        >
                          <Phone className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredBookings.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              هیچ رزروی با وضعیت انتخاب شده یافت نشد.
            </div>
          )}

          <div className="mt-4 text-sm text-muted-foreground">
            نمایش {filteredBookings.length} رزرو از {bookings.length} رزرو
          </div>
        </CardContent>
      </Card>
    </div>
  )
}