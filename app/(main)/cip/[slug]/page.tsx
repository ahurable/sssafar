"use client"

import { useState, useEffect } from "react"
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
  HelpCircle,
  ChevronDown,
  ChevronUp
} from "lucide-react"
import { BookingSection } from "@/components/cip/booking-section"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import CipSearch from "@/components/cip/cip-search"

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
  description: string
  image: string
  featured: boolean
  price: number
  currency: string
  duration: string
  features: string[]
  included: string[]
  notIncluded: string[]
  airport: {
    name: string
  }
  faqs: FAQ[]
}

export default function CipDetailPage({ params }: { params: { slug: string } }) {
  const [service, setService] = useState<CipService | null>(null)
  const [loading, setLoading] = useState(true)
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null)

  useEffect(() => {
    const fetchService = async () => {
      console.log(params.slug)
      try {
        const response = await fetch(`/api/cip/service/${params.slug}`)
        if (response.ok) {
          const serviceData = await response.json()
          // console.log(serviceData) 
          setService(serviceData.service)
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
      if (price)
        return price.toLocaleString("fa-IR") + " تومان"
    }
    if (price)
      return price.toLocaleString("fa-IR") + " " + currency
    return 
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fffefe]">
        <div className="container mx-auto p-4">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 w-1/3 rounded"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-6 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded"></div>
              </div>
              <div className="space-y-4">
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-[#fffefe] flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">خدمت یافت نشد</h2>
            <p className="text-gray-600 mb-6">خدمت مورد نظر وجود ندارد یا حذف شده است.</p>
            <Button 
              className="w-full"
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
    <>
      <Header/>
        <div className="min-h-screen bg-[#fffefe]">
          <div className="container mx-auto p-4">
            {/* Header */}
            <Card className="mb-6 bg-blue-900 border-none">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.history.back()}
                      className="text-white"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                      <h1 className="text-2xl font-bold text-white mb-1">{service.title}</h1>
                      <div className="flex items-center gap-4 text-white text-sm">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{service.airport && service.airport.name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{service.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 ">
                    {service.featured && (
                      <Badge className="bg-white text-blue-900">
                        ویژه
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="my-6 p-4">
              <CipSearch />
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Hero Image */}
                <Card>
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
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Building className="h-5 w-5 text-gray-600" />
                        درباره خدمت
                      </h2>
                      <p className="text-gray-700 leading-relaxed">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                )}

                {/* Features */}
                {service.features && service.features.length > 0 && (
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-gray-600" />
                        ویژگی‌های اصلی
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <Check className="h-4 w-4 text-green-600 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Services */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-gray-600" />
                      خدمات
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Included */}
                      <div>
                        <h3 className="text-lg font-bold text-green-600 mb-3 flex items-center gap-2">
                          <Check className="h-5 w-5" />
                          شامل شده
                        </h3>
                        <div className="space-y-2">
                          {service.included && service.included.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-gray-700">
                              <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0"></div>
                              <span className="text-sm">{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Not Included */}
                      <div>
                        <h3 className="text-lg font-bold text-red-600 mb-3 flex items-center gap-2">
                          <X className="h-5 w-5" />
                          شامل نشده
                        </h3>
                        <div className="space-y-2">
                          {service.notIncluded && service.notIncluded.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 text-gray-700">
                              <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0"></div>
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
                  <Card>
                    <CardContent className="p-6">
                      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-gray-600" />
                        سوالات متداول
                      </h2>
                      <div className="space-y-3">
                        {service.faqs
                          .filter(faq => faq.isActive)
                          .sort((a, b) => a.order - b.order)
                          .map((faq) => (
                            <Card key={faq.id} className="overflow-hidden">
                              <button
                                className="w-full p-4 text-right flex items-center justify-between text-gray-900 hover:bg-gray-50 transition-colors"
                                onClick={() => toggleFaq(faq.id)}
                              >
                                <span className="font-medium text-sm">{faq.question}</span>
                                {expandedFaq === faq.id ? (
                                  <ChevronUp className="h-4 w-4 text-gray-500" />
                                ) : (
                                  <ChevronDown className="h-4 w-4 text-gray-500" />
                                )}
                              </button>
                              {expandedFaq === faq.id && (
                                <div className="p-4 pt-0 border-t">
                                  <p className="text-gray-600 text-sm leading-relaxed">
                                    {faq.answer}
                                  </p>
                                </div>
                              )}
                            </Card>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </div>
      <Footer/>
    </>
  )
}