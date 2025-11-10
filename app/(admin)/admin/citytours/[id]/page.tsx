// app/admin/city-tours/[id]/page.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EditCityTourForm } from "@/components/admin/edit-city-tour-form"
import { CityTourBookings } from "@/components/admin/city-tour-bookings"
import { ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface CityTour {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
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
    id: string
    type: string
    price: number
    currency: string
  }[]
  inclusions: {
    id: string
    item: string
  }[]
  exclusions: {
    id: string
    item: string
  }[]
  itineraries: {
    id: string
    order: number
    title: string
    description: string
    duration: number
  }[]
  bookings: Reservation[]
}

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

export default function EditCityTourPage({
  params
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const [tour, setTour] = useState<CityTour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("edit")

  useEffect(() => {
    const fetchTour = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/admin/city-tours/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            router.push("/admin/city-tours")
            return
          }
          throw new Error('Failed to fetch tour')
        }
        
        const data = await response.json()
        setTour(data.tour)
      } catch (err) {
        console.error('Error fetching tour:', err)
        setError('خطا در بارگذاری اطلاعات گشت')
      } finally {
        setLoading(false)
      }
    }

    fetchTour()
  }, [params.id, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground mt-4">در حال بارگذاری اطلاعات گشت...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-red-600 text-4xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold mb-2">خطا در بارگذاری</h2>
            <p className="text-muted-foreground mb-6">{error}</p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => window.location.reload()}>
                تلاش مجدد
              </Button>
              <Link href="/admin/city-tours">
                <Button variant="outline">
                  بازگشت به لیست گشت‌ها
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-background" dir="rtl">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold mb-2">گشت یافت نشد</h2>
            <p className="text-muted-foreground mb-6">گشت مورد نظر وجود ندارد یا حذف شده است</p>
            <Link href="/admin/city-tours">
              <Button>
                بازگشت به لیست گشت‌ها
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/city-tours"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4 ml-2" />
              بازگشت به لیست گشت‌ها
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">ویرایش گشت شهری</h1>
          <p className="text-muted-foreground mt-2">
            ویرایش اطلاعات گشت شهری: {tour.title}
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center gap-2">
              ✏️ ویرایش اطلاعات
            </TabsTrigger>
            <TabsTrigger value="bookings" className="flex items-center gap-2">
              📋 رزروها ({tour.bookings?.length || 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit">
            <EditCityTourForm tour={tour} />
          </TabsContent>

          <TabsContent value="bookings">
            <CityTourBookings 
              tourId={tour.id} 
              tourTitle={tour.title}
              bookings={tour.bookings || []} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}