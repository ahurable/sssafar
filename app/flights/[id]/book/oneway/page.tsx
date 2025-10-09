"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, User, Users, Plane, MapPin, Search, Plus, User2, Trash2, AlertCircle, FileText, Shield, Clock } from "lucide-react"
import DatePicker from "react-multi-date-picker"
import type { DateObject } from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Enhanced Traveler Form Component
function TravelerForm({ onTravelerAdded, existingTravelers = [], selectedTravelers = [], onTravelerSelect, onTravelerRemove }) {
  const [showForm, setShowForm] = useState(false)
  const [newTraveler, setNewTraveler] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    dateOfBirth: "",
  })
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

  const validateTraveler = (traveler: any) => {
    const errors: Record<string, string> = {}

    if (!traveler.firstName.trim()) {
      errors.firstName = "نام الزامی است"
    } else if (traveler.firstName.trim().length < 2) {
      errors.firstName = "نام باید حداقل ۲ حرف باشد"
    }

    if (!traveler.lastName.trim()) {
      errors.lastName = "نام خانوادگی الزامی است"
    } else if (traveler.lastName.trim().length < 2) {
      errors.lastName = "نام خانوادگی باید حداقل ۲ حرف باشد"
    }

    if (!traveler.nationalId.trim()) {
      errors.nationalId = "کد ملی الزامی است"
    } else if (!/^\d{10}$/.test(traveler.nationalId)) {
      errors.nationalId = "کد ملی باید ۱۰ رقم باشد"
    }

    // Check for duplicate national ID
    const isDuplicate = selectedTravelers.some(t => t.nationalId === traveler.nationalId) || 
                       existingTravelers.some(t => t.nationalId === traveler.nationalId)
    if (isDuplicate) {
      errors.nationalId = "این کد ملی قبلاً ثبت شده است"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddTraveler = () => {
    if (validateTraveler(newTraveler)) {
      const traveler = {
        id: Date.now().toString(),
        ...newTraveler,
        age: calculateAge(newTraveler.dateOfBirth)
      }
      onTravelerAdded(traveler)
      setNewTraveler({ firstName: "", lastName: "", nationalId: "", dateOfBirth: "" })
      setShowForm(false)
      setFormErrors({})
    }
  }

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  const isTravelerSelected = (travelerId: string) => {
    return selectedTravelers.some(t => t.id === travelerId)
  }

  const canAddMoreTravelers = selectedTravelers.length < 9

  return (
    <div className="space-y-6">
      {/* Selected Travelers */}
      {selectedTravelers.length > 0 && (
        <div className="space-y-3">
          <Label>مسافران انتخاب شده ({selectedTravelers.length}/9)</Label>
          {selectedTravelers.map(traveler => (
            <div key={traveler.id} className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">{traveler.firstName} {traveler.lastName}</p>
                  <p className="text-sm text-muted-foreground">کد ملی: {traveler.nationalId} • سن: {traveler.age} سال</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTravelerRemove(traveler.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Existing Travelers */}
      {existingTravelers.length > 0 && canAddMoreTravelers && (
        <div className="space-y-3">
          <Label>مسافران ثبت شده</Label>
          {existingTravelers.map(traveler => (
            <div key={traveler.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <User2 className="h-4 w-4 text-blue-800" />
                <div>
                  <p className="font-medium">{traveler.firstName} {traveler.lastName}</p>
                  <p className="text-sm text-muted-foreground">کد ملی: {traveler.nationalId} • سن: {traveler.age} سال</p>
                </div>
              </div>
              <Button 
                variant={isTravelerSelected(traveler.id) ? "default" : "outline"} 
                size="sm"
                onClick={() => onTravelerSelect(traveler)}
                disabled={isTravelerSelected(traveler.id) || !canAddMoreTravelers}
              >
                {isTravelerSelected(traveler.id) ? "انتخاب شده" : "انتخاب"}
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add New Traveler Form */}
      {canAddMoreTravelers && (
        <>
          {!showForm ? (
            <Button 
              type="button" 
              variant="outline" 
              className="w-full"
              onClick={() => setShowForm(true)}
            >
              <Plus className="ml-2 h-4 w-4" />
              افزودن مسافر جدید
            </Button>
          ) : (
            <Card>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>نام</Label>
                      <Input
                        value={newTraveler.firstName}
                        onChange={(e) => setNewTraveler(prev => ({ ...prev, firstName: e.target.value }))}
                        placeholder="نام"
                        className={formErrors.firstName ? "border-red-500" : ""}
                      />
                      {formErrors.firstName && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.firstName}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>نام خانوادگی</Label>
                      <Input
                        value={newTraveler.lastName}
                        onChange={(e) => setNewTraveler(prev => ({ ...prev, lastName: e.target.value }))}
                        placeholder="نام خانوادگی"
                        className={formErrors.lastName ? "border-red-500" : ""}
                      />
                      {formErrors.lastName && (
                        <p className="text-red-500 text-xs flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {formErrors.lastName}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>کد ملی</Label>
                    <Input
                      value={newTraveler.nationalId}
                      onChange={(e) => setNewTraveler(prev => ({ ...prev, nationalId: e.target.value }))}
                      placeholder="کد ملی"
                      maxLength={10}
                      className={formErrors.nationalId ? "border-red-500" : ""}
                    />
                    {formErrors.nationalId && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.nationalId}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddTraveler} className="flex-1">
                      افزودن مسافر
                    </Button>
                    <Button variant="outline" onClick={() => {
                      setShowForm(false)
                      setFormErrors({})
                    }}>
                      انصراف
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!canAddMoreTravelers && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 text-sm text-center">
            شما حداکثر تعداد مجاز مسافر (۹ نفر) را انتخاب کرده‌اید
          </p>
        </div>
      )}
    </div>
  )
}

export default function OneWayReservation() {
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    departureDate: "",
    travelers: 1,
    class: "economy"
  })
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null)
  const [existingTravelers, setExistingTravelers] = useState([])
  const [selectedTravelers, setSelectedTravelers] = useState([])
  const [loading, setLoading] = useState(false)

  // Mock flight data - in real app, this would come from props or route params
  const flightDetails = {
    airline: "ایران ایر",
    flightNumber: "IR101",
    from: "تهران (THR)",
    to: "مشهد (MHD)",
    departureTime: "08:00",
    arrivalTime: "09:30",
    date: "۱۴۰۲/۱۰/۱۵",
    duration: "۱ ساعت و ۳۰ دقیقه",
    class: "اکونومی",
    price: 1500000,
    aircraft: "بوئینگ ۷۳۷",
    capacity: 180
  }

  // Load existing travelers
  useEffect(() => {
    const loadTravelers = async () => {
      try {
        const response = await fetch("/api/travelers")
        const data = await response.json()
        if (data.travelers) {
          setExistingTravelers(data.travelers)
        }
      } catch (error) {
        console.error("Error loading travelers:", error)
      }
    }
    loadTravelers()
  }, [])

  const handleDateChange = (date: DateObject | null) => {
    setSelectedDate(date)
    if (date) {
      const gregorianDate = date.convert(persian, "gregorian")
      setFormData(prev => ({
        ...prev,
        departureDate: gregorianDate.toDate().toISOString().split('T')[0]
      }))
    }
  }

  const handleTravelerAdded = (traveler) => {
    if (selectedTravelers.length < 9) {
      setSelectedTravelers(prev => [...prev, traveler])
    }
  }

  const handleTravelerSelect = (traveler) => {
    if (selectedTravelers.length < 9) {
      setSelectedTravelers(prev => [...prev, traveler])
    }
  }

  const handleTravelerRemove = (travelerId) => {
    setSelectedTravelers(prev => prev.filter(t => t.id !== travelerId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (selectedTravelers.length === 0) {
      alert("لطفاً حداقل یک مسافر انتخاب کنید")
      return
    }

    setLoading(true)

    // Prepare data for API
    const reservationData = {
      type: "one-way",
      ...formData,
      travelers: selectedTravelers,
      flightDetails: flightDetails
    }

    try {
      const response = await fetch("/api/flights/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reservationData)
      })

      if (response.ok) {
        const result = await response.json()
        // Navigate to payment page or show success
        console.log("Booking successful:", result)
      } else {
        const error = await response.json()
        alert(error.error || "خطا در رزرو پرواز")
      }
    } catch (error) {
      console.error("Error booking flight:", error)
      alert("خطا در برقراری ارتباط با سرور")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">تکمیل اطلاعات رزرو</h1>
            <p className="text-gray-50">اطلاعات مسافران و جزئیات پرواز را بررسی کنید</p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Section - Flight Details & Rules */}
            <div className="space-y-6">
              {/* Flight Summary */}
              <Card className="">
                <CardHeader className=" text-blue-800">
                  <CardTitle className="flex items-center gap-2">
                    <Plane className="h-6 w-6" />
                    خلاصه پرواز
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
                          <Plane className="h-6 w-6 text-blue-800" />
                        </div>
                        <div>
                          <h3 className="font-bold">{flightDetails.airline}</h3>
                          <p className="text-sm text-muted-foreground">شماره پرواز: {flightDetails.flightNumber}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-800">
                          {flightDetails.price.toLocaleString("fa-IR")} <span className="text-sm font-normal">تومان</span>
                        </p>
                        <p className="text-sm text-muted-foreground">هر نفر</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 items-center pt-4 border-t">
                      <div className="text-center">
                        <p className="text-xl font-bold">{flightDetails.departureTime}</p>
                        <p className="text-sm text-muted-foreground">{flightDetails.from}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-2 mb-1">
                          <div className="h-px flex-1 bg-border" />
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <div className="h-px flex-1 bg-border" />
                        </div>
                        <p className="text-xs text-muted-foreground">{flightDetails.duration}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-xl font-bold">{flightDetails.arrivalTime}</p>
                        <p className="text-sm text-muted-foreground">{flightDetails.to}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-sm text-muted-foreground">تاریخ پرواز</p>
                        <p className="font-medium">{flightDetails.date}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">کلاس</p>
                        <p className="font-medium">{flightDetails.class}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">هواپیما</p>
                        <p className="font-medium">{flightDetails.aircraft}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ظرفیت</p>
                        <p className="font-medium">{flightDetails.capacity} صندلی</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Flight Rules & Policies */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    قوانین و مقررات
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-800" />
                      شرایط استرداد
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-800">•</span>
                        استرداد تا ۲۴ ساعت قبل از پرواز: ۹۰٪ مبلغ برگشت داده می‌شود
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-800">•</span>
                        استرداد تا ۱۲ ساعت قبل از پرواز: ۷۰٪ مبلغ برگشت داده می‌شود
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-800">•</span>
                        استرداد تا ۶ ساعت قبل از پرواز: ۵۰٪ مبلغ برگشت داده می‌شود
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        کمتر از ۶ ساعت تا پرواز: امکان استرداد وجود ندارد
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Clock className="h-4 w-4 text-blue-600" />
                      شرایط تغییر پرواز
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        تغییر پرواز تا ۴۸ ساعت قبل: رایگان
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-600">•</span>
                        تغییر پرواز تا ۲۴ ساعت قبل: ۱۰٪ هزینه تغییر
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-red-600">•</span>
                        کمتر از ۲۴ ساعت: امکان تغییر وجود ندارد
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <User className="h-4 w-4 text-blue-800" />
                      مدارک لازم
                    </h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-start gap-2">
                        <span className="text-blue-800">•</span>
                        کارت ملی یا شناسنامه برای پروازهای داخلی
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-800">•</span>
                        حضور در فرودگاه حداقل ۲ ساعت قبل از پرواز
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-blue-800">•</span>
                        همراه داشتن بلیط الکترونیکی یا چاپ شده
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Section - Traveler Information */}
            <div className="space-y-6">
              <Card className="">
                <CardHeader className="text-green-600">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-6 w-6" />
                    اطلاعات مسافران
                  </CardTitle>
                  <CardDescription className="">
                    مسافران خود را انتخاب یا اضافه کنید (حداکثر ۹ نفر)
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <TravelerForm 
                    onTravelerAdded={handleTravelerAdded}
                    onTravelerSelect={handleTravelerSelect}
                    onTravelerRemove={handleTravelerRemove}
                    existingTravelers={existingTravelers}
                    selectedTravelers={selectedTravelers}
                  />
                </CardContent>
              </Card>

              {/* Booking Summary */}
              {selectedTravelers.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>خلاصه رزرو</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>تعداد مسافران:</span>
                      <span className="font-medium">{selectedTravelers.length} نفر</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>قیمت هر بلیط:</span>
                      <span className="font-medium">{flightDetails.price.toLocaleString("fa-IR")} تومان</span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-3">
                      <span>مبلغ قابل پرداخت:</span>
                      <span className="text-blue-800">{(flightDetails.price * selectedTravelers.length).toLocaleString("fa-IR")} تومان</span>
                    </div>
                    
                    <Button 
                      onClick={handleSubmit}
                      className="w-full bg-blue-800 hover:bg-blue-700 h-12 text-lg mt-4"
                      disabled={loading}
                    >
                      {loading ? "در حال پردازش..." : "تایید و پرداخت"}
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}