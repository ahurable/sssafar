// components/admin/city-tours-management.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin, Clock, Users } from "lucide-react"
import Link from "next/link"

interface CityTour {
  id: string
  title: string
  slug: string
  description: string
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
  isActive: boolean
  images: string[]
  prices: {
    type: string
    price: number
    currency: string
  }[]
  inclusions: { item: string }[]
  itineraries: { title: string }[]
  _count: {
    bookings: number
  }
  createdAt: string
  updatedAt: string
}

export function CityToursManagement() {
  const [tours, setTours] = useState<CityTour[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  const fetchTours = () => {
    setLoading(true)
    fetch("/api/admin/city-tours")
      .then((res) => res.json())
      .then((data) => {
        setTours(data.tours || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching city tours:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchTours()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این گشت شهری اطمینان دارید؟ این عمل غیرقابل بازگشت است.")) return

    setDeleteLoading(id)
    try {
      const res = await fetch(`/api/admin/citytours/${id}`, { 
        method: "DELETE" 
      })
      
      if (res.ok) {
        fetchTours()
      } else {
        const error = await res.json()
        alert(error.error || "خطا در حذف گشت شهری")
      }
    } catch (error) {
      console.error("Error deleting city tour:", error)
      alert("خطا در حذف گشت شهری")
    } finally {
      setDeleteLoading(null)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours} ساعت و ${mins} دقیقه` : `${mins} دقیقه`
  }

  const getPriceRange = (prices: { price: number }[]) => {
    if (!prices || !prices.length) return "تعیین نشده"
    const minPrice = Math.min(...prices.map(p => p.price))
    const maxPrice = Math.max(...prices.map(p => p.price))
    return minPrice === maxPrice 
      ? `${minPrice.toLocaleString('fa-IR')} تومان`
      : `${minPrice.toLocaleString('fa-IR')} - ${maxPrice.toLocaleString('fa-IR')} تومان`
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">در حال بارگذاری گشت‌ها...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-muted-foreground">
            {tours.length} گشت شهری
          </p>
        </div>
        <Link href="/admin/citytours/create">
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            ایجاد گشت جدید
          </Button>
        </Link>
      </div>

      {tours.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">هنوز گشت شهری ایجاد نکرده‌اید</h3>
            <p className="text-muted-foreground mb-4">
              اولین گشت شهری خود را ایجاد کنید و آن را به کاربران نمایش دهید
            </p>
            <Link href="/admin/citytours/create">
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                ایجاد گشت جدید
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tours.map((tour) => (
            <Card key={tour.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold line-clamp-1">
                      {tour.title}
                    </h3>
                    {tour.featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        ویژه
                      </Badge>
                    )}
                  </div>
                  <Badge variant={tour.isActive ? "default" : "secondary"}>
                    {tour.isActive ? "فعال" : "غیرفعال"}
                  </Badge>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{tour.city} - {tour.location}</span>
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

                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-green-600 font-medium">
                    {getPriceRange(tour.prices)}
                  </span>
                  <span className="text-muted-foreground">
                    {tour._count?.bookings || 0} رزرواسیون
                  </span>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Link href={`/admin/citytours/${tour.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 ml-1" />
                      ویرایش
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(tour.id)}
                    disabled={deleteLoading === tour.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    {deleteLoading === tour.id ? "..." : "حذف"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}