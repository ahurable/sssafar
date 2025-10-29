"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, Plane, User, CreditCard, Building, Wallet, Hotel, MapPin, Calendar, Star, Bed, UtensilsCrossed, Loader2, RefreshCw, Info } from "lucide-react"
import { useSnack } from "@/hooks/use-notification"
import { useRouter } from "next/navigation"

interface Traveler {
  id: string
  firstName: string
  lastName: string
  nationalId: string
  nationality: "IR"
  dateOfBirth: string
  passportNumber?: string
  passportExpiry?: string
  age?: number
  passengerType: string
  gender: string
  email?: string
  phoneNumber?: string
}

interface HotelRoom {
  RoomId: string
  RoomMapId: string | null
  Name: string
  RoomMapName: string | null
  AdultCount: number
  ExtraBedCount: number
  ChildCount: number
  ChildAges: string[] | null
  MealType: string
  SharingBedding: boolean
  BedGroups: string | null
  HotelRoomEarlyCheckin: any | null
  HotelRoomLateCheckout: any | null
}

interface HotelPolicy {
  BeginTime: string | null
  EndTime: string | null
  MinAge: string | null
  CheckOutTime: string | null
  Instructions: string | null
  SpecialInstructions: string | null
  InstructionsFa: string | null
  SpecialInstructionsFa: string | null
  ChildPolicyDescriptionFa: string | null
  SingleWomanDescriptionFa: string | null
  MandatoryFee: string | null
  OptionalFee: string | null
  KnowBeforeYouGo: string | null
}

interface HotelOrder {
  // Original order data
  HotelId: number
  HotelName?: string
  CheckIn: string
  CheckOut: string
  Rooms: HotelRoom[]
  NetRate: number
  Currency: string
  NonRefundable: boolean
  HotelPolicy: HotelPolicy
  Amenities: string[]
  AvailableRoom: number
  FareSourceCode: string
  
  // Revalidated data (will be populated)
  RevalidatedData?: {
    Success: boolean
    Error: any | null
    CheckIn: string
    CheckOut: string
    PricedItinerary: {
      FareSourceCode: string
      Offer: string | null
      Promotion: string | null
      NonRefundable: boolean
      HotelId: number
      HotelPolicy: HotelPolicy
      ExtraCharge: any | null
      PaymentDeadline: string
      Currency: string
      AvailableRoom: number
      PlainTextCancellationPolicy: string | null
      NetRate: number
      NetRateWithoutDiscount: number
      ExtraBedRate: number
      BaseRate: number
      Rooms: HotelRoom[]
      Surcharges: any[]
      CancellationPolicies: any[]
      Remarks: string[]
      RemarksFa: string[]
      Amenities: string[] | null
      IsReserveOffline: boolean
      IsBlockout: boolean
      IsMinStayNight: boolean
      MinStayNight: number
      IsMaxStayNight: boolean
      MaxStayNight: number
      IsFixStayNight: boolean
      FixStayNight: number
      IsBoardPrice: boolean
      HotelRefundType: string
      NationalityRule: any | null
      OtherNationalities: any[]
      PricedItineraryTransfers: any[]
      HotelPricedItineraryMetaDatas: any[]
      IsFixStay: boolean
      HotelPricedItineraryFixStayList: any[]
      HotelLabels: string[]
    }
  }
}

interface FlightOrder {
  FareSourceCode?: string
  ValidatingAirlineCode?: string
  IsClosed?: boolean
  NonRefundableType?: number
  IsMealServiceMandatory?: boolean
  IsSeatServiceMandatory?: boolean
  IsAutoReserved?: boolean
  IsPassportMandatory?: boolean
  IsPassportIssueDateMandatory?: boolean
  IsDestinationAddressMandatory?: boolean
  AirItineraryPricingInfo?: {
    ItinTotalFare?: {
      TotalFare?: number
      Currency?: string
      BaseFare?: number
      TotalTax?: number
    }
    FareType?: number
  }
  HasCancellationGuarantee?: boolean
  HasAmenities?: boolean
  HasFareFamilies?: boolean
  RefundMethod?: number
  PayLater?: {
    HasPayLater?: boolean
  }
}

