"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Wallet, CreditCard, Zap, Shield, CheckCircle, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useSnack } from "@/hooks/use-notification"
import { useRouter } from "next/navigation"

interface PaymentRequest {
  amount: number;
  userId: string;
  userEmail?: string;
  userPhone?: string;
  description?: string;
  invoiceId?: string;
}

interface PaymentResponse {
  success: boolean;
  paymentUrl?: string;
  trackId?: number;
  message: string;
  error?: string;
}

export default function ChargeCreditPage() {
  const [amount, setAmount] = useState("")
  const [selectedMethod, setSelectedMethod] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const { success, error } = useSnack()
  const router = useRouter()

  const paymentMethods = [
    {
      id: "bank",
      name: "درگاه بانکی",
      description: "پرداخت امن از طریق درگاه بانکی",
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      popular: true
    },
    {
      id: "wallet",
      name: "کیف پول الکترونیکی",
      description: "پرداخت از طریق کیف پول های دیجیتال",
      icon: Wallet,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      id: "crypto",
      name: "ارز دیجیتال",
      description: "پرداخت با ارزهای دیجیتال",
      icon: Zap,
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    }
  ]

  const presetAmounts = [
    { value: "100000", label: "۱۰۰,۰۰۰ تومان" },
    { value: "500000", label: "۵۰۰,۰۰۰ تومان" },
    { value: "1000000", label: "۱,۰۰۰,۰۰۰ تومان" },
    { value: "2000000", label: "۲,۰۰۰,۰۰۰ تومان" }
  ]

  const handleAmountSelect = (value: string) => {
    setAmount(value)
  }

  const handlePayment = async () => {
    if (!amount || !selectedMethod) {
      error("لطفا مبلغ و روش پرداخت را انتخاب کنید")
      return
    }

    const amountNumber = parseInt(amount)
    if (amountNumber < 100000) {
      error("حداقل مبلغ شارژ ۱۰۰,۰۰۰ تومان می‌باشد")
      return
    }

    setIsProcessing(true)

    try {
      // Prepare payment data
      const paymentData: PaymentRequest = {
        amount: amountNumber,
        userId: "current-user-id", // You should get this from your auth context
        userEmail: "user@example.com", // You should get this from your auth context
        userPhone: "09123456789", // You should get this from user profile
        description: `شارژ اعتبار به مبلغ ${amountNumber.toLocaleString('fa-IR')} تومان`,
      }

      console.log('Sending payment request:', paymentData)

      // Call Zibal payment API
      const response = await fetch('/api/zibal/pay', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData)
      })

      const result: PaymentResponse = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'خطا در ارتباط با سرور')
      }

      if (result.success && result.paymentUrl) {
        success("در حال انتقال به درگاه پرداخت...")
        
        // Redirect to Zibal payment gateway
        setTimeout(() => {
          window.location.href = result.paymentUrl!
        }, 1000)
        
      } else {
        throw new Error(result.message || 'خطا در ایجاد درگاه پرداخت')
      }

    } catch (err) {
      console.error('Payment error:', err)
      error(err instanceof Error ? err.message : 'خطا در پرداخت، لطفا دوباره تلاش کنید')
    } finally {
      setIsProcessing(false)
    }
  }

  const formatAmount = (value: string) => {
    if (!value) return ""
    return parseInt(value).toLocaleString('fa-IR')
  }

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, '')
    if (/^\d*$/.test(value)) {
      setAmount(value)
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={() => router.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                بازگشت
              </Button>
              <div>
                <h1 className="text-3xl font-bold mb-2">شارژ اعتبار</h1>
                <p className="text-muted-foreground">افزایش اعتبار حساب برای رزروهای آتی</p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <DashboardNav />
            </aside>
            
            <div className="lg:col-span-3">
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Amount Selection Card */}
                  <Card className="border shadow-sm hover:shadow-md transition-shadow py-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-green-600" />
                        انتخاب مبلغ شارژ
                      </CardTitle>
                      <CardDescription>
                        مبلغ مورد نظر برای افزایش اعتبار حساب را انتخاب کنید
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Preset Amounts */}
                      <div className="space-y-4">
                        <Label>مقادیر پیشنهادی</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {presetAmounts.map((preset) => (
                            <button
                              key={preset.value}
                              type="button"
                              onClick={() => handleAmountSelect(preset.value)}
                              className={`p-4 border rounded-lg text-center transition-all hover:border-green-500 hover:bg-green-50 ${
                                amount === preset.value 
                                  ? 'border-green-500 bg-green-50 ring-2 ring-green-500 ring-opacity-20' 
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="font-medium text-gray-900">{preset.label}</div>
                              {amount === preset.value && (
                                <CheckCircle className="h-4 w-4 text-green-600 mx-auto mt-1" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Custom Amount */}
                      <div className="space-y-3">
                        <Label htmlFor="customAmount">مبلغ دلخواه</Label>
                        <div className="relative">
                          <Input
                            id="customAmount"
                            type="text"
                            placeholder="مبلغ مورد نظر را وارد کنید"
                            value={formatAmount(amount)}
                            onChange={handleCustomAmountChange}
                            className="pl-12 text-left font-medium text-lg"
                          />
                          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                            <span className="text-muted-foreground">تومان</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          حداقل مبلغ شارژ: ۱۰۰,۰۰۰ تومان
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Method Selection */}
                  <Card className="border shadow-sm hover:shadow-md transition-shadow py-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-blue-600" />
                        انتخاب روش پرداخت
                      </CardTitle>
                      <CardDescription>
                        روش پرداخت مورد نظر خود را انتخاب کنید
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {paymentMethods.map((method) => (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setSelectedMethod(method.id)}
                          className={`w-full p-4 border rounded-lg text-right transition-all hover:border-blue-500 hover:shadow-md ${
                            selectedMethod === method.id 
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20' 
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg ${method.bgColor} ${method.color}`}>
                              <method.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1 mr-3">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">{method.name}</span>
                                {method.popular && (
                                  <Badge className="bg-blue-100 text-blue-800 text-xs">
                                    پرطرفدار
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {method.description}
                              </p>
                            </div>
                            {selectedMethod === method.id && (
                              <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                            )}
                          </div>
                        </button>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Summary Sidebar */}
                <div className="space-y-6">
                  {/* Order Summary */}
                  <Card className="border shadow-sm hover:shadow-md transition-shadow sticky top-6 py-6">
                    <CardHeader>
                      <CardTitle>خلاصه شارژ</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">مبلغ شارژ:</span>
                          <span className="font-medium">
                            {amount ? `${formatAmount(amount)} تومان` : "---"}
                          </span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">کارمزد:</span>
                          <span className="font-medium">۰ تومان</span>
                        </div>
                        
                        <div className="pt-3 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">مبلغ قابل پرداخت:</span>
                            <span className="text-2xl font-bold text-green-600">
                              {amount ? `${formatAmount(amount)} تومان` : "---"}
                            </span>
                          </div>
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        size="lg"
                        onClick={handlePayment}
                        disabled={!amount || !selectedMethod || isProcessing || parseInt(amount) < 100000}
                      >
                        {isProcessing ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin ml-2" />
                            در حال انتقال به درگاه...
                          </>
                        ) : (
                          <>
                            <CreditCard className="ml-2 h-4 w-4" />
                            انتقال به درگاه پرداخت
                          </>
                        )}
                      </Button>

                      {/* Security Badge */}
                      <div className="flex items-center gap-2 justify-center pt-4 border-t">
                        <Shield className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-muted-foreground">
                          پرداخت امن با SSL
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Features Card */}
                  <Card className="border shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                            <Zap className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">پرداخت سریع</h4>
                            <p className="text-xs text-muted-foreground">
                              رزرو فوری با اعتبار حساب
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Shield className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">امنیت بالا</h4>
                            <p className="text-xs text-muted-foreground">
                              اطلاعات شما کاملا محافظت می‌شود
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-purple-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">تضمین بازگشت</h4>
                            <p className="text-xs text-muted-foreground">
                              امکان بازگشت اعتبار در صورت نیاز
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Additional Information */}
              <Card className="mt-6 border shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-3 gap-6 text-sm">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CreditCard className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-medium mb-2">پرداخت امن</h4>
                      <p className="text-muted-foreground text-xs">
                        تمامی پرداخت‌ها با پروتکل SSL انجام می‌شود
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Zap className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-medium mb-2">شارژ فوری</h4>
                      <p className="text-muted-foreground text-xs">
                        اعتبار بلافاصله پس از پرداخت به حساب اضافه می‌شود
                      </p>
                    </div>
                    
                    <div className="text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Shield className="h-6 w-6 text-orange-600" />
                      </div>
                      <h4 className="font-medium mb-2">پشتیبانی ۲۴/۷</h4>
                      <p className="text-muted-foreground text-xs">
                        در صورت بروز مشکل، پشتیبانی همیشه در دسترس است
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}