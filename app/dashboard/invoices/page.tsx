"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { User, Plane, Hotel, Train, FileText, Calendar, CreditCard, CreditCardIcon } from "lucide-react"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"

interface Traveler {
  id: string;
  firstName: string;
  lastName: string;
  nationalId: string;
  dateOfBirth: string;
  passportNumber?: string;
  passportExpiry?: string;
  phoneNumber?: string;
  email?: string;
  gender?: string;
  passengerType?: string;
  age: number;
}

interface Invoice {
  id: string;
  kind: "FLIGHT" | "HOTEL" | "TRAIN";
  amount: string;
  state: "WAITING" | "PAID" | "CANCELLED";
  flightType?: string;
  flightSourceCode?: string;
  travelers: Traveler[];
  selectedServices?: any[];
  expireAt: string;
  createdAt: string;
  order?: any;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await fetch('/api/invoice/list');
        const data = await res.json();

        if (res.ok) {
          setInvoices(data.invoices || []);
        }
      } catch (error) {
        console.error("Error fetching invoices:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const getStatusBadge = (state: string) => {
    const statusConfig = {
      WAITING: { 
        label: "در انتظار پرداخت", 
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <CreditCard className="h-3 w-3 ml-1" />
      },
      PAID: { 
        label: "پرداخت شده", 
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <FileText className="h-3 w-3 ml-1" />
      },
      CANCELLED: { 
        label: "لغو شده", 
        color: "bg-red-100 text-red-800 border-red-200",
        icon: <Calendar className="h-3 w-3 ml-1" />
      }
    };
    
    const config = statusConfig[state as keyof typeof statusConfig] || statusConfig.WAITING;
    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getKindIcon = (kind: string) => {
    const iconConfig = {
      FLIGHT: { icon: <Plane className="h-5 w-5" />, label: "پرواز", color: "text-blue-600" },
      HOTEL: { icon: <Hotel className="h-5 w-5" />, label: "هتل", color: "text-green-600" },
      TRAIN: { icon: <Train className="h-5 w-5" />, label: "قطار", color: "text-purple-600" },
      CHARGE: { icon: <CreditCardIcon className="h-5 w-5" />, label: "شارژ اعتبار", color: "text-pink-700"}
    };
    
    return iconConfig[kind as keyof typeof iconConfig] || iconConfig.FLIGHT;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-12">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">صورت حساب ها</h1>
              <p className="text-muted-foreground">مدیریت صورت حساب های رزرو</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-4">
              <aside className="lg:col-span-1">
                <DashboardNav />
              </aside>
              <div className="lg:col-span-3">
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <p>در حال بارگذاری صورت حساب ها...</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (    
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">صورت حساب ها</h1>
            <p className="text-muted-foreground">
              {invoices.length > 0 
                ? `مدیریت ${invoices.length} صورت حساب رزرو`
                : "مدیریت صورت حساب های رزرو"
              }
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <DashboardNav />
            </aside>
            
            <div className="lg:col-span-3">
              {invoices.length === 0 ? (
                <Card>
                  <CardContent className="py-12">
                    <div className="text-center text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg mb-2">هیچ صورت حسابی یافت نشد</p>
                      <p className="text-sm">صورت حساب های رزرو شما در اینجا نمایش داده می شود</p>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  {invoices.map((invoice) => {
                    const kindConfig = getKindIcon(invoice.kind);
                    
                    return (
                      <Card key={invoice.id} className="border shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="pb-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gray-50 ${kindConfig.color}`}>
                                {kindConfig.icon}
                              </div>
                              <div>
                                <CardTitle className="text-xl flex items-center gap-2">
                                  {kindConfig.label}
                                  {invoice.flightType && (
                                    <span className="text-sm font-normal text-muted-foreground">
                                      ({invoice.flightType === "one-way" ? "یک طرفه" : "رفت و برگشت"})
                                    </span>
                                  )}
                                </CardTitle>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-sm text-muted-foreground">
                                    ایجاد شده در {formatDate(invoice.createdAt)}
                                  </span>
                                  {invoice.expireAt && new Date(invoice.expireAt) > new Date() && (
                                    <span className="text-sm text-amber-600">
                                      • انقضا: {formatDate(invoice.expireAt)}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="text-right">
                              {getStatusBadge(invoice.state)}
                              <p className="text-2xl font-bold text-green-600 mt-2">
                                {parseInt(invoice.amount).toLocaleString('fa-IR')} 
                                <span className="text-sm font-normal text-muted-foreground mr-1">تومان</span>
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-6 pt-4">
                          {/* Flight Specific Information */}
                          {invoice.kind === "FLIGHT" && invoice.order && (
                            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                              <Label className="text-blue-700 font-medium mb-3 block">اطلاعات پرواز</Label>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-muted-foreground">شرکت هواپیمایی:</span>
                                  <p className="font-medium">{invoice.order.ValidatingAirlineCode}</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">کد رزرو:</span>
                                  <p className="font-mono font-medium">{invoice.order.FareSourceCode?.substring(0, 12)}...</p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">سیاست استرداد:</span>
                                  <p className="font-medium">
                                    {invoice.order.NonRefundableType === 0 ? "قابل استرداد" : "غیرقابل استرداد"}
                                  </p>
                                </div>
                                <div>
                                  <span className="text-muted-foreground">وضعیت رزرو:</span>
                                  <p className="font-medium">
                                    {invoice.order.IsClosed ? "بسته شده" : "فعال"}
                                  </p>
                                </div>
                              </div>
                              
                              {invoice.order.AirItineraryPricingInfo?.ItinTotalFare && (
                                <div className="mt-4 pt-4 border-t border-blue-200">
                                  <div className="flex gap-6 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">قیمت کل:</span>
                                      <p className="font-bold text-blue-800">
                                        {invoice.order.AirItineraryPricingInfo.ItinTotalFare.TotalFare?.toLocaleString('fa-IR')} {invoice.order.AirItineraryPricingInfo.ItinTotalFare.Currency}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">قیمت پایه:</span>
                                      <p className="font-medium">
                                        {invoice.order.AirItineraryPricingInfo.ItinTotalFare.BaseFare?.toLocaleString('fa-IR')}
                                      </p>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">مالیات:</span>
                                      <p className="font-medium">
                                        {invoice.order.AirItineraryPricingInfo.ItinTotalFare.TotalTax?.toLocaleString('fa-IR')}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Selected Services */}
                          {invoice.selectedServices && invoice.selectedServices.length > 0 && (
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                              <Label className="text-amber-700 font-medium mb-2 block">خدمات اضافی</Label>
                              <div className="flex flex-wrap gap-2">
                                {invoice.selectedServices.map((service, index) => (
                                  <Badge key={index} variant="secondary" className="bg-amber-100 text-amber-800">
                                    {service.name}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Travelers Information */}
                          {invoice.travelers && Array.isArray(invoice.travelers) &&
                          <div className="border rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-4">
                              <User className="h-5 w-5 text-muted-foreground" />
                              <Label className="font-medium">مسافران ({invoice.travelers.length} نفر)</Label>
                            </div>
                            <div className="grid gap-3">
                              {invoice.travelers.map((traveler, index) => (
                                <div key={traveler.id || index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium">{index + 1}</span>
                                    </div>
                                    <div>
                                      <p className="font-medium">{traveler.firstName} {traveler.lastName}</p>
                                      <div className="flex gap-4 text-sm text-muted-foreground mt-1">
                                        <span>کد ملی: {traveler.nationalId}</span>
                                        <span>سن: {traveler.age} سال</span>
                                        {traveler.passengerType && (
                                          <span>
                                            {traveler.passengerType === "1" ? "بزرگسال" : 
                                             traveler.passengerType === "2" ? "کودک" : "نوزاد"}
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right text-sm text-muted-foreground">
                                    {traveler.phoneNumber && <p>{traveler.phoneNumber}</p>}
                                    {traveler.email && <p>{traveler.email}</p>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                          }

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-4 border-t">
                            {invoice.state === "WAITING" && (
                              <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                پرداخت صورت حساب
                              </button>
                            )}
                            <button
                            onClick={() => router.push(`/invoice/${invoice.id}`)} 
                            className="border border-gray-300 px-6 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                              مشاهده جزئیات
                            </button>
                            {invoice.state === "WAITING" && (
                              <button className="text-red-600 px-6 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors">
                                لغو رزرو
                              </button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}