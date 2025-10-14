"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, Plane, User, CreditCard, Building, Wallet } from "lucide-react"

interface Traveler {
  id: string
  firstName: string
  lastName: string
  nationalId: string
  dateOfBirth: string
  passportNumber?: string
  passportExpiry?: string
  age?: number
}

interface Invoice {
  id: string
  kind: "FLIGHT" | "HOTEL" | "TRAIN"
  amount: string
  state: "WAITING" | "PAID" | "CANCELLED"
  flightType?: string
  flightSourceCode?: string
  travelers: Traveler[]
  selectedServices?: any[]
  expireAt: string
  createdAt: string
}

interface UserCredit {
  balance: number
}

interface Panel {
  id: string
  name: string
  discountPercentage: number
  totalCredit: number
  credit: number // For panel members
}

interface InvoiceComponentProps {
  invoice: Invoice
  userCredit?: UserCredit
  userPanels?: Panel[]
  onPayment: (paymentMethod: "CREDIT" | "PANELCREDIT" | "STRAIGHT", panelId?: string) => void
  loading?: boolean
}

export function InvoiceComponent({ 
  invoice, 
  userCredit, 
  userPanels = [], 
  onPayment, 
  loading = false 
}: InvoiceComponentProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"CREDIT" | "PANELCREDIT" | "STRAIGHT">("STRAIGHT")
  const [selectedPanelId, setSelectedPanelId] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<string>("")

  // Calculate time until expiration
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date()
      const expireAt = new Date(invoice.expireAt)
      const difference = expireAt.getTime() - now.getTime()

      if (difference <= 0) {
        setTimeLeft("منقضی شده")
        return
      }

      const minutes = Math.floor(difference / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)
      setTimeLeft(`${minutes} دقیقه و ${seconds} ثانیه`)
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(timer)
  }, [invoice.expireAt])

  const isExpired = timeLeft === "منقضی شده"
  const amount = parseInt(invoice.amount)
  const formattedAmount = amount.toLocaleString('fa-IR') + " ریال"

  // Calculate available credit after discount for panels
  const getPanelAvailableCredit = (panel: Panel) => {
    const discountAmount = amount * (panel.discountPercentage / 100)
    const finalAmount = amount - discountAmount
    return Math.min(panel.credit, finalAmount)
  }

  const handlePayment = () => {
    if (selectedPaymentMethod === "PANELCREDIT" && !selectedPanelId) {
      alert("لطفا یک پنل را انتخاب کنید")
      return
    }
    
    onPayment(selectedPaymentMethod, selectedPanelId || undefined)
  }

  const canUseCredit = userCredit && userCredit.balance >= amount
  const availablePanels = userPanels.filter(panel => getPanelAvailableCredit(panel) >= amount)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with expiration */}
      <Card className="border-l-4 border-l-amber-500">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <h2 className="text-lg font-semibold">صورت حساب پرواز</h2>
                <p className="text-sm text-muted-foreground">
                  زمان باقی‌مانده برای پرداخت:{" "}
                  <span className={isExpired ? "text-red-600 font-medium" : "text-amber-600 font-medium"}>
                    {timeLeft}
                  </span>
                </p>
              </div>
            </div>
            <Badge variant={isExpired ? "destructive" : "default"}>
              {isExpired ? "منقضی شده" : "در انتظار پرداخت"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Flight and Traveler Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plane className="h-5 w-5" />
                اطلاعات پرواز
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm text-muted-foreground">نوع پرواز</Label>
                  <p className="font-medium">{invoice.flightType === "one-way" ? "یک طرفه" : "رفت و برگشت"}</p>
                </div>
                <div>
                  <Label className="text-sm text-muted-foreground">کد رزرو</Label>
                  <p className="font-mono text-sm">{invoice.flightSourceCode?.substring(0, 12)}...</p>
                </div>
              </div>
              
              {invoice.selectedServices && invoice.selectedServices.length > 0 && (
                <div>
                  <Label className="text-sm text-muted-foreground">خدمات اضافی</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {invoice.selectedServices.map((service, index) => (
                      <Badge key={index} variant="secondary">
                        {service.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Travelers Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                اطلاعات مسافران ({invoice.travelers.length} نفر)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoice.travelers.map((traveler, index) => (
                <div key={traveler.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">مسافر {index + 1}</h4>
                    <Badge variant="outline">سن: {traveler.age} سال</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">نام کامل</Label>
                      <p>{traveler.firstName} {traveler.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">کد ملی</Label>
                      <p>{traveler.nationalId}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">تاریخ تولد</Label>
                      <p>{new Date(traveler.dateOfBirth).toLocaleDateString('fa-IR')}</p>
                    </div>
                    {traveler.passportNumber && (
                      <div>
                        <Label className="text-muted-foreground">شماره پاسپورت</Label>
                        <p>{traveler.passportNumber}</p>
                      </div>
                    )}
                    {traveler.passportExpiry && (
                      <div>
                        <Label className="text-muted-foreground">انقضای پاسپورت</Label>
                        <p>{new Date(traveler.passportExpiry).toLocaleDateString('fa-IR')}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Payment Section */}
        <div className="space-y-6">
          {/* Amount Summary */}
          <Card>
            <CardHeader>
              <CardTitle>خلاصه پرداخت</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">مبلغ کل:</span>
                <span className="text-2xl font-bold text-green-600">{formattedAmount}</span>
              </div>
              
              {isExpired && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-sm">این صورت حساب منقضی شده است</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card>
            <CardHeader>
              <CardTitle>روش پرداخت</CardTitle>
              <CardDescription>یکی از روش‌های پرداخت زیر را انتخاب کنید</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <RadioGroup value={selectedPaymentMethod} onValueChange={(value: "CREDIT" | "PANELCREDIT" | "STRAIGHT") => setSelectedPaymentMethod(value)}>
                {/* Credit Payment */}
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4">
                  <RadioGroupItem value="CREDIT" id="credit" />
                  <Label htmlFor="credit" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        <span>پرداخت از اعتبار</span>
                      </div>
                      {userCredit && (
                        <Badge variant="secondary">
                          {userCredit.balance.toLocaleString('fa-IR')} ریال
                        </Badge>
                      )}
                    </div>
                    {userCredit && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {canUseCredit ? (
                          <span className="text-green-600">اعتبار کافی است</span>
                        ) : (
                          <span className="text-red-600">اعتبار کافی نیست</span>
                        )}
                      </p>
                    )}
                  </Label>
                </div>

                {/* Panel Credit Payment */}
                {userPanels.length > 0 && (
                  <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4">
                    <RadioGroupItem value="PANELCREDIT" id="panelcredit" />
                    <Label htmlFor="panelcredit" className="flex-1 cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4" />
                          <span>پرداخت از اعتبار پنل</span>
                        </div>
                      </div>
                      
                      {selectedPaymentMethod === "PANELCREDIT" && (
                        <div className="mt-3 space-y-2">
                          <Label>انتخاب پنل:</Label>
                          <select 
                            className="w-full p-2 border rounded-md"
                            value={selectedPanelId}
                            onChange={(e) => setSelectedPanelId(e.target.value)}
                          >
                            <option value="">یک پنل انتخاب کنید</option>
                            {availablePanels.map(panel => (
                              <option key={panel.id} value={panel.id}>
                                {panel.name} - {panel.credit.toLocaleString('fa-IR')} ریال
                                {panel.discountPercentage > 0 && ` (${panel.discountPercentage}% تخفیف)`}
                              </option>
                            ))}
                          </select>
                          
                          {availablePanels.length === 0 && (
                            <p className="text-sm text-red-600">هیچ پنلی با اعتبار کافی موجود نیست</p>
                          )}
                        </div>
                      )}
                    </Label>
                  </div>
                )}

                {/* Straight Payment */}
                <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4">
                  <RadioGroupItem value="STRAIGHT" id="straight" />
                  <Label htmlFor="straight" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span>پرداخت مستقیم</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      پرداخت از طریق درگاه بانکی
                    </p>
                  </Label>
                </div>
              </RadioGroup>

              {/* Payment Button */}
              <Button 
                className="w-full" 
                size="lg"
                onClick={handlePayment}
                disabled={
                  loading || 
                  isExpired || 
                  (selectedPaymentMethod === "CREDIT" && !canUseCredit) ||
                  (selectedPaymentMethod === "PANELCREDIT" && (!selectedPanelId || availablePanels.length === 0))
                }
              >
                {loading ? (
                  "در حال پردازش..."
                ) : (
                  <>
                    <CreditCard className="ml-2 h-4 w-4" />
                    {selectedPaymentMethod === "CREDIT" && "پرداخت از اعتبار"}
                    {selectedPaymentMethod === "PANELCREDIT" && "پرداخت از پنل"}
                    {selectedPaymentMethod === "STRAIGHT" && "پرداخت از درگاه بانکی"}
                  </>
                )}
              </Button>

              {/* Payment Help Text */}
              <div className="text-xs text-muted-foreground space-y-1">
                {selectedPaymentMethod === "CREDIT" && (
                  <p>مبلغ {formattedAmount} از اعتبار شما کسر خواهد شد</p>
                )}
                {selectedPaymentMethod === "PANELCREDIT" && selectedPanelId && (
                  <p>
                    مبلغ {formattedAmount} از اعتبار پنل کسر خواهد شد
                    {userPanels && userPanels.length > 0 && userPanels.find(p => p.id === selectedPanelId)?.discountPercentage > 0 && 
                      ` (با تخفیف ${userPanels.find(p => p.id === selectedPanelId)?.discountPercentage}%)`
                    }
                  </p>
                )}
                {selectedPaymentMethod === "STRAIGHT" && (
                  <p>به درگاه امن بانکی هدایت خواهید شد</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}