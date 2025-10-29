"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Filter, Phone, User, Calendar, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface Reservation {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  status: string
  createdAt: string
  notes?: string
}

interface CipReservationsProps {
  serviceId: string
  reservations: Reservation[]
}

export function CipReservations({ serviceId, reservations }: CipReservationsProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.phoneNumber.includes(searchTerm)
    
    const matchesStatus = statusFilter === "ALL" || reservation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: "در انتظار", color: "bg-yellow-500" },
      CONFIRMED: { label: "تأیید شده", color: "bg-green-500" },
      CANCELLED: { label: "لغو شده", color: "bg-red-500" },
      COMPLETED: { label: "تکمیل شده", color: "bg-blue-500" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, color: "bg-gray-500" }
    
    return (
      <Badge className={`${config.color} text-white text-xs`}>
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const handleStatusChange = async (reservationId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/cip/reservations/${reservationId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        // Refresh the page to show updated data
        window.location.reload()
      } else {
        console.error("Failed to update reservation status")
      }
    } catch (error) {
      console.error("Error updating reservation:", error)
    }
  }

  const exportReservations = () => {
    // Simple CSV export
    const headers = ["نام", "نام خانوادگی", "شماره تماس", "وضعیت", "تاریخ ثبت"]
    const csvData = filteredReservations.map(res => [
      res.firstName,
      res.lastName,
      res.phoneNumber,
      res.status,
      formatDate(res.createdAt)
    ])
    
    const csvContent = [headers, ...csvData]
      .map(row => row.join(","))
      .join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `reservations-${serviceId}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <Card className="py-6">
        <CardContent>
          <h3 className="font-semibold text-lg mb-4">آمار رزروها</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{reservations.length}</div>
              <div className="text-sm text-gray-600">کل درخواست‌ها</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {reservations.filter(r => r.status === "CONFIRMED").length}
              </div>
              <div className="text-sm text-gray-600">تأیید شده</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reservations List */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>درخواست‌های رزرو</span>
            <Button variant="outline" size="sm" onClick={exportReservations}>
              خروجی CSV
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <div className="space-y-4 mb-6">
            <div className="space-y-2">
              <Label>جستجو</Label>
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="جستجو بر اساس نام یا شماره تماس..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>فیلتر وضعیت</Label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="ALL">همه وضعیت‌ها</option>
                <option value="PENDING">در انتظار</option>
                <option value="CONFIRMED">تأیید شده</option>
                <option value="CANCELLED">لغو شده</option>
                <option value="COMPLETED">تکمیل شده</option>
              </select>
            </div>
          </div>

          {/* Reservations List */}
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredReservations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                هیچ درخواست رزروری یافت نشد
              </div>
            ) : (
              filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">
                        {reservation.firstName} {reservation.lastName}
                      </span>
                    </div>
                    {getStatusBadge(reservation.status)}
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Phone className="h-3 w-3" />
                    <span>{reservation.phoneNumber}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <Calendar className="h-3 w-3" />
                    <span>{formatDate(reservation.createdAt)}</span>
                  </div>

                  {reservation.notes && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded mb-3">
                      {reservation.notes}
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`tel:${reservation.phoneNumber}`)}
                      >
                        تماس
                      </Button>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(reservation.id, "CONFIRMED")}
                        >
                          تأیید شده
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(reservation.id, "CANCELLED")}
                        >
                          لغو شده
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleStatusChange(reservation.id, "COMPLETED")}
                        >
                          تکمیل شده
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}