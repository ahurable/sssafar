import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Clock, 
  Star, 
  Check, 
  X, 
  ArrowRight,
  Users,
  Shield,
  Coffee,
  Wifi,
  Car,
  Utensils
} from "lucide-react"
import { BookingSection } from "@/components/cip/booking-section"

interface CipDetailPageProps {
  params: {
    id: string
  }
}

async function getCipService(id: string) {
  try {
    const service = await prisma.cipService.findUnique({
      where: { 
        id: id,
        published: true 
      },
      include: {
        airport: true
      }
    })

    return service
  } catch (error) {
    console.error("Error fetching CIP service:", error)
    return null
  }
}

// Generate static params for better SEO
export async function generateStaticParams() {
  try {
    const services = await prisma.cipService.findMany({
      where: { published: true },
      select: { id: true }
    })

    return services.map((service) => ({
      id: service.id,
    }))
  } catch (error) {
    return []
  }
}

export async function generateMetadata({ params }: CipDetailPageProps) {
  const service = await getCipService(params.id)

  if (!service) {
    return {
      title: "خدمت یافت نشد",
    }
  }

  if (!service.airport || service.airport && !service.airport.name) 
    return {
      title: `${service.title} - خدمات CIP فرودگاه `,
      description: service.description || `خدمت ${service.title} در فرودگاه`,
    }

  return {
    title: `${service.title} - خدمات CIP فرودگاه ${service.airport.name}`,
    description: service.description || `خدمت ${service.title} در فرودگاه ${service.airport.name}`,
  }
}

export default async function CipDetailPage({ params }: CipDetailPageProps) {
  const service = await getCipService(params.id)

  if (!service) {
    notFound()
  }

  const getFeatureIcon = (feature: string) => {
    const lowerFeature = feature.toLowerCase()
    
    if (lowerFeature.includes('پذیرایی') || lowerFeature.includes('غذا') || lowerFeature.includes('نوشیدنی')) {
      return <Coffee className="h-5 w-5 text-blue-600" />
    } else if (lowerFeature.includes('اینترنت') || lowerFeature.includes('wifi')) {
      return <Wifi className="h-5 w-5 text-green-600" />
    } else if (lowerFeature.includes('ترانسفر') || lowerFeature.includes('حمل و نقل')) {
      return <Car className="h-5 w-5 text-purple-600" />
    } else if (lowerFeature.includes('امنیت') || lowerFeature.includes('حفاظت')) {
      return <Shield className="h-5 w-5 text-red-600" />
    } else if (lowerFeature.includes('پرسنل') || lowerFeature.includes('مهماندار')) {
      return <Users className="h-5 w-5 text-orange-600" />
    } else {
      return <Check className="h-5 w-5 text-green-600" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <a href="/" className="hover:text-blue-600 transition-colors">خانه</a>
          <span>›</span>
          <a href="/cip" className="hover:text-blue-600 transition-colors">خدمات CIP</a>
          <span>›</span>
          <span className="text-gray-900 font-medium">{service.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Header Section */}
            <Card className="mb-6 overflow-hidden bg-white">
              {service.image && (
                <div className="h-80 overflow-hidden">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">{service.title}</h1>
                      {service.featured && (
                        <Badge className="bg-amber-500 text-white">
                          <Star className="h-4 w-4 ml-1" />
                          ویژه
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-gray-600 mb-4">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-5 w-5" />
                        <span className="font-semibold"> {service.airport && service.airport.name}</span>
                      </div>
                      {service.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-5 w-5" />
                          <span>{service.duration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {service.description && (
                  <p className="text-gray-700 text-lg leading-relaxed mb-6">
                    {service.description}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Features Section */}
            {service.features.length > 0 && (
              <Card className="mb-6 bg-white">
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">ویژگی‌های اصلی</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {service.features.map((feature, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        {getFeatureIcon(feature)}
                        <span className="text-gray-700 font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Services Comparison */}
            <Card className="bg-white">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">جزئیات خدمات</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Included Services */}
                  <div>
                    <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                      <Check className="h-5 w-5" />
                      خدمات شامل شده
                    </h3>
                    <div className="space-y-3">
                      {service.included.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Not Included Services */}
                  <div>
                    <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                      <X className="h-5 w-5" />
                      خدمات شامل نشده
                    </h3>
                    <div className="space-y-3">
                      {service.notIncluded.map((item, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <span className="text-gray-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            { service.airport &&
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
            }

            {/* Contact Info */}
            <Card className="mt-6 bg-white">
              <CardContent className="p-6">
                <h4 className="font-semibold text-gray-900 mb-4">اطلاعات تماس</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📞</span>
                    <span>شماره تماس: ۰۲۱-۱۲۳۴۵۶۷۸</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>🕒</span>
                    <span>ساعات کاری: ۲۴ ساعته</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>📍</span>
                    <span>آدرس: سالن پروازهای داخلی/بین‌المللی</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* FAQ Section */}
        <Card className="mt-12 bg-white">
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">سوالات متداول</h2>
            <div className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  چگونه می‌توانم خدمت CIP را رزرو کنم؟
                </h3>
                <p className="text-gray-600">
                  می‌توانید از طریق دکمه "رزرو خدمت" در این صفحه، خدمت مورد نظر را رزرو کنید. 
                  همچنین می‌توانید با شماره تماس ما ارتباط برقرار کنید.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  آیا امکان کنسلی وجود دارد؟
                </h3>
                <p className="text-gray-600">
                  بله، تا ۲۴ ساعت قبل از زمان رزرو امکان کنسلی با کسر ۱۰٪ از مبلغ وجود دارد.
                </p>
              </div>
              
              <div className="border-b border-gray-200 pb-4">
                <h3 className="font-semibold text-gray-900 mb-2">
                  چه مدارکی برای استفاده از خدمت نیاز است؟
                </h3>
                <p className="text-gray-600">
                  بلیط پرواز، کارت شناسایی معتبر و رسید پرداخت خدمت CIP.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}