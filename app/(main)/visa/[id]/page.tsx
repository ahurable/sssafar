import { notFound } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { 
  MapPin, 
  Clock, 
  Calendar, 
  Users, 
  Check, 
  X, 
  Star,
  FileText,
  Shield,
  Clock4,
  DollarSign
} from "lucide-react"
import type { Metadata } from 'next'
import { VisaBookingSection } from "@/components/visa/visa-booking-section"


export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const service = await getVisaService(params.id)
  
  if (!service) {
    return {
      title: 'خدمت ویزا یافت نشد'
    }
  }

  return {
    title: `${service.title} | خدمات ویزا`,
    description: service.description || `دریافت ویزای ${service.country} - ${service.city} با بهترین شرایط`,
  }
}

async function getVisaService(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const res = await fetch(`${baseUrl}/api/visa/${id}`, {
      next: { revalidate: 60 }
    })
    
    if (!res.ok) {
      return null
    }
    
    return await res.json()
  } catch (error) {
    console.error('Error fetching visa service:', error)
    return null
  }
}

interface Params {
  params: {
    id: string
  }
}

export default async function VisaDetailPage({ params }: Params) {
  const service = await getVisaService(params.id)

  if (!service) {
    notFound()
  }

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return "رایگان"
    return price.toLocaleString("fa-IR") + " " + currency
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <a href="/" className="hover:text-blue-600">خانه</a>
            <span>/</span>
            <a href="/visa" className="hover:text-blue-600">خدمات ویزا</a>
            <span>/</span>
            <span className="text-gray-700">{service.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden bg-white">
                {service.image && (
                  <div className="h-64 md:h-80 overflow-hidden">
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
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {service.title}
                      </h1>
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center text-blue-600">
                          <MapPin className="h-5 w-5 ml-1" />
                          <span className="font-semibold">{service.country} - {service.city}</span>
                        </div>
                        {service.featured && (
                          <Badge className="bg-amber-500">
                            <Star className="h-3 w-3 ml-1" />
                            ویژه
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-2xl font-bold text-green-600">
                      {formatPrice(service.price, service.currency)}
                    </div>
                  </div>

                  {service.description && (
                    <p className="text-gray-700 text-lg leading-relaxed mb-6">
                      {service.description}
                    </p>
                  )}

                  {/* Key Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {service.processingTime && (
                      <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                        <Clock4 className="h-6 w-6 text-blue-600 ml-2" />
                        <div>
                          <div className="font-semibold text-gray-900">زمان پردازش</div>
                          <div className="text-gray-600">{service.processingTime}</div>
                        </div>
                      </div>
                    )}
                    
                    {service.validity && (
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <Calendar className="h-6 w-6 text-green-600 ml-2" />
                        <div>
                          <div className="font-semibold text-gray-900">مدت اعتبار</div>
                          <div className="text-gray-600">{service.validity}</div>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <Users className="h-6 w-6 text-purple-600 ml-2" />
                      <div>
                        <div className="font-semibold text-gray-900">نوع ورود</div>
                        <div className="text-gray-600">{service.entryType}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                      <Shield className="h-6 w-6 text-orange-600 ml-2" />
                      <div>
                        <div className="font-semibold text-gray-900">وضعیت</div>
                        <div className="text-gray-600">فعال و قابل درخواست</div>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  {service.features.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <Check className="h-6 w-6 text-green-500 ml-2" />
                        ویژگی‌های ویزا
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {service.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center p-3 bg-white border border-green-200 rounded-lg">
                            <Check className="h-5 w-5 text-green-500 ml-2 flex-shrink-0" />
                            <span className="text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Requirements */}
                  {service.requirements.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-6 w-6 text-blue-500 ml-2" />
                        شرایط و ضوابط
                      </h2>
                      <div className="space-y-3">
                        {service.requirements.map((requirement: string, index: number) => (
                          <div key={index} className="flex items-start p-3 bg-white border border-blue-200 rounded-lg">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ml-2 flex-shrink-0" />
                            <span className="text-gray-700 leading-relaxed">{requirement}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Required Documents */}
                  {service.documents.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                        <FileText className="h-6 w-6 text-orange-500 ml-2" />
                        مدارک مورد نیاز
                      </h2>
                      <div className="space-y-3">
                        {service.documents.map((document: string, index: number) => (
                          <div key={index} className="flex items-center p-3 bg-white border border-orange-200 rounded-lg">
                            <div className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                              {index + 1}
                            </div>
                            <span className="text-gray-700">{document}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {service.priceTables && service.priceTables.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                        <DollarSign className="h-6 w-6 text-green-500 ml-2" />
                        جدول‌های قیمت
                        </h2>
                        
                        <div className="space-y-8">
                        {service.priceTables.map((table: any, tableIndex: number) => (
                            <Card key={tableIndex} className="border-2 border-blue-100">
                            <CardContent className="p-6">
                                <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">
                                {table.title}
                                </h3>
                                
                                <div className="overflow-x-auto">
                                <table className="w-full border-collapse border border-gray-300">
                                    <thead>
                                    <tr className="bg-blue-50">
                                        <th className="border border-gray-300 p-3 text-right font-semibold">
                                        نوع ویزا
                                        </th>
                                        {table.columns.map((column: string, colIndex: number) => (
                                        <th 
                                            key={colIndex} 
                                            className="border border-gray-300 p-3 text-center font-semibold"
                                        >
                                            {column}
                                        </th>
                                        ))}
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {table.rows.map((row: any, rowIndex: number) => (
                                        <tr 
                                        key={rowIndex} 
                                        className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                                        >
                                        <td className="border border-gray-300 p-3 font-semibold text-right">
                                            {row.label}
                                        </td>
                                        {row.values.map((value: string, valueIndex: number) => (
                                            <td 
                                            key={valueIndex} 
                                            className="border border-gray-300 p-3 text-center"
                                            >
                                            {value || '-'}
                                            </td>
                                        ))}
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                                </div>
                            </CardContent>
                            </Card>
                        ))}
                        </div>
                    </div>
                    )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar - Booking Card */}
            <div className="lg:col-span-1">
              
              <VisaBookingSection service={service} />

              {/* Contact Info */}
              <Card className="mt-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-4">اطلاعات تماس</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">تلفن:</span>
                      <span className="font-semibold">۰۲۱-۱۲۳۴۵۶۷۸</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">واتس‌اپ:</span>
                      <span className="font-semibold">۰۹۱۲۳۴۵۶۷۸۹</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ایمیل:</span>
                      <span className="font-semibold">visa@company.com</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}