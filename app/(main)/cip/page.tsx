"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Star, Check, X, Plane, Search } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useCip } from "@/contexts/search/CipContext"
import { useRouter } from "next/navigation"

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
  slug: string
}

// Modal Component
function ServiceModal({ 
  service, 
  isOpen, 
  onClose,
  onCreateInvoice 
}: { 
  service: CipService
  isOpen: boolean
  onClose: () => void
  onCreateInvoice: (service: CipService) => Promise<void>
}) {
  const [loading, setLoading] = useState(false)

  const handleCreateInvoice = async () => {
    setLoading(true)
    try {
      await onCreateInvoice(service)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />
      
      {/* Modal Container - Full screen on mobile, centered on desktop */}
      <div className="relative w-full h-full md:flex md:items-center md:justify-center md:p-4 z-50">
        {/* Modal Content - Full screen on mobile, contained on desktop */}
        <div className="bg-[#fffefe] w-full h-full md:w-full md:max-w-2xl md:h-auto md:max-h-[90vh] flex flex-col overflow-hidden">
          {/* Header - Sticky */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b bg-[#fffefe] sticky top-0 z-10">
            <h2 className="text-lg md:text-xl font-bold text-gray-900 truncate flex-1 mr-3">
              {service.title}
            </h2>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="flex-shrink-0"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
            {/* Image */}
            {service.image && (
              <div className="h-48 md:h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Description */}
            {service.description && (
              <div>
                <h3 className="font-bold text-gray-900 mb-2 text-sm md:text-base">توضیحات خدمت</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{service.description}</p>
              </div>
            )}

            {/* Features */}
            {service.features.length > 0 && (
              <div>
                <h3 className="font-bold text-gray-900 mb-3 text-sm md:text-base">ویژگی‌های اصلی</h3>
                <div className="grid grid-cols-1 gap-2">
                  {service.features.map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <Check className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="flex-1">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Services Comparison */}
            <div className="grid grid-cols-1 gap-6">
              {/* Included Services */}
              <div>
                <h3 className="font-bold text-green-600 mb-3 flex items-center gap-2 text-sm md:text-base">
                  <Check className="h-5 w-5" />
                  خدمات شامل شده
                </h3>
                <div className="space-y-2">
                  {service.included.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-green-600 rounded-full flex-shrink-0 mt-1.5"></div>
                      <span className="flex-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Not Included Services */}
              <div>
                <h3 className="font-bold text-red-600 mb-3 flex items-center gap-2 text-sm md:text-base">
                  <X className="h-5 w-5" />
                  خدمات شامل نشده
                </h3>
                <div className="space-y-2">
                  {service.notIncluded.map((item, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="w-2 h-2 bg-red-600 rounded-full flex-shrink-0 mt-1.5"></div>
                      <span className="flex-1">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Price */}
            <div className="bg-gray-50 p-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm md:text-base">قیمت نهایی:</span>
                <div className="text-xl md:text-2xl font-bold text-blue-600">
                  {service.price.toLocaleString("fa-IR")} تومان
                </div>
              </div>
            </div>
          </div>

          {/* Footer - Sticky */}
          <div className="flex gap-3 p-4 md:p-6 border-t bg-[#fffefe] sticky bottom-0 z-10">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 py-3 text-sm md:text-base"
            >
              بازگشت
            </Button>
            <Button 
              onClick={handleCreateInvoice} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 text-sm md:text-base"
              disabled={loading}
            >
              {loading ? "در حال ایجاد..." : "رفتن به صورت حساب"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Search Results Header Component
function SearchResultsHeader({ 
  searchData, 
  resultsCount 
}: { 
  searchData: { airport?: string; date?: string; passengers?: number }
  resultsCount: number 
}) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fa-IR')
    } catch {
      return dateString
    }
  }

  if (!searchData.airport && !searchData.date && !searchData.passengers) {
    return null
  }

  return (
    <Card className=" w-full mb-6 border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        {/* Mobile Layout */}
        <div className="md:hidden space-y-4">
          {/* Header Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                <Search className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-blue-900 text-sm">نتایج جستجو</h2>
                <p className="text-blue-700 text-xs">
                  {resultsCount} خدمت CIP یافت شد
                </p>
              </div>
            </div>
            
            <Link href="/cip">
              <Button variant="outline" size="sm" className="flex items-center gap-1 h-8 px-3">
                <X className="h-3 w-3" />
                <span className="text-xs">حذف</span>
              </Button>
            </Link>
          </div>

          {/* Search Filters - Stacked on mobile */}
          <div className="space-y-2">
            {searchData.airport && (
              <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-100 px-3 py-2 rounded-lg">
                <MapPin className="h-3 w-3" />
                <span>فرودگاه: {searchData.airport}</span>
              </div>
            )}
            {searchData.date && (
              <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-100 px-3 py-2 rounded-lg">
                <Clock className="h-3 w-3" />
                <span>تاریخ: {formatDate(searchData.date)}</span>
              </div>
            )}
            {searchData.passengers && (
              <div className="flex items-center gap-2 text-xs text-blue-800 bg-blue-100 px-3 py-2 rounded-lg">
                <span>مسافر: {searchData.passengers} نفر</span>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
              <Search className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h2 className="font-bold text-blue-900">نتایج جستجو</h2>
              <p className="text-blue-700 text-sm">
                {resultsCount} خدمت CIP یافت شد
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-blue-800">
              {searchData.airport && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>فرودگاه: {searchData.airport}</span>
                </div>
              )}
              {searchData.date && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>تاریخ: {formatDate(searchData.date)}</span>
                </div>
              )}
              {searchData.passengers && (
                <div className="flex items-center gap-1">
                  <span>مسافر: {searchData.passengers} نفر</span>
                </div>
              )}
            </div>
            
            <Link href="/cip">
              <Button variant="outline" className="flex items-center gap-2">
                <X className="h-4 w-4" />
                حذف فیلترها
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Loading component
function CipServicesLoading() {
  return (
    <div className="min-h-screen bg-[#fffefe]">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">خدمات CIP فرودگاهی</h1>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-32 h-24 bg-gray-200 rounded"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-48"></div>
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Service Card Component for Grid View
function ServiceGridCard({ service, onViewService }: { 
  service: CipService
  onViewService: (service: CipService) => void 
}) {
  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return "رایگان"
    return price.toLocaleString("fa-IR") + " تومان"
  }
  const router = useRouter()
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
      {service.image && (
        <div className="h-48 overflow-hidden">
          <img
            src={service.image}
            alt={service.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900">{service.title}</h3>
          {service.featured && (
            <Badge className="bg-amber-500 text-white">
              <Star className="h-3 w-3 ml-1" />
              ویژه
            </Badge>
          )}
        </div>

        {service.description && (
          <p className="text-gray-600 mb-4 text-sm">{service.description.substring(0, 100)}...</p>
        )}

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-500">
            <MapPin className="h-4 w-4 ml-1" />
            <span>فرودگاه {service.airport?.name}</span>
          </div>
          
          {service.duration && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 ml-1" />
              <span>مدت: {service.duration}</span>
            </div>
          )}
          
          <div className="text-lg font-bold text-blue-600">
            {formatPrice(service.price, service.currency)}
          </div>
        </div>

        <Button 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => router.push(`/cip/${service.slug}`)}
        >
          اطلاعات بیشتر | جستجو
        </Button>
      </CardContent>
    </Card>
  )
}

// Service Row Component for Search Results
// Service Row Component for Search Results
function ServiceRow({ service, onViewService }: { 
  service: CipService
  onViewService: (service: CipService) => void 
}) {
  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return "رایگان"
    return price.toLocaleString("fa-IR") + " تومان"
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border border-gray-200">
      <CardContent className="p-4">
        {/* Mobile Layout - Simple Row Structure */}
        <div className="md:hidden">
          {/* First Row: Image + Title + Featured Badge */}
          <div className="flex gap-3 mb-3">
            {/* Image */}
            {service.image && (
              <div className="w-20 h-20 overflow-hidden rounded-lg flex-shrink-0">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            {/* Title and Featured Badge */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <h3 className="text-base font-bold text-gray-900 line-clamp-2">{service.title}</h3>
                {service.featured && (
                  <Badge className="bg-amber-500 text-white whitespace-nowrap flex-shrink-0 mr-2">
                    <Star className="h-3 w-3 ml-1" />
                    ویژه
                  </Badge>
                )}
              </div>
              
              {/* Location and Duration */}
              <div className="flex items-center gap-3 mt-2 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{service.airport?.name}</span>
                </div>
                {service.duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{service.duration}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Second Row: Price + Button */}
          <div className="flex items-center justify-between gap-3">
            <div className="text-left">
              <div className="text-lg font-bold text-blue-600">
                {formatPrice(service.price, service.currency)}
              </div>
              <div className="text-xs text-gray-500">برای هر نفر</div>
            </div>
            
            <Button 
              className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
              onClick={() => onViewService(service)}
            >
              مشاهده و خرید
            </Button>
          </div>

          {/* Third Row: Quick Features (if space allows) */}
          {service.features.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap gap-1">
                {service.features.slice(0, 2).map((feature: string, index: number) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                    <Check className="h-3 w-3 ml-1" />
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex gap-6">
          {/* Service Image */}
          {service.image && (
            <div className="w-48 h-32 overflow-hidden rounded-lg flex-shrink-0">
              <img
                src={service.image}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          {/* Service Details */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{service.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>فرودگاه {service.airport?.name}</span>
                  </div>
                  {service.duration && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{service.duration}</span>
                    </div>
                  )}
                </div>
              </div>
              {service.featured && (
                <Badge className="bg-amber-500 text-white">
                  <Star className="h-3 w-3 ml-1" />
                  ویژه
                </Badge>
              )}
            </div>

            {service.description && (
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                {service.description.substring(0, 150)}...
              </p>
            )}

            {/* Quick Features */}
            {service.features.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {service.features.slice(0, 3).map((feature: string, index: number) => (
                    <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      <Check className="h-3 w-3 ml-1" />
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex flex-col items-end gap-4 min-w-[200px]">
            <div className="text-left">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatPrice(service.price, service.currency)}
              </div>
              <div className="text-sm text-gray-500">برای هر نفر</div>
            </div>
            
            <Button 
              className="min-w-[140px] bg-blue-600 hover:bg-blue-700"
              onClick={() => onViewService(service)}
            >
              مشاهده و خرید
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Main Content Component
function CipServicesContent() {
  const { searchData } = useCip()
  const [services, setServices] = useState<CipService[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSearchParams, setHasSearchParams] = useState(false)
  const [selectedService, setSelectedService] = useState<CipService | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchCipServices = async () => {
      try {
        setLoading(true)
        
        const queryParams = new URLSearchParams()
        queryParams.append('published', 'true')
        
        if (searchData?.airportId) {
          queryParams.append('airport', searchData.airportId)
        }
        if (searchData?.date) {
          queryParams.append('date', searchData.date)
        }
        if (searchData?.passengers) {
          queryParams.append('passengers', searchData.passengers.toString())
        }

        const res = await fetch(`/api/cip?${queryParams.toString()}`)
        
        if (!res.ok) {
          console.error('Failed to fetch CIP services:', res.status)
          setServices([])
          return
        }
        
        const data = await res.json()
        setServices(data.services || [])
      } catch (error) {
        console.error('Error fetching CIP services:', error)
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    const hasParams = !!(searchData?.airport || searchData?.date || searchData?.passengers)
    setHasSearchParams(hasParams)

    fetchCipServices()
  }, [searchData])

  const handleViewService = (service: CipService) => {
    setSelectedService(service)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedService(null)
  }

  const handleCreateInvoice = async (service: CipService) => {
    try {
      // Create invoice data
      const invoiceData = {
        kind: "CIP",
        amount: service.price,
        travelers: [
          {
            // You might want to get this from user input or context
            firstName: "کاربر",
            lastName: "سیستم",
            phoneNumber: "09123456789",
            email: "user@example.com"
          }
        ],
        order: {
          serviceId: service.id,
          title: service.title,
          airport: service.airport?.name,
          duration: service.duration,
          features: service.features,
          included: service.included,
          notIncluded: service.notIncluded,
          price: service.price,
          currency: service.currency
        }
      }

      const response = await fetch('/api/invoice/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'خطا در ایجاد صورت حساب')
      }

      const result = await response.json()
      
      // Redirect to invoice page
      router.push(`/invoice/${result.invoiceId}`)
      
    } catch (error) {
      console.error('Error creating invoice:', error)
      alert(error instanceof Error ? error.message : 'خطا در ایجاد صورت حساب')
    }
  }

  if (loading) {
    return <CipServicesLoading />
  }

  if (!services || services.length === 0) {
    return (
      <div className="min-h-screen bg-[#fffefe]">
        <div className="container mx-auto px-4 py-8">
          {hasSearchParams && searchData && (
            <SearchResultsHeader searchData={searchData} resultsCount={0} />
          )}
          
          <Card className="border-blue-100 bg-blue-50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                <Plane className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-blue-800">
                {hasSearchParams ? "خدمت CIP با این مشخصات یافت نشد" : "هنوز خدمات CIP تعریف نشده"}
              </h3>
              <p className="text-blue-600 mb-6">
                {hasSearchParams 
                  ? "لطفاً فیلترهای جستجو را تغییر دهید یا خدمات دیگر را بررسی کنید"
                  : "برای شروع سفر، اولین رزرو خود را انجام دهید"
                }
              </p>
              <div className="flex gap-3">
                {/* {hasSearchParams && <ClearSearchButton />} */}
                <Link href="/">
                  <Button className="bg-blue-600 hover:bg-blue-700">بازگشت به صفحه اصلی</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fffefe]">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            خدمات CIP فرودگاهی
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            تجربه‌ای لوکس و بدون استرس در فرودگاه‌های ایران با خدمات CIP اختصاصی
          </p>
        </div>

        {/* Search Results Header */}
        {hasSearchParams && searchData && (
          <div className="flex items-center justify-between mb-6">
            <SearchResultsHeader searchData={searchData} resultsCount={services.length} />
            {/* <ClearSearchButton /> */}
          </div>
        )}

        {/* Services Display */}
        {hasSearchParams ? (
          // Row layout for search results
          <div className="space-y-4">
            {services.map((service) => (
              <ServiceRow 
                key={service.id} 
                service={service} 
                onViewService={handleViewService}
              />
            ))}
          </div>
        ) : (
          // Grid layout for normal view
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceGridCard 
                key={service.id} 
                service={service} 
                onViewService={handleViewService}
              />
            ))}
          </div>
        )}

        {/* Service Modal */}
        {selectedService && (
          <ServiceModal
            service={selectedService}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onCreateInvoice={handleCreateInvoice}
          />
        )}
      </div>
    </div>
  )
}

// Main Page Component
export default function CipServicesPage() {
  return (
    <>
      <Header />
      <CipServicesContent />
      <Footer />
    </>
  )
}