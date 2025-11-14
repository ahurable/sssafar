"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Clock, 
  Star, 
  Check, 
  X, 
  ChevronLeft,
  Heart,
  Building,
  CheckCircle,
  CreditCard,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Users,
  Shield,
  Coffee,
  Wifi,
  Car
} from "lucide-react"
import { BookingSection } from "@/components/cip/booking-section"

interface FAQ {
  id: string
  question: string
  answer: string
  order: number
  isActive: boolean
}

interface CipService {
  id: string
  title: string
  slug: string
  description: string
  image: string
  featured: boolean
  price: number
  currency: string
  duration: string
  features: string[]
  included: string[]
  notIncluded: string[]
  priority: number
  published: boolean
  entry: boolean
  deferent: boolean
  airport: {
    name: string
    code: string
    city: string
  }
  faqs: FAQ[]
}

export default function CipDetailPage() {
  const [service, setService] = useState<CipService | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)
  const params = useParams()

  useEffect(() => {
    const fetchService = async () => {
      try {
        const response = await fetch(`/api/cip/services/${params.slug}`)
        if (response.ok) {
          const serviceData = await response.json()
          console.log(serviceData)
          setService(serviceData)
        } else {
          console.error("Service not found")
        }
      } catch (error) {
        console.error("Error fetching service:", error)
      } finally {
        setLoading(false)
      }
    }

    if (params.slug) {
      fetchService()
    }
  }, [params.slug])

  const toggleFavorite = (serviceId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(serviceId)) {
        newFavorites.delete(serviceId)
      } else {
        newFavorites.add(serviceId)
      }
      return newFavorites
    })
  }

  const toggleFaq = (faqId: string) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId)
  }

  const formatPrice = (price: number, currency: string = "IRR") => {
    if (currency === "IRR" || currency === "تومان") {
      return price.toLocaleString("fa-IR") + " تومان"
    }
    return price.toLocaleString("fa-IR") + " " + currency
  }

  const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase()
    
    if (lowerFeature.includes('پذیرایی') || lowerFeature.includes('غذا') || lowerFeature.includes('نوشیدنی')) {
      return <Coffee className="h-4 w-4 text-blue-600" />
    } else if (lowerFeature.includes('اینترنت') || lowerFeature.includes('wifi')) {
      return <Wifi className="h-4 w-4 text-green-600" />
    } else if (lowerFeature.includes('ترانسفر') || lowerFeature.includes('حمل و نقل')) {
      return <Car className="h-4 w-4 text-purple-600" />
    } else if (lowerFeature.includes('امنیت') || lowerFeature.includes('حفاظت')) {
      return <Shield className="h-4 w-4 text-red-600" />
    } else if (lowerFeature.includes('پرسنل') || lowerFeature.includes('مهماندار')) {
      return <Users className="h-4 w-4 text-orange-600" />
    } else {
      return <Check className="h-4 w-4 text-green-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto p-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">خدمت یافت نشد</h2>
            <p className="text-gray-600 mb-6">خدمت مورد نظر وجود ندارد یا حذف شده است.</p>
            <Button 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => window.history.back()}
            >
              بازگشت
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            onClick={() => window.history.back()}
          >
            <ChevronLeft className="h-4 w-4 ml-1" />
            بازگشت
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{service.title}</h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{service.airport.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{service.duration}</span>
              </div>
              {service.featured && (
                <Badge className="bg-amber-500 text-white">
                  ویژه
                </Badge>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-red-500"
            onClick={() => toggleFavorite(service.id)}
          >
            <Heart 
              className={`h-5 w-5 ${
                favorites.has(service.id) ? "fill-red-500 text-red-500" : ""
              }`} 
            />
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image */}
            <Card className="border-2 border-blue-100 overflow-hidden">
              <CardContent className="p-0">
                <div className="relative h-80">
                  <img
                    src={service.image || '/cip-default.jpg'}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            {service.description && (
              <Card className="border-2 border-blue-100">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-600" />
                    درباره خدمت
                  </h2>
                  <p className="text-gray-700 leading-relaxed">
                    {service.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Features */}
            {service.features.length > 0 && (
              <Card className="border-2 border-blue-100">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-blue-600" />
                    ویژگی‌های اصلی
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                        {getFeatureIcon(feature)}
                        <span className="text-gray-700 text-sm font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services Comparison */}
            <Card className="border-2 border-blue-100">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  خدمات
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Included Services */}
                  <div>
                    <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      خدمات شامل شده
                    </h3>
                    <div className="space-y-2">
                      {service.included.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Not Included Services */}
                  <div>
                    <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                      <X className="h-5 w-5" />
                      خدمات شامل نشده
                    </h3>
                    <div className="space-y-2">
                      {service.notIncluded.map((item, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-700">
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0"></div>
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            {service.faqs && service.faqs.length > 0 && (
              <Card className="border-2 border-blue-100">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-blue-600" />
                    سوالات متداول
                  </h2>
                  <div className="space-y-3">
                    {service.faqs
                      .filter(faq => faq.isActive)
                      .sort((a, b) => a.order - b.order)
                      .map((faq) => (
                        <div 
                          key={faq.id} 
                          className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-200 transition-colors"
                        >
                          <button
                            className="w-full p-4 text-right flex items-center justify-between text-gray-900 hover:bg-gray-50 transition-colors"
                            onClick={() => toggleFaq(faq.id)}
                          >
                            <span className="font-medium text-sm">{faq.question}</span>
                            {expandedFaq === faq.id ? (
                              <ChevronUp className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-gray-500 flex-shrink-0" />
                            )}
                          </button>
                          {expandedFaq === faq.id && (
                            <div className="p-4 pt-0">
                              <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                                {faq.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Booking Card */}
            <Card className="border-2 border-blue-100 sticky top-4">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {formatPrice(service.price, service.currency)}
                  </div>
                  <div className="text-gray-600 text-sm">برای هر نفر</div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">خدمت:</span>
                      <span className="font-medium text-gray-900">{service.title}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-gray-600">فرودگاه:</span>
                      <span className="font-medium text-gray-900">{service.airport.name}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-gray-600">مدت زمان:</span>
                      <span className="font-medium text-gray-900">{service.duration}</span>
                    </div>
                  </div>

                  <BookingSection 
                    service={{
                      id: service.id,
                      title: service.title,
                      airport: service.airport.name,
                      price: service.price,
                      currency: service.currency,
                      duration: service.duration
                    }}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card className="border-2 border-blue-100">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">اطلاعات سریع</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">وضعیت:</span>
                    <Badge className="bg-green-100 text-green-800">فعال</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">امتیاز:</span>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">۵.۰</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">رزروهای امروز:</span>
                    <span className="font-medium">۱۲ مورد</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border-2 border-blue-100">
              <CardContent className="p-6">
                <h3 className="font-bold text-gray-900 mb-4">پشتیبانی</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-xs">📞</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">۰۲۱-۱۲۳۴۵۶۷۸</div>
                      <div className="text-gray-600 text-xs">پشتیبانی ۲۴ ساعته</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-blue-600 text-xs">📍</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">سالن VIP</div>
                      <div className="text-gray-600 text-xs">فرودگاه {service.airport.name}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}