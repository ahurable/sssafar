"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, RefreshCw, Phone, Mail, AlertTriangle } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useState } from "react"

export default function PaymentFailedPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const trackId = searchParams.get('trackId')
  const errorCode = searchParams.get('error')
  const paymentType = searchParams.get('paymentType') || 'credit'
  const [isRetrying, setIsRetrying] = useState(false)

  const getErrorMessage = () => {
    switch (errorCode) {
      case 'INSUFFICIENT_FUNDS':
        return "موجودی حساب بانکی شما کافی نیست"
      case 'PAYMENT_FAILED':
        return "پرداخت توسط بانک رد شد"
      case 'EXPIRED_TRACK_ID':
        return "زمان پرداخت به پایان رسیده است"
      case 'INVALID_AMOUNT':
        return "مبلغ پرداخت نامعتبر است"
      case 'SYSTEM_ERROR':
        return "خطای سیستمی رخ داده است"
      default:
        return "پرداخت با مشکل مواجه شد"
    }
  }

  const getPaymentTypeText = () => {
    switch (paymentType) {
      case 'credit':
        return 'شارژ اعتبار'
      case 'invoice':
        return 'پرداخت صورت حساب'
      case 'service':
        return 'پرداخت خدمات'
      default:
        return 'پرداخت'
    }
  }

  const handleRetry = () => {
    setIsRetrying(true)
    // Redirect back to payment page based on type
    setTimeout(() => {
      if (paymentType === 'credit') {
        router.push('/charge')
      } else if (paymentType === 'invoice') {
        router.push('/invoices')
      } else {
        router.push('/dashboard')
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Error Card */}
          <div className="relative">
            {/* Floating Background Elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-red-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-rose-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
            
            <Card className="border-red-200 bg-[#fffefe]/80 backdrop-blur-sm shadow-2xl relative overflow-hidden">
              {/* Animated Background Gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-400 to-rose-500"></div>
              
              <CardContent className="p-8 text-center relative">
                {/* Error Icon */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-red-400 to-rose-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
                    <XCircle className="h-12 w-12 text-white" />
                  </div>
                  <AlertTriangle className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-bounce" />
                </div>
                
                {/* Error Message */}
                <h1 className="text-4xl font-bold text-red-800 mb-4 animate-fade-in">
                  پرداخت ناموفق بود
                </h1>
                
                <div className="space-y-4 mb-6 animate-fade-in-up">
                  <p className="text-red-700 text-lg font-medium">
                    {getPaymentTypeText()} شما تکمیل نشد
                  </p>
                  
                  <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                    <p className="text-red-800 font-medium">
                      {getErrorMessage()}
                    </p>
                    {trackId && (
                      <p className="text-sm text-red-600 mt-2">
                        کد رهگیری: <span className="font-mono">{trackId}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6 animate-fade-in-up">
                  <Button 
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="bg-red-600 hover:bg-red-700 shadow-lg transition-all duration-300 hover:scale-105"
                    size="lg"
                  >
                    {isRetrying ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                        در حال انتقال...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-5 w-5 ml-2" />
                        تلاش مجدد
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/dashboard')}
                    className="border-red-300 text-red-700 hover:bg-red-50 transition-all duration-300"
                  >
                    <ArrowLeft className="h-5 w-5 ml-2" />
                    بازگشت به داشبورد
                  </Button>
                </div>

                {/* Refund Information */}
                <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-200 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="text-right text-sm text-amber-700">
                      <p className="font-medium">توجه مهم</p>
                      <p className="mt-1">
                        در صورت کسر مبلغ از حساب شما، طی ۷۲ ساعت آینده به حساب شما باز خواهد گشت.
                        نیازی به اقدام خاصی نیست.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Support Section */}
          <div className="grid md:grid-cols-2 gap-6 mt-8">
            <Card className="border-blue-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-semibold text-gray-800">پشتیبانی تلفنی</h4>
                    <p className="text-sm text-gray-600">تماس مستقیم با پشتیبانی</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">۰۲۱-۱۲۳۴۵۶۷۸</p>
                  <p className="text-sm text-gray-500 mt-1">همه روزه از ساعت ۸ صبح تا ۱۲ شب</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Mail className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="text-right">
                    <h4 className="font-semibold text-gray-800">پشتیبانی ایمیلی</h4>
                    <p className="text-sm text-gray-600">ارسال تیکت پشتیبانی</p>
                  </div>
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium text-green-600">support@example.com</p>
                  <p className="text-sm text-gray-500 mt-1">پاسخگویی در کمتر از ۲ ساعت</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Common Solutions */}
          <Card className="mt-6 border-gray-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-gray-800 mb-4 text-center">راهکارهای رفع مشکل</h3>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-right">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>از صحت اطلاعات کارت بانکی اطمینان حاصل کنید</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>موجودی حساب بانکی خود را بررسی کنید</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>از فعال بودن کارت برای پرداخت آنلاین مطمئن شوید</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span>محدودیت‌های پرداخت بانک خود را بررسی کنید</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
      
      <style jsx global>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-fade-in-up { animation: fade-in-up 0.8s ease-out; }
      `}</style>
    </div>
  )
}