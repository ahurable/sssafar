"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { EditCipForm } from "@/components/admin/edit-cip-form"
import { CipReservations } from "@/components/admin/cip-reservations"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { toast } from "sonner"

interface CipService {
  id: string
  title: string
  slug: string
  description: string | null
  image: string | null
  airportId: string | null
  airport: {
    id: string
    name: string
    code: string
    city: string
  } | null
  price: number | null
  currency: string
  duration: string | null
  features: string[]
  included: string[]
  notIncluded: string[]
  priority: number
  published: boolean
  featured: boolean
  entry: boolean
  deferent: boolean
  reservations: any[]
  faqs: Array<{
    id: string
    question: string
    answer: string
    order: number
    isActive: boolean
    type: string
  }>
}

interface EditCipServicePageProps {
  params: {
    id: string
  }
}

export default function EditCipServicePage({ params }: EditCipServicePageProps) {
  const router = useRouter()
  const [service, setService] = useState<CipService | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchService = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/cip/${params.id}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("خدمت یافت نشد")
          }
          throw new Error("خطا در دریافت اطلاعات خدمت")
        }
        
        const data = await response.json()
        setService(data.service)
      } catch (err: any) {
        console.error("Error fetching CIP service:", err)
        setError(err.message || "خطا در دریافت اطلاعات خدمت")
        toast.error(err.message || "خطا در دریافت اطلاعات خدمت")
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params.id])

  const handleBack = () => {
    router.push("/admin/cip")
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Skeleton className="h-4 w-32 mb-4" />
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Edit Form Skeleton */}
            <div className="xl:col-span-2 space-y-6">
              {[...Array(5)].map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-48 mb-4" />
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Reservations Sidebar Skeleton */}
            <div className="xl:col-span-1">
              <Card>
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <div className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              بازگشت به مدیریت خدمات
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                خطا در بارگذاری
              </h2>
              <p className="text-muted-foreground mb-6">
                {error}
              </p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => window.location.reload()}>
                  تلاش مجدد
                </Button>
                <Button variant="outline" onClick={handleBack}>
                  بازگشت
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Service not found
  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              بازگشت به مدیریت خدمات
            </Button>
          </div>

          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
              <h2 className="text-xl font-bold text-foreground mb-2">
                خدمت یافت نشد
              </h2>
              <p className="text-muted-foreground mb-6">
                خدمت مورد نظر وجود ندارد یا حذف شده است.
              </p>
              <Button onClick={handleBack}>
                بازگشت به مدیریت خدمات
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="p-0 hover:bg-transparent"
            >
              <ArrowLeft className="h-4 w-4 ml-2" />
              بازگشت به مدیریت خدمات
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground">ویرایش خدمت CIP</h1>
          <p className="text-muted-foreground mt-2">
            اطلاعات خدمت <strong>{service.title}</strong> را ویرایش کنید و درخواست‌های رزرو را مدیریت کنید
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Edit Form - Takes 2/3 on large screens */}
          <div className="xl:col-span-2">
            <EditCipForm service={service} />
          </div>

          {/* Reservations Sidebar - Takes 1/3 on large screens */}
          <div className="xl:col-span-1">
            <CipReservations 
              serviceId={service.id} 
              reservations={service.reservations} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}