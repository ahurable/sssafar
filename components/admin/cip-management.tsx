"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, MapPin, Clock, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"

interface CipService {
  id: string
  title: string
  description: string | null
  image: string | null
  airport: string
  price: number | null
  currency: string
  duration: string | null
  features: string[]
  included: string[]
  notIncluded: string[]
  priority: number
  published: boolean
  featured: boolean
  createdAt: string
}

export function CipManagement() {
  const [services, setServices] = useState<CipService[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchServices = () => {
    setLoading(true)
    fetch("/api/cip")
      .then((res) => res.json())
      .then((data) => {
        setServices(data.services || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching CIP services:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این خدمت CIP اطمینان دارید؟")) return

    try {
      const res = await fetch(`/api/cip/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchServices()
      }
    } catch (error) {
      console.error("Error deleting CIP service:", error)
    }
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return "رایگان"
    return price.toLocaleString("fa-IR") + " " + currency
  }

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری خدمات CIP...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{services.length} خدمت CIP</p>
        <Button onClick={() => router.push('/admin/cip/new')}>
          <Plus className="h-4 w-4 ml-2" />
          خدمت جدید
        </Button>
      </div>

      <div className="grid gap-6">
        {services.map((service) => (
          <Card key={service.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex flex-col md:flex-row">
                {service.image && (
                  <div className="md:w-48 h-48 md:h-auto">
                    <img
                      src={service.image}
                      alt={service.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold">{service.title}</h3>
                        {service.published && (
                          <Badge className="bg-green-500">فعال</Badge>
                        )}
                        {service.featured && (
                          <Badge className="bg-purple-500">ویژه</Badge>
                        )}
                      </div>
                      
                      {service.description && (
                        <p className="text-muted-foreground mb-3">
                          {service.description}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>فرودگاه: {service.airport}</span>
                        </div>
                        {service.duration && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>مدت: {service.duration}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          <span>قیمت: {formatPrice(service.price, service.currency)}</span>
                        </div>
                      </div>

                      {service.features.length > 0 && (
                        <div className="mb-3">
                          <h4 className="text-sm font-semibold mb-1">ویژگی‌ها:</h4>
                          <div className="flex flex-wrap gap-1">
                            {service.features.slice(0, 3).map((feature, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {feature}
                              </Badge>
                            ))}
                            {service.features.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{service.features.length - 3} بیشتر
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/admin/cip/${service.id}`)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(service.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>اولویت: {service.priority}</span>
                    <span>
                      ایجاد شده در: {new Date(service.createdAt).toLocaleDateString("fa-IR")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

    
    </div>
  )
}