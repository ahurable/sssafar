// components/tours/booking-form.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Users, Plus, Minus, Calendar, X, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSnack } from "@/hooks/use-notification"

interface BookingFormProps {
  tour: {
    id: string
    title: string
    prices: { 
      id: string
      type: string
      price: number
      currency: string
      date: string
      description?: string 
    }[]
  }
}

interface SelectedPrice {
  priceId: string
  type: string
  price: number
  quantity: number
  date: string
  time: string
}

export function CityProceedToBook({ tour }: BookingFormProps) {
  const router = useRouter()
  const { success, error } = useSnack()
  const [selectedPrices, setSelectedPrices] = useState<SelectedPrice[]>([])
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    nationalId: '',
    description: ''
  })
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  // Get unique available dates from prices
  const availableDates = [...new Set(tour.prices.map(price => 
    new Date(price.date).toLocaleDateString('fa-IR')
  ))]

  // Get available times for selected date
  const availableTimes = selectedDate ? 
    [...new Set(tour.prices
      .filter(price => new Date(price.date).toLocaleDateString('fa-IR') === selectedDate)
      .map(price => new Date(price.date).toLocaleTimeString('fa-IR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }))
    )] : []

  // Filter prices by selected date and time
  const filteredPrices = tour.prices.filter(price => {
    const priceDate = new Date(price.date).toLocaleDateString('fa-IR')
    const priceTime = new Date(price.date).toLocaleTimeString('fa-IR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    return priceDate === selectedDate && priceTime === selectedTime
  })

  const getPriceTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      ADULT: 'بزرگسال',
      CHILD: 'کودک',
      INFANT: 'نوزاد',
      STUDENT: 'دانشجو',
      SENIOR: 'سالمند',
      بزرگسال: 'بزرگسال',
      کودک: 'کودک',
      نوزاد: 'نوزاد',
      دانشجو: 'دانشجو',
      سالمند: 'سالمند'
    }
    return labels[type] || type
  }

  const handlePriceSelect = (priceId: string, type: string, price: number) => {
    const existing = selectedPrices.find(sp => sp.priceId === priceId)
    
    if (existing) {
      setSelectedPrices(selectedPrices.filter(sp => sp.priceId !== priceId))
    } else {
      setSelectedPrices([...selectedPrices, { 
        priceId, 
        type, 
        price, 
        quantity: 1, 
        date: selectedDate,
        time: selectedTime
      }])
    }
  }

  const updateQuantity = (priceId: string, newQuantity: number) => {
    if (newQuantity < 1) return
    
    const selectedPrice = selectedPrices.find(sp => sp.priceId === priceId)
    if (!selectedPrice) return

    // Validate child count doesn't exceed adult count
    if (selectedPrice.type === 'CHILD' || selectedPrice.type === 'کودک') {
      const adultCount = selectedPrices
        .filter(sp => (sp.type === 'ADULT' || sp.type === 'بزرگسال') && sp.date === selectedPrice.date)
        .reduce((sum, sp) => sum + sp.quantity, 0)
      
      if (newQuantity > adultCount) {
        alert("تعداد کودکان نمی‌تواند بیشتر از تعداد بزرگسالان باشد")
        return
      }
    }

    setSelectedPrices(selectedPrices.map(sp => 
      sp.priceId === priceId ? { ...sp, quantity: newQuantity } : sp
    ))
  }

  const calculateTotal = () => {
    return selectedPrices.reduce((total, sp) => total + (sp.price * sp.quantity), 0)
  }

  const getTotalPassengers = () => {
    return selectedPrices.reduce((total, sp) => total + sp.quantity, 0)
  }

  const getAdultCount = () => {
    return selectedPrices
      .filter(sp => sp.type === 'ADULT' || sp.type === 'بزرگسال')
      .reduce((sum, sp) => sum + sp.quantity, 0)
  }

  const handleProceedToBooking = async () => {
    if (!selectedDate || !selectedTime) {
      alert("لطفا تاریخ و زمان را انتخاب کنید")
      return
    }

    if (selectedPrices.length === 0) {
      alert("لطفا حداقل یک نوع قیمت را انتخاب کنید")
      return
    }

    if (!contactInfo.firstName || !contactInfo.lastName || !contactInfo.phoneNumber) {
      alert("لطفا اطلاعات تماس را کامل کنید")
      return
    }

    setLoading(true)

    try {
      // Prepare travelers data for invoice
      const travelers = selectedPrices.flatMap(price => 
        Array.from({ length: price.quantity }, (_, index) => ({
          firstName: contactInfo.firstName,
          lastName: contactInfo.lastName,
          phoneNumber: contactInfo.phoneNumber,
          email: contactInfo.email || "",
          nationalId: contactInfo.nationalId || "",
          passengerType: price.type,
          description: contactInfo.description
        }))
      )

      // Prepare order data for invoice
      const order = {
        tourId: tour.id,
        tourTitle: tour.title,
        selectedDate: selectedDate,
        selectedTime: selectedTime,
        selectedPrices: selectedPrices,
        totalAmount: calculateTotal(),
        totalPassengers: getTotalPassengers()
      }

      // Create invoice
      const response = await fetch('/api/invoice/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          kind: "ACTIVITY",
          amount: calculateTotal(),
          travelers: travelers,
          order: order
        }),
      })

      const data = await response.json()

      if (response.ok) {
        success("صورت حساب با موفقیت ایجاد شد")
        // Redirect to invoice page
        router.push(`/invoice/${data.invoiceId}`)
        setIsModalOpen(false)
      } else {
        error(data.error || "خطا در ایجاد صورت حساب")
      }
    } catch (err) {
      console.error('Error creating invoice:', err)
      error("خطا در ایجاد صورت حساب")
    } finally {
      setLoading(false)
    }
  }

  const BookingFormContent = () => (
    <div className="space-y-6">
      {/* Date and Time Selection */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-blue-900">انتخاب تاریخ و زمان</Label>
        
        {/* Date Selection */}
        <div>
          <Label className="text-blue-900 mb-2">تاریخ *</Label>
          <div className="grid grid-cols-2 gap-2">
            {availableDates.map((date) => (
              <Button
                key={date}
                type="button"
                variant={selectedDate === date ? "default" : "outline"}
                className={`border border-gray-300 ${
                  selectedDate === date 
                    ? 'bg-blue-900 text-white' 
                    : 'bg-white text-blue-900 hover:bg-blue-50'
                }`}
                onClick={() => {
                  setSelectedDate(date)
                  setSelectedTime("")
                  setSelectedPrices([])
                }}
              >
                <Calendar className="h-4 w-4 ml-2" />
                {date}
              </Button>
            ))}
          </div>
        </div>

        {/* Time Selection */}
        {selectedDate && (
          <div>
            <Label className="text-blue-900 mb-2">زمان *</Label>
            <div className="grid grid-cols-3 gap-2">
              {availableTimes.map((time) => (
                <Button
                  key={time}
                  type="button"
                  variant={selectedTime === time ? "default" : "outline"}
                  className={`border border-gray-300 ${
                    selectedTime === time 
                      ? 'bg-blue-900 text-white' 
                      : 'bg-white text-blue-900 hover:bg-blue-50'
                  }`}
                  onClick={() => {
                    setSelectedTime(time)
                    setSelectedPrices([])
                  }}
                >
                  <Clock className="h-4 w-4 ml-2" />
                  {time}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Price Selection */}
      {selectedDate && selectedTime && (
        <div className="space-y-4">
          <Label className="text-lg font-semibold text-blue-900">انتخاب نوع مسافران</Label>
          
          <div className="space-y-3">
            {filteredPrices.map((price) => (
              <div key={price.id} className="flex items-center justify-between p-3 border border-gray-300">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedPrices.some(sp => sp.priceId === price.id)}
                    onCheckedChange={() => handlePriceSelect(price.id, price.type, price.price)}
                    disabled={
                      (price.type === 'CHILD' || price.type === 'کودک') && 
                      getAdultCount() === 0
                    }
                  />
                  <div>
                    <div className="font-medium text-gray-900">
                      {getPriceTypeLabel(price.type)}
                      {(price.type === 'CHILD' || price.type === 'کودک') && getAdultCount() === 0 && (
                        <span className="text-xs text-red-600 mr-2">(نیاز به بزرگسال)</span>
                      )}
                    </div>
                    {price.description && (
                      <div className="text-sm text-gray-600">{price.description}</div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-lg font-bold text-green-700">
                    {price.price.toLocaleString('fa-IR')} تومان
                  </div>
                  
                  {selectedPrices.some(sp => sp.priceId === price.id) && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-blue-900 text-blue-900"
                        onClick={() => updateQuantity(price.id, selectedPrices.find(sp => sp.priceId === price.id)!.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      
                      <span className="w-8 text-center font-medium">
                        {selectedPrices.find(sp => sp.priceId === price.id)?.quantity}
                      </span>
                      
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0 border-blue-900 text-blue-900"
                        onClick={() => updateQuantity(price.id, selectedPrices.find(sp => sp.priceId === price.id)!.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Prices Summary */}
      {selectedPrices.length > 0 && (
        <Card className="border py-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-900 font-semibold">تعداد مسافران:</span>
                <Badge variant="secondary" className="bg-blue-900 text-white">
                  <Users className="h-3 w-3 ml-1" />
                  {getTotalPassengers()} نفر
                </Badge>
              </div>
              
              <div className="text-sm text-blue-900 font-medium">
                تاریخ: {selectedDate} - ساعت: {selectedTime}
              </div>
              
              {selectedPrices.map((sp) => (
                <div key={sp.priceId} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {getPriceTypeLabel(sp.type)} ({sp.quantity} نفر)
                  </span>
                  <span className="font-medium">
                    {(sp.price * sp.quantity).toLocaleString('fa-IR')} تومان
                  </span>
                </div>
              ))}
              
              <div className="border-t border-blue-200 pt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span className="text-blue-900">جمع کل:</span>
                  <span className="text-green-700">{calculateTotal().toLocaleString('fa-IR')} تومان</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <div className="space-y-4">
        <Label className="text-lg font-semibold text-blue-900">اطلاعات تماس</Label>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">نام *</Label>
            <Input
              id="firstName"
              value={contactInfo.firstName}
              onChange={(e) => setContactInfo({ ...contactInfo, firstName: e.target.value })}
              placeholder="نام خود را وارد کنید"
              className="border-gray-300"
            />
          </div>
          
          <div>
            <Label htmlFor="lastName">نام خانوادگی *</Label>
            <Input
              id="lastName"
              value={contactInfo.lastName}
              onChange={(e) => setContactInfo({ ...contactInfo, lastName: e.target.value })}
              placeholder="نام خانوادگی خود را وارد کنید"
              className="border-gray-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="phoneNumber">شماره تماس *</Label>
            <Input
              id="phoneNumber"
              type="tel"
              value={contactInfo.phoneNumber}
              onChange={(e) => setContactInfo({ ...contactInfo, phoneNumber: e.target.value })}
              placeholder="09xxxxxxxxx"
              className="border-gray-300"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="nationalId">کد ملی</Label>
          <Input
            id="nationalId"
            value={contactInfo.nationalId}
            onChange={(e) => setContactInfo({ ...contactInfo, nationalId: e.target.value })}
            placeholder="کد ملی خود را وارد کنید"
            className="border-gray-300"
          />
        </div>

        <div>
          <Label htmlFor="description">توضیحات (اختیاری)</Label>
          <Input
            id="description"
            value={contactInfo.description}
            onChange={(e) => setContactInfo({ ...contactInfo, description: e.target.value })}
            placeholder="درخواست‌های خاص یا توضیحات اضافی"
            className="border-gray-300"
          />
        </div>
      </div>

      {/* Proceed Button */}
      <Button 
        onClick={handleProceedToBooking}
        className="w-full bg-blue-900 hover:bg-blue-800 text-white text-lg py-6"
        size="lg"
        disabled={selectedPrices.length === 0 || loading}
      >
        {loading ? "در حال ایجاد صورت حساب..." : 
         selectedPrices.length === 0 ? 'لطفا نوع مسافر را انتخاب کنید' : 'ادامه فرآیند رزرو'}
      </Button>

      <p className="text-xs text-gray-600 text-center">
        پس از ادامه، به صفحه صورت حساب هدایت خواهید شد.
      </p>
    </div>
  )

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block">
        <Card className="sticky py-6 top-4 border border-gray-300">
          <CardHeader className="border-b border-gray-300">
            <CardTitle className="text-xl text-blue-900">رزرو گشت شهری</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <BookingFormContent />
          </CardContent>
        </Card>
      </div>

      {/* Mobile View - Modal */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="w-full bg-blue-900 hover:bg-blue-800 text-white text-lg py-6 rounded-none">
              رزرو این گشت
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-none h-screen w-screen m-0 p-0 border-0 bg-[#fffefe]">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-white">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-600"
                >
                  <X className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold text-blue-900">رزرو گشت شهری</h2>
                <div className="w-9"></div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <BookingFormContent />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}