import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Star, Check, X, Plane, Search, Filter } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { Suspense } from "react"

async function getCipServices(searchParams?: {
  airport?: string
  date?: string
  passengers?: string
}) {
  // During build time, return empty array
  if (process.env.NODE_ENV === 'production' || !process.env.NEXT_PUBLIC_APP_URL) {
    return []
  }

  try {
    // Build query string with search parameters
    const queryParams = new URLSearchParams()
    queryParams.append('published', 'true')
    
    if (searchParams?.airport) {
      queryParams.append('airport', searchParams.airport)
    }
    if (searchParams?.date) {
      queryParams.append('date', searchParams.date)
    }
    if (searchParams?.passengers) {
      queryParams.append('passengers', searchParams.passengers)
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/cip?${queryParams.toString()}`, {
      next: { revalidate: 60 }
    })
    
    if (!res.ok) {
      console.error('Failed to fetch CIP services:', res.status)
      return []
    }
    
    const data = await res.json()
    return data.services || []
  } catch (error) {
    console.error('Error fetching CIP services:', error)
    return []
  }
}

// Search Results Header Component
function SearchResultsHeader({ 
  searchParams, 
  resultsCount 
}: { 
  searchParams: { airport?: string; date?: string; passengers?: string }
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

  if (!searchParams.airport && !searchParams.date && !searchParams.passengers) {
    return null
  }

  return (
    <Card className="mb-8 border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Search className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900">نتایج جستجو</h2>
              <p className="text-blue-700">
                {resultsCount} خدمت CIP یافت شد
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-blue-800">
            {searchParams.airport && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>فرودگاه: {searchParams.airport}</span>
              </div>
            )}
            {searchParams.date && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>تاریخ: {formatDate(searchParams.date)}</span>
              </div>
            )}
            {searchParams.passengers && (
              <div className="flex items-center gap-1">
                <span>مسافر: {searchParams.passengers} نفر</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Clear Search Button
function ClearSearchButton() {
  return (
    <Link href="/cip">
      <Button variant="outline" className="flex items-center gap-2">
        <X className="h-4 w-4" />
        حذف فیلترها
      </Button>
    </Link>
  )
}

// Loading component for Suspense
function CipServicesLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">خدمات CIP فرودگاهی</h1>
          <div className="h-6 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200"></div>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-3"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Content Component
async function CipServicesContent({ 
  searchParams 
}: { 
  searchParams: { airport?: string; date?: string; passengers?: string } 
}) {
  const services = await getCipServices(searchParams)

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return "رایگان"
    return price.toLocaleString("fa-IR") + " " + currency
  }

  if (!services || services.length === 0) {
    const hasSearchParams = searchParams.airport || searchParams.date || searchParams.passengers
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-12">
          {/* Show search header even if no results */}
          {hasSearchParams && (
            <SearchResultsHeader searchParams={searchParams} resultsCount={0} />
          )}
          
          <Card className="border-sky-100 bg-sky-50/50">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sky-100">
                <Plane className="h-8 w-8 text-sky-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-sky-800">
                {hasSearchParams ? "خدمت CIP با این مشخصات یافت نشد" : "هنوز خدمات CIP تعریف نشده"}
              </h3>
              <p className="text-sky-600 mb-6">
                {hasSearchParams 
                  ? "لطفاً فیلترهای جستجو را تغییر دهید یا خدمات دیگر را بررسی کنید"
                  : "برای شروع سفر، اولین رزرو خود را انجام دهید"
                }
              </p>
              <div className="flex gap-3">
                {hasSearchParams && <ClearSearchButton />}
                <Link href="/">
                  <Button className="bg-sky-600 hover:bg-sky-700">بازگشت به صفحه اصلی</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            خدمات CIP فرودگاهی
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            تجربه‌ای لوکس و بدون استرس در فرودگاه‌های ایران با خدمات CIP اختصاصی
          </p>
        </div>

        {/* Search Results Header */}
        {(searchParams.airport || searchParams.date || searchParams.passengers) && (
          <div className="flex items-center justify-between mb-8">
            <SearchResultsHeader searchParams={searchParams} resultsCount={services.length} />
            <ClearSearchButton />
          </div>
        )}

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service: any) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-all duration-300">
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
                    <Badge className="bg-amber-500">
                      <Star className="h-3 w-3 ml-1" />
                      ویژه
                    </Badge>
                  )}
                </div>

                {service.description && (
                  <p className="text-gray-600 mb-4">{service.description.substring(0,50)}...</p>
                )}

                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 ml-1" />
                    <span>فرودگاه {service.airport && service.airport.name}</span>
                  </div>
                  
                  {service.duration && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 ml-1" />
                      <span>مدت: {service.duration}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center text-lg font-bold text-green-600">
                    {formatPrice(service.price, service.currency)}
                  </div>
                </div>

                {/* Features */}
                {service.features.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-900 mb-2">ویژگی‌های اصلی:</h4>
                    <div className="space-y-1">
                      {service.features.slice(0, 2).map((feature: any, index: any) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <Check className="h-4 w-4 ml-1 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Link href={`/cip/${service.id}`}>
                  <Button className="w-full bg-red-400 hover:bg-red-500 text-xl py-6" size="lg">
                    مشاهده جزئیات
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

// Main Page Component
export default async function CipServicesPage({
  searchParams,
}: {
  searchParams: { airport?: string; date?: string; passengers?: string }
}) {
  return (
    <>
      <Header />
      <Suspense fallback={<CipServicesLoading />}>
        <CipServicesContent searchParams={searchParams} />
      </Suspense>
      <Footer />
    </>
  )
}