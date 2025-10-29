"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Download, Home, ArrowLeft, CreditCard, Sparkles } from "lucide-react"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import confetti from 'canvas-confetti'

interface PaymentDetails {
  amount?: number
  refNumber?: string
  cardNumber?: string
  message?: string
  alreadyProcessed?: boolean
}

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const trackId = searchParams.get('trackId')
  const amount = searchParams.get('amount')
  const refNumber = searchParams.get('refNumber')
  const [showConfetti, setShowConfetti] = useState(false)
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: amount ? parseInt(amount) : undefined,
    refNumber: refNumber || undefined,
    message: "شارژ اعتبار با موفقیت انجام شد"
  })

  // Launch confetti animation
  useEffect(() => {
    if (!showConfetti) {
      setShowConfetti(true)
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#059669', '#047857', '#ec4899', '#8b5cf6']
      })

      setTimeout(() => confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0 }
      }), 250)

      setTimeout(() => confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1 }
      }), 400)
    }
  }, [showConfetti])

  const formatAmount = (amount: number) => {
    return amount?.toLocaleString('fa-IR') + ' تومان'
  }

  const formatCardNumber = (cardNumber: string) => {
    return `•••• •••• •••• ${cardNumber.slice(-4)}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Animated Success Card */}
          <div className="relative">
            {/* Floating Background Elements */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
            
            <Card className="border-green-200 bg-white/80 backdrop-blur-sm shadow-2xl relative overflow-hidden">
              {/* Animated Background Gradient */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse"></div>
              
              <CardContent className="p-8 text-center relative">
                {/* Animated Check Icon */}
                <div className="relative mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-lg animate-bounce">
                    <CheckCircle className="h-12 w-12 text-white" />
                  </div>
                  <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
                </div>
                
                {/* Success Message */}
                <h1 className="text-4xl font-bold text-green-800 mb-4 animate-fade-in">
                  پرداخت با موفقیت انجام شد!
                </h1>
                
                <div className="space-y-3 mb-6 animate-fade-in-up">
                  <p className="text-green-700 text-lg font-medium">
                    {paymentDetails.message}
                  </p>
                  
                  {paymentDetails.amount && (
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-emerald-600">
                        {formatAmount(paymentDetails.amount)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment Details */}
                <div className="bg-green-50 rounded-2xl p-6 mb-6 border border-green-200 animate-fade-in-up">
                  <h3 className="font-semibold text-green-800 mb-4 flex items-center justify-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    جزئیات پرداخت
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {trackId && (
                      <div className="text-center">
                        <span className="text-green-600 block">کد رهگیری:</span>
                        <span className="font-mono font-bold text-green-800">{trackId}</span>
                      </div>
                    )}
                    {paymentDetails.refNumber && (
                      <div className="text-center">
                        <span className="text-green-600 block">شماره پیگیری:</span>
                        <span className="font-mono font-bold text-green-800">{paymentDetails.refNumber}</span>
                      </div>
                    )}
                    {paymentDetails.alreadyProcessed && (
                      <div className="col-span-2 text-center">
                        <span className="text-amber-600 text-sm">
                          ✅ این تراکنش قبلاً پردازش شده بود
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center animate-fade-in-up">
                  <Button 
                    onClick={() => router.push('/dashboard')}
                    className="bg-green-600 hover:bg-green-700 shadow-lg transition-all duration-300 hover:scale-105"
                    size="lg"
                  >
                    <Home className="h-5 w-5 ml-2" />
                    بازگشت به داشبورد
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/charge')}
                    className="border-green-300 text-green-700 hover:bg-green-50 transition-all duration-300"
                  >
                    <ArrowLeft className="h-5 w-5 ml-2" />
                    شارژ مجدد
                  </Button>
                </div>

                {/* Success Tips */}
                <div className="mt-8 p-4 bg-gradient-to-r from-green-100 to-emerald-100 rounded-xl border border-green-200 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="text-right text-sm text-green-700">
                      <p className="font-medium">اعتبار شما با موفقیت افزایش یافت</p>
                      <p className="mt-1">اکنون می‌توانید از اعتبار خود برای رزرو هتل و پرواز استفاده کنید.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
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