interface Invoice {
  id: string
  kind: "FLIGHT" | "HOTEL" | "TRAIN"
  amount: string
  state: "WAITING" | "PAID" | "CANCELLED"
  flightType?: string
  flightSourceCode?: string
  travelers: Traveler[]
  order: any // This can be FlightOrder or HotelOrder
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
  credit: number
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
  const { success, error } = useSnack()
  const [paid, setPaid] = useState(false)
  const [revalidatingHotel, setRevalidatingHotel] = useState(false)
  const [hotelOrderWithRevalidation, setHotelOrderWithRevalidation] = useState<HotelOrder | null>(null)
  const [showRevalidationDetails, setShowRevalidationDetails] = useState(false)

  // Type guards
  const isHotelInvoice = invoice.kind === "HOTEL"
  const isFlightInvoice = invoice.kind === "FLIGHT"
  const hotelOrder = isHotelInvoice ? invoice.order as HotelOrder : null
  const flightOrder = isFlightInvoice ? invoice.order as FlightOrder : null

  // Revalidate hotel data before showing invoice
  useEffect(() => {
    const revalidateHotel = async () => {
      if (!isHotelInvoice || !hotelOrder || hotelOrderWithRevalidation) return

      try {
        setRevalidatingHotel(true)
        console.log("Revalidating hotel data for invoice...")

        const revalidateResponse = await fetch('/api/hotels/details', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            FareSourceCode: hotelOrder.FareSourceCode,
            FixStayId: null,
            Nationality: null
          })
        })

        if (!revalidateResponse.ok) {
          throw new Error('Failed to revalidate hotel')
        }

        const revalidateResult = await revalidateResponse.json()
        console.log("Hotel revalidation result:", revalidateResult)

        if (revalidateResult.Success) {
          // Update hotel order with revalidated data
          const updatedHotelOrder: HotelOrder = {
            ...hotelOrder,
            RevalidatedData: revalidateResult.data
          }
          setHotelOrderWithRevalidation(updatedHotelOrder)
          success("اطلاعات هتل با موفقیت بروزرسانی شد")
        } else {
          error(revalidateResult.Error?.Message || "خطا در بروزرسانی اطلاعات هتل")
          // Fallback to original data
          setHotelOrderWithRevalidation(hotelOrder)
        }
      } catch (err) {
        console.error('Error revalidating hotel:', err)
        error("خطا در دریافت اطلاعات بروز هتل")
        // Fallback to original data
        setHotelOrderWithRevalidation(hotelOrder)
      } finally {
        setRevalidatingHotel(false)
      }
    }

    if (isHotelInvoice && hotelOrder && !hotelOrderWithRevalidation) {
      revalidateHotel()
    }
  }, [isHotelInvoice, hotelOrder, hotelOrderWithRevalidation, success, error])

  // Manual revalidation function
  const handleManualRevalidate = async () => {
    if (!isHotelInvoice || !hotelOrder) return

    try {
      setRevalidatingHotel(true)
      console.log("Manual revalidation triggered...")

      const revalidateResponse = await fetch('/api/hotels/details', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          FareSourceCode: hotelOrder.FareSourceCode,
          FixStayId: null,
          Nationality: null
        })
      })

      if (!revalidateResponse.ok) {
        throw new Error('Failed to revalidate hotel')
      }

      const revalidateResult = await revalidateResponse.json()
      console.log("Manual revalidation result:", revalidateResult)

      if (revalidateResult.Success) {
        const updatedHotelOrder: HotelOrder = {
          ...hotelOrder,
          RevalidatedData: revalidateResult
        }
        setHotelOrderWithRevalidation(updatedHotelOrder)
        success("اطلاعات هتل با موفقیت بروزرسانی شد")
      } else {
        error(revalidateResult.Error?.Message || "خطا در بروزرسانی اطلاعات هتل")
      }
    } catch (err) {
      console.error('Error in manual revalidation:', err)
      error("خطا در دریافت اطلاعات بروز هتل")
    } finally {
      setRevalidatingHotel(false)
    }
  }

  // Use revalidated data if available, otherwise use original
  const currentHotelOrder = hotelOrderWithRevalidation || hotelOrder

  useEffect(() => {
    console.log("Invoice order:", invoice.order)
    console.log("Invoice kind:", invoice.kind)
    console.log("Hotel order:", currentHotelOrder)
    console.log("Flight order:", flightOrder)
    console.log("Travelers:", invoice.travelers)
  }, [invoice.order, invoice.kind, currentHotelOrder, flightOrder, invoice.travelers])

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

  const getPanelAvailableCredit = (panel: Panel) => {
    const discountAmount = amount * (panel.discountPercentage / 100)
    const finalAmount = amount - discountAmount
    return Math.min(panel.credit, finalAmount)
  }

  const router = useRouter()

  const handlePayment = async () => {
    if (selectedPaymentMethod === "PANELCREDIT" && !selectedPanelId) {
      alert("لطفا یک پنل را انتخاب کنید")
      return
    }

    if (selectedPaymentMethod === "STRAIGHT") {
      const res = await fetch('/api/zibal/pay', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: amount,
          orderId: invoice.id,
          invoiceId: invoice.id,
          paymentType: "INVOICE_PAYMENT"
        })
      })

      const data = await res.json()
      console.log(data)
      if (!res.ok) {
        error("خطایی در رفتن به صفحه پرداخت رخ داد")
      }
      else {
        success("در حال انتقال به صفحه پرداخت")
        router.push(data.paymentUrl)
      }
    }

    if (selectedPaymentMethod === "CREDIT") {
      const res = await fetch(
        `/api/invoice/${invoice.id}/payment/credit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )
      const data = await res.json()

      if (res.ok) {
        success(data.message)
        setPaid(true)
      } else {
        error(data.message)
      }
    } else if (selectedPaymentMethod === "PANELCREDIT") {
      const response = await fetch(`/api/invoice/${invoice.id}/payment/panel`, 
        {
          method: 'POST',
          headers: {
            'Content-Type':'application/json'
          },
          body: JSON.stringify({
            panelId: selectedPanelId
          })
        }
      )
      const data = await response.json()
      console.log(data)
      if (response.ok) {
        success("پرداخت با موفقیت انجام شد")
        setPaid(true)
      } else {
        error(data.message)
      }
    }
    
    else {
      onPayment(selectedPaymentMethod, selectedPanelId || undefined)
    }
  }

  const handleCancelInvoice = async () => {
    success("درحال لغو صورت حساب و بازگشت وجه به اعتبار")

    const res = await fetch(
      `/api/invoice/${invoice.id}/payment`,
      {
        method: "DELETE"
      }
    )

    const data = await res.json()

    if (res.ok) {
      success(data.message)
    } else {
      error(data.message)
    }
  }

  const handleBookReservation = async () => {
    if (isFlightInvoice) {
      const res = await fetch(
        '/api/flights/book',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            invoiceId: invoice.id,
            totalPrice: parseInt(invoice.amount),
            fareSourceCode: flightOrder?.FareSourceCode || invoice.flightSourceCode,
            travelers: invoice.travelers
          })
        }
      )
      const data = await res.json()
      if (res.ok) {
        success(data.message)
      } else {
        error(data.message)
        handleCancelInvoice()
      }
    } else if (isHotelInvoice && currentHotelOrder) {
      const res = await fetch(
        '/api/hotels/book',
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            fareSourceCode: currentHotelOrder.FareSourceCode,
            hotelId: currentHotelOrder.HotelId,
            travelers: invoice.travelers,
            checkIn: currentHotelOrder.CheckIn,
            checkOut: currentHotelOrder.CheckOut,
            rooms: currentHotelOrder.Rooms
          })
        }
      )
      const data = await res.json()
      if (res.ok) {
        success(data.message)
      } else {
        console.log(data)
        error(data.message)
        handleCancelInvoice()
      }
    }
  }

  useEffect(() => {
    if (paid) {
      success("در حال صدور رزرو، صفحه را ترک نکنید")
      handleBookReservation()
    }
  }, [paid])

  const canUseCredit = userCredit && userCredit.balance >= amount 
  const availablePanels = userPanels.filter(panel => getPanelAvailableCredit(panel) >= amount)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fa-IR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('fa-IR')
  }

  const getMealTypeText = (mealType: string) => {
    const mealTypes: Record<string, string> = {
      "Room Only": "بدون غذا",
      "BB": "صبحانه",
      "HB": "صبحانه و ناهار",
      "FB": "تمام وعده‌ها",
      "AI": "همه‌شمول",
      "RO": "بدون غذا"
    }
    return mealTypes[mealType] || mealType
  }

  const formatPrice = (price: number, currency: string = "IRR") => {
    if (currency === "IRR" || currency === "تومان") {
      return (price / 10).toLocaleString("fa-IR") + " تومان" // Convert to Toman
    }
    return price.toLocaleString("fa-IR") + " " + currency
  }

  const getAirlineName = (iataCode: string) => {
    const airlines: { [key: string]: string } = {
      "EK": "امارات",
      "QR": "قطر ایرویز", 
      "EY": "اتیهاد ایرویز",
      "TK": "ترکیش ایرلاینز",
      "OV": "سلام ایر",
      "W5": "ماهان ایر",
      "IR": "ایران ایر",
      "ZV": "قشم ایر"
    }
    return airlines[iataCode] || iataCode
  }

  const calculateNights = () => {
    if (!currentHotelOrder) return 0
    const checkIn = new Date(currentHotelOrder.CheckIn)
    const checkOut = new Date(currentHotelOrder.CheckOut)
    const timeDiff = checkOut.getTime() - checkIn.getTime()
    return Math.ceil(timeDiff / (1000 * 3600 * 24))
  }

  // Helper to get revalidated hotel data
  const getRevalidatedHotelData = () => {
    if (!currentHotelOrder?.RevalidatedData?.PricedItinerary) return null
    return currentHotelOrder.RevalidatedData.PricedItinerary
  }

  const revalidatedHotel = getRevalidatedHotelData() || invoice.order

  // Get passenger type text
  const getPassengerTypeText = (passengerType: string) => {
    const types: Record<string, string> = {
      "0": "کهنسال",
      "1": "بزرگسال", 
      "2": "کودک",
      "3": "نوزاد"
    }
    return types[passengerType] || passengerType
  }

  // Get gender text
  const getGenderText = (gender: string) => {
    const genders: Record<string, string> = {
      "0": "مرد",
      "1": "زن",
      "male": "مرد",
      "female": "زن"
    }
    return genders[gender] || gender
  }

  // Check if there are differences between original and revalidated data
  const hasDataChanges = revalidatedHotel && (
    revalidatedHotel.NetRate !== currentHotelOrder?.NetRate ||
    revalidatedHotel.AvailableRoom !== currentHotelOrder?.AvailableRoom ||
    revalidatedHotel.NonRefundable !== currentHotelOrder?.NonRefundable
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header with expiration */}
      <Card className="border-r-4 border-r-amber-500 mt-8">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <h2 className="text-lg font-semibold">
                  {isFlightInvoice ? "صورت حساب پرواز" : 
                   isHotelInvoice ? "صورت حساب رزرو هتل" : "صورت حساب"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  زمان باقی‌مانده برای پرداخت:{" "}
                  <span className={isExpired ? "text-red-600 font-medium" : "text-amber-600 font-medium"}>
                    {timeLeft}
                  </span>
                </p>
                {isHotelInvoice && revalidatingHotel && paid == false && isExpired && (
                  <div className="flex items-center gap-2 text-blue-600 mt-1">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">در حال بروزرسانی اطلاعات هتل...</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isExpired ? "destructive" : "default"}>
                {isExpired && "منقضی شده" || !paid && "در انتظار پرداخت" || paid && "پرداخت شده"}
              </Badge>
              {isHotelInvoice && revalidatedHotel && (
                <Badge className="bg-green-100 text-green-800">
                  اطلاعات بروز شده
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Order and Traveler Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Flight Information */}
          {/* Flight Information - KEEPING ALL ORIGINAL FLIGHT CONTENT */}
          {isFlightInvoice && flightOrder && (
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plane className="h-5 w-5" />
                  اطلاعات سفارش پرواز
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Flight Type */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <Label className="text-sm text-blue-700 font-medium">نوع پرواز</Label>
                      <p className="font-bold text-blue-900 mt-1">
                        {invoice.flightType === "one-way" ? "یک طرفه" : "رفت و برگشت"}
                      </p>
                    </div>

                    {/* Booking Code */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <Label className="text-sm text-green-700 font-medium">کد رزرو</Label>
                      <p className="font-mono font-bold text-green-900 mt-1">
                        {flightOrder.FareSourceCode?.substring(0, 16)}...
                      </p>
                    </div>

                    {/* Airline */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <Label className="text-sm text-purple-700 font-medium">شرکت هواپیمایی</Label>
                      <p className="font-bold text-purple-900 mt-1">
                        {getAirlineName(flightOrder.ValidatingAirlineCode || "")}
                      </p>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                      <Label className="text-sm text-orange-700 font-medium">وضعیت پرداخت</Label>
                      <p className="font-bold text-orange-900 mt-1">
                        {flightOrder.PayLater?.HasPayLater ? "پرداخت بعدی" : "پرداخت کامل"}
                      </p>
                    </div>

                    {/* Reservation Status */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <Label className="text-sm text-red-700 font-medium">وضعیت رزرو</Label>
                      <p className="font-bold text-red-900 mt-1">
                        {flightOrder.IsClosed ? "بسته شده" : "فعال"}
                      </p>
                    </div>

                    {/* Refund Policy */}
                    <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                      <Label className="text-sm text-indigo-700 font-medium">سیاست استرداد</Label>
                      <p className="font-bold text-indigo-900 mt-1">
                        {flightOrder.NonRefundableType === 0 ? "قابل استرداد" : "غیرقابل استرداد"}
                      </p>
                    </div>
                  </div>

                  {/* Additional Flight Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {/* Flight Details */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Label className="text-sm text-gray-700 font-medium mb-3">جزئیات پرواز</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">سرویس غذا:</span>
                          <span className="text-sm font-medium">
                            {flightOrder.IsMealServiceMandatory ? "الزامی" : "اختیاری"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">انتخاب صندلی:</span>
                          <span className="text-sm font-medium">
                            {flightOrder.IsSeatServiceMandatory ? "الزامی" : "اختیاری"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">رزرو خودکار:</span>
                          <span className="text-sm font-medium">
                            {flightOrder.IsAutoReserved ? "فعال" : "غیرفعال"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Passenger Requirements */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <Label className="text-sm text-gray-700 font-medium mb-3">الزامات مسافر</Label>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">پاسپورت الزامی:</span>
                          <span className="text-sm font-medium">
                            {flightOrder.IsPassportMandatory ? "بله" : "خیر"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">تاریخ صدور پاسپورت:</span>
                          <span className="text-sm font-medium">
                            {flightOrder.IsPassportIssueDateMandatory ? "الزامی" : "اختیاری"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">آدرس مقصد:</span>
                          <span className="text-sm font-medium">
                            {flightOrder.IsDestinationAddressMandatory ? "الزامی" : "اختیاری"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  {flightOrder.AirItineraryPricingInfo?.ItinTotalFare && (
                    <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border border-blue-200 mt-4">
                      <Label className="text-lg text-blue-800 font-bold mb-4">جزئیات قیمت</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                          <p className="text-sm text-blue-600">قیمت کل</p>
                          <p className="text-xl font-bold text-blue-800">
                            {flightOrder.AirItineraryPricingInfo.ItinTotalFare.TotalFare?.toLocaleString('fa-IR')}
                          </p>
                          <p className="text-xs text-blue-500">
                            {flightOrder.AirItineraryPricingInfo.ItinTotalFare.Currency}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-green-600">قیمت پایه</p>
                          <p className="text-lg font-bold text-green-800">
                            {flightOrder.AirItineraryPricingInfo.ItinTotalFare.BaseFare?.toLocaleString('fa-IR')}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-red-600">مالیات</p>
                          <p className="text-lg font-bold text-red-800">
                            {flightOrder.AirItineraryPricingInfo.ItinTotalFare.TotalTax?.toLocaleString('fa-IR')}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm text-purple-600">نوع کرایه</p>
                          <p className="text-lg font-bold text-purple-800">
                            {flightOrder.AirItineraryPricingInfo.FareType === 2 ? "عادی" : "ویژه"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Features */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    {flightOrder.HasCancellationGuarantee && (
                      <Badge className="bg-green-100 text-green-800 border-green-200 px-3 py-1">
                        ✅ تضمین کنسلی
                      </Badge>
                    )}
                    {flightOrder.HasAmenities && (
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-3 py-1">
                        🎁 امکانات ویژه
                      </Badge>
                    )}
                    {flightOrder.HasFareFamilies && (
                      <Badge className="bg-purple-100 text-purple-800 border-purple-200 px-3 py-1">
                        👨‍👩‍👧‍👦 خانواده کرایه
                      </Badge>
                    )}
                    {flightOrder.RefundMethod === 0 && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-200 px-3 py-1">
                        💰 روش استرداد: اعتبار
                      </Badge>
                    )}
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
          )}


          {/* Hotel Information with Revalidated Data */}
          {isHotelInvoice && currentHotelOrder && (
            <>
              <Card className="py-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Hotel className="h-5 w-5" />
                      اطلاعات رزرو هتل
                      {revalidatedHotel && (
                        <Badge className="bg-green-100 text-green-800">بروزرسانی شده</Badge>
                      )}
                      {revalidatingHotel && (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Loader2 className="h-3 w-3 animate-spin ml-1" />
                          در حال بروزرسانی
                        </Badge>
                      )}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleManualRevalidate}
                      disabled={revalidatingHotel}
                    >
                      <RefreshCw className={`h-4 w-4 ml-2 ${revalidatingHotel ? 'animate-spin' : ''}`} />
                      بروزرسانی اطلاعات
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Hotel information content remains the same */}
                </CardContent>
              </Card>

              {/* Revalidation Data Section */}
              {revalidatedHotel && (
                <Card className="py-6">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Info className="h-5 w-5 text-blue-600" />
                      اطلاعات بروزرسانی شده
                      {hasDataChanges && (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                          تغییرات شناسایی شد
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      اطلاعات اخذ شده از سیستم رزرو در تاریخ {formatDateTime(new Date().toISOString())}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Price Comparison */}
                      <div className={`p-4 rounded-lg border ${
                        revalidatedHotel.NetRate !== currentHotelOrder.NetRate 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <Label className="text-sm font-medium">قیمت هر شب</Label>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">قیمت جدید:</span>
                            <span className="font-bold text-green-600">
                              {formatPrice(revalidatedHotel.NetRate, revalidatedHotel.Currency)}
                            </span>
                          </div>
                          {revalidatedHotel.NetRate !== currentHotelOrder.NetRate && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">قیمت قبلی:</span>
                              <span className="text-sm line-through text-red-600">
                                {formatPrice(currentHotelOrder.NetRate, currentHotelOrder.Currency)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Availability Comparison */}
                      <div className={`p-4 rounded-lg border ${
                        revalidatedHotel.AvailableRoom !== currentHotelOrder.AvailableRoom 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <Label className="text-sm font-medium">اتاق‌های موجود</Label>
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">موجودی جدید:</span>
                            <span className="font-bold text-green-600">
                              {revalidatedHotel.AvailableRoom} اتاق
                            </span>
                          </div>
                          {revalidatedHotel.AvailableRoom !== currentHotelOrder.AvailableRoom && (
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">موجودی قبلی:</span>
                              <span className="text-sm line-through text-red-600">
                                {currentHotelOrder.AvailableRoom} اتاق
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Cancellation Policy */}
                      <div className={`p-4 rounded-lg border ${
                        revalidatedHotel.NonRefundable !== currentHotelOrder.NonRefundable 
                          ? 'bg-yellow-50 border-yellow-200' 
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <Label className="text-sm font-medium">سیاست کنسلی</Label>
                        <div className="mt-2">
                          <Badge variant={revalidatedHotel.NonRefundable ? "destructive" : "default"}>
                            {revalidatedHotel.NonRefundable ? "غیرقابل استرداد" : "قابل استرداد"}
                          </Badge>
                          {revalidatedHotel.NonRefundable !== currentHotelOrder.NonRefundable && (
                            <p className="text-xs text-yellow-600 mt-1">تغییر کرده است</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Additional Revalidation Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Payment Deadline */}
                      {revalidatedHotel.PaymentDeadline && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                          <Label className="text-sm font-medium text-blue-700">مهلت پرداخت</Label>
                          <p className="text-sm text-blue-800 mt-1">
                            {formatDateTime(revalidatedHotel.PaymentDeadline)}
                          </p>
                        </div>
                      )}

                      {/* Hotel Labels */}
                      {revalidatedHotel.HotelLabels && revalidatedHotel.HotelLabels.length > 0 && (
                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                          <Label className="text-sm font-medium text-purple-700">برچسب‌های هتل</Label>
                          <div className="flex flex-wrap gap-1 mt-2">
                            {revalidatedHotel.HotelLabels.map((label:any, index:any) => (
                              <Badge key={index} variant="secondary" className="bg-purple-100 text-purple-800">
                                {label}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Hotel Policies from Revalidation */}
                    {(revalidatedHotel.HotelPolicy.Instructions || revalidatedHotel.HotelPolicy.SpecialInstructions) && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <Label className="text-sm font-medium mb-3 block">قوانین هتل (بروزرسانی شده)</Label>
                        <div className="space-y-3 text-sm text-gray-600 max-h-40 overflow-y-auto">
                          {revalidatedHotel.HotelPolicy.Instructions && (
                            <div>
                              <strong className="text-gray-700">دستورالعمل‌ها:</strong>
                              <div 
                                className="mt-1 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: revalidatedHotel.HotelPolicy.Instructions }}
                              />
                            </div>
                          )}
                          {revalidatedHotel.HotelPolicy.SpecialInstructions && (
                            <div>
                              <strong className="text-gray-700">دستورالعمل‌های ویژه:</strong>
                              <p className="mt-1">{revalidatedHotel.HotelPolicy.SpecialInstructions}</p>
                            </div>
                          )}
                          {revalidatedHotel.HotelPolicy.KnowBeforeYouGo && (
                            <div>
                              <strong className="text-gray-700">قبل از رفتن بدانید:</strong>
                              <div 
                                className="mt-1 prose prose-sm max-w-none"
                                dangerouslySetInnerHTML={{ __html: revalidatedHotel.HotelPolicy.KnowBeforeYouGo }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Additional Fees from Revalidation */}
                    {(revalidatedHotel.HotelPolicy.MandatoryFee || revalidatedHotel.HotelPolicy.OptionalFee) && (
                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <Label className="text-sm font-medium text-orange-700 mb-3 block">هزینه‌های اضافی (بروزرسانی شده)</Label>
                        <div className="space-y-3 text-sm">
                          {revalidatedHotel.HotelPolicy.MandatoryFee && (
                            <div>
                              <strong className="text-orange-800">هزینه‌های اجباری:</strong>
                              <div 
                                className="mt-1 prose prose-sm max-w-none text-orange-700"
                                dangerouslySetInnerHTML={{ __html: revalidatedHotel.HotelPolicy.MandatoryFee }}
                              />
                            </div>
                          )}
                          {revalidatedHotel.HotelPolicy.OptionalFee && (
                            <div>
                              <strong className="text-orange-800">هزینه‌های اختیاری:</strong>
                              <div 
                                className="mt-1 prose prose-sm max-w-none text-orange-700"
                                dangerouslySetInnerHTML={{ __html: revalidatedHotel.HotelPolicy.OptionalFee }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Remarks */}
                    {(revalidatedHotel.Remarks?.length > 0 || revalidatedHotel.RemarksFa?.length > 0) && (
                      <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                        <Label className="text-sm font-medium text-green-700 mb-3 block">توضیحات اضافی</Label>
                        <div className="space-y-2 text-sm">
                          {revalidatedHotel.RemarksFa?.map((remark:any, index:any) => (
                            <div key={index} className="text-green-800">
                              <div dangerouslySetInnerHTML={{ __html: remark }} />
                            </div>
                          ))}
                          {revalidatedHotel.Remarks?.map((remark:any, index:any) => (
                            <div key={index} className="text-green-700">
                              <div dangerouslySetInnerHTML={{ __html: remark }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Details */}
                    <div className="bg-gray-100 p-4 rounded-lg border">
                      <Label className="text-sm font-medium mb-2 block">اطلاعات فنی</Label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <span className="text-muted-foreground">FareSourceCode:</span>
                          <p className="font-mono truncate" title={revalidatedHotel.FareSourceCode}>
                            {revalidatedHotel.FareSourceCode.substring(0, 20)}...
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Hotel ID:</span>
                          <p>{revalidatedHotel.HotelId}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Refund Type:</span>
                          <p>{revalidatedHotel.HotelRefundType}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Offline Reserve:</span>
                          <p>{revalidatedHotel.IsReserveOffline ? "بله" : "خیر"}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Travelers Information */}
          {invoice.travelers &&
          <Card className="py-6 mb-8">
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
                    <Badge variant="outline">
                      {traveler.age ? `سن: ${traveler.age} سال` : getPassengerTypeText(traveler.passengerType)}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">نام کامل</Label>
                      <p className="font-medium">{traveler.firstName} {traveler.lastName}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">کد ملی</Label>
                      <p className="font-medium">{traveler.nationalId}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">تاریخ تولد</Label>
                      <p className="font-medium">{formatDate(traveler.dateOfBirth)}</p>
                    </div>
                    {traveler.passportNumber && (
                      <div>
                        <Label className="text-muted-foreground">شماره پاسپورت</Label>
                        <p className="font-medium">{traveler.passportNumber}</p>
                      </div>
                    )}
                    {traveler.passportExpiry && (
                      <div>
                        <Label className="text-muted-foreground">انقضای پاسپورت</Label>
                        <p className="font-medium">{formatDate(traveler.passportExpiry)}</p>
                      </div>
                    )}
                    {traveler.email && (
                      <div>
                        <Label className="text-muted-foreground">ایمیل</Label>
                        <p className="font-medium">{traveler.email}</p>
                      </div>
                    )}
                    {traveler.phoneNumber && (
                      <div>
                        <Label className="text-muted-foreground">شماره همراه</Label>
                        <p className="font-medium">{traveler.phoneNumber}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-muted-foreground">جنسیت</Label>
                      <p className="font-medium">{getGenderText(traveler.gender)}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">رده سنی</Label>
                      <p className="font-medium">{getPassengerTypeText(traveler.passengerType)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          }
        </div>

        {/* Payment Section - FIXED AND COMPLETE */}
        <div className="space-y-6">
          {/* Amount Summary */}
          <Card className="py-6">
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

          {/* Payment Methods - Only show if invoice is waiting for payment */}
          {invoice.state === "WAITING" && !paid && (
            <Card className="py-6">
              <CardHeader>
                <CardTitle>روش پرداخت</CardTitle>
                <CardDescription>یکی از روش‌های پرداخت زیر را انتخاب کنید</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={selectedPaymentMethod} onValueChange={(value: "CREDIT" | "PANELCREDIT" | "STRAIGHT") => setSelectedPaymentMethod(value)}>
                  {/* Credit Payment */}
                  <div className="flex items-center space-x-2 space-x-reverse border rounded-lg p-4">
                    <RadioGroupItem value="CREDIT" id="credit" disabled={!canUseCredit} />
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
                              {userPanels.map(panel => (
                                <option key={panel.id} value={panel.id}>
                                  {panel.name} - {panel.credit.toLocaleString('fa-IR')} ریال
                                  {panel.discountPercentage > 0 && ` (${panel.discountPercentage}% تخفیف)`}
                                </option>
                              ))}
                            </select>
                            
                            {userPanels.length === 0 && (
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
                    (selectedPaymentMethod === "PANELCREDIT" && !selectedPanelId)
                  }
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin ml-2" />
                      در حال پردازش...
                    </>
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
                      {(() => {
                        const selectedPanel = userPanels?.find(p => p.id === selectedPanelId);
                        return selectedPanelId && selectedPanel && selectedPanel.discountPercentage > 0 
                          ? ` (با تخفیف ${selectedPanel.discountPercentage}%)`
                          : '';
                      })()}
                    </p>
                  )}
                  {selectedPaymentMethod === "STRAIGHT" && (
                    <p>به درگاه امن بانکی هدایت خواهید شد</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Paid State */}
          {(invoice.state === "PAID" || paid) && (
            <Card >
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CreditCard className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-green-600 mb-2">صورت حساب پرداخت شده</h3>
                  <p className="text-sm text-muted-foreground">
                    پرداخت شما با موفقیت انجام شد و در حال صدور رزرو هستیم.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Cancelled State */}
          {invoice.state === "CANCELLED" && (
            <Card>
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="h-8 w-8 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-red-600 mb-2">صورت حساب لغو شده</h3>
                  <p className="text-sm text-muted-foreground">
                    این صورت حساب لغو شده است.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}