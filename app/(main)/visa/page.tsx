import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Clock, Star, Check, Calendar, Users, Plane } from "lucide-react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

async function getVisaServices() {
  // During build time, return empty array
  if (process.env.NODE_ENV === 'production' || !process.env.NEXT_PUBLIC_APP_URL) {
    return []
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/visa?published=true`, {
      next: { revalidate: 60 }
    })
    
    if (!res.ok) {
      console.error('Failed to fetch visa services:', res.status)
      return []
    }
    
    const data = await res.json()
    return data.services || []
  } catch (error) {
    console.error('Error fetching visa services:', error)
    return []
  }
}

export default async function VisaServicesPage() {
  const services = await getVisaServices()

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return "رایگان"
    return price.toLocaleString("fa-IR") + " " + currency
  }

  if (!services || services.length === 0) {
    return (
      <>
        <Header />
        <div className="min-h-screen">
          <div className="container mx-auto px-4 py-12">
            <Card className=" bg-sky-50/50">
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full ">
                  <Plane className="h-8 w-8 text-sky-600" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-sky-800">هنوز خدمات ویزا تعریف نشده</h3>
                <p className="text-sky-600 mb-6">خدمات ویزا به زودی اضافه خواهند شد</p>
                <Link href="/">
                  <Button className="bg-sky-600 hover:bg-sky-700">بازگشت به صفحه اصلی</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              خدمات ویزا
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              دریافت ویزای کشورهای مختلف با بهترین شرایط و سریع‌ترین زمان
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service: any) => (
              <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 border-transparent hover:border-blue-200">
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
                    <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                      {service.description}
                    </p>
                  )}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="h-4 w-4 ml-1" />
                      <span>{service.country} - {service.city}</span>
                    </div>
                    
                    {service.processingTime && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 ml-1" />
                        <span>زمان پردازش: {service.processingTime}</span>
                      </div>
                    )}
                    
                    {service.validity && (
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 ml-1" />
                        <span>اعتبار: {service.validity}</span>
                      </div>
                    )}

                    <div className="flex items-center text-sm text-gray-500">
                      <Users className="h-4 w-4 ml-1" />
                      <span>نوع ورود: {service.entryType}</span>
                    </div>
                    
                    <div className="flex items-center text-lg font-bold text-green-600 mt-2">
                      {formatPrice(service.price, service.currency)}
                    </div>
                  </div>

                  {/* Features */}
                  {service.features.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-semibold text-gray-900 mb-2 text-sm">ویژگی‌ها:</h4>
                      <div className="space-y-1">
                        {service.features.slice(0, 2).map((feature: any, index: any) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <Check className="h-4 w-4 ml-1 text-green-500" />
                            <span className="text-xs">{feature}</span>
                          </div>
                        ))}
                        {service.features.length > 2 && (
                          <div className="text-xs text-gray-500 mr-5">
                            +{service.features.length - 2} ویژگی دیگر
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <Link href={`/visa/${service.id}`}>
                    <Button className="w-full bg-blue-900 hover:bg-blue-700 text-white py-3">
                      مشاهده جزئیات و درخواست
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* No Services Message */}
          {services.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">در حال حاضر خدمت ویزای فعالی وجود ندارد.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}