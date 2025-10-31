"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { User, Calendar, Plus, Trash2, Save, AlertCircle, User2, FileText } from "lucide-react"
import DatePicker from "react-multi-date-picker"
import type { DateObject } from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import { cn } from "@/lib/utils"

export interface TravelerData {
  id: string
  firstName: string
  lastName: string
  nationalId: string
  dateOfBirth: string
  passportNumber?: string
  passportExpiry?: string
  age?: number
  email?: string
  phoneNumber?: string
  gender: string
  passengerType: string
}

interface TravelerFormProps {
  existingTravelers?: TravelerData[]
  selectedTravelers?: TravelerData[]
  onTravelerSelect?: (traveler: TravelerData) => void
  onTravelerRemove?: (travelerId: string) => void
  onTravelerAdded?: (traveler: TravelerData) => void
  onSave?: (travelers: TravelerData[]) => void
  readOnly?: boolean
  maxTravelers?: number
  mode?: "booking" | "dashboard"
  area?: string
}

export function TravelerForm({ 
  existingTravelers = [], 
  selectedTravelers = [], 
  onTravelerSelect,
  onTravelerRemove,
  onTravelerAdded,
  onSave,
  readOnly = false,
  maxTravelers = 9,
  mode = "booking",
  area = "intl",
}: TravelerFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [showForm, setShowForm] = useState(false)
  
  const [allExistingTravelers, setAllExistingTravelers] = useState<TravelerData[]>([])
  const [newTravelers, setNewTravelers] = useState<TravelerData[]>([])

  const [newTraveler, setNewTraveler] = useState<Omit<TravelerData, 'id'>>({
    firstName: "",
    lastName: "",
    nationalId: "",
    dateOfBirth: "",
    passportNumber: "",
    passportExpiry: "",
    phoneNumber: "",
    email: "",
    gender: "",
    passengerType: ""
  })
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null)
  const [selectedPassportExpiry, setSelectedPassportExpiry] = useState<DateObject | null>(null)

  useEffect(() => {
    const loadTravelersData = async () => {
      try {
        if (existingTravelers.length > 0) {
          setAllExistingTravelers(existingTravelers)
        } else if (mode === "dashboard") {
          const response = await fetch("/api/travelers")
          const data = await response.json()
          console.log(data)
          if (data.travelers && data.travelers.length > 0) {
            setAllExistingTravelers(data.travelers)
          }
        }
      } catch (err) {
        console.error("Error loading travelers data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadTravelersData()
  }, [existingTravelers, mode])

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

  const isPassportExpired = (expiryDate: string): boolean => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }

  const validateTraveler = (traveler: Omit<TravelerData, 'id'>): boolean => {
    const errors: Record<string, string> = {}

    if (!traveler.firstName.trim()) {
      errors.firstName = "نام مسافر الزامی است"
    } else if (traveler.firstName.trim().length < 2) {
      errors.firstName = "نام باید حداقل ۲ حرف باشد"
    }

    if (!traveler.lastName.trim()) {
      errors.lastName = "نام خانوادگی مسافر الزامی است"
    } else if (traveler.lastName.trim().length < 2) {
      errors.lastName = "نام خانوادگی باید حداقل ۲ حرف باشد"
    }

    if (!traveler.nationalId.trim()) {
      errors.nationalId = "کد ملی مسافر الزامی است"
    } else if (!/^\d{10}$/.test(traveler.nationalId)) {
      errors.nationalId = "کد ملی باید ۱۰ رقم باشد"
    }

    const isDuplicate = allExistingTravelers.some(t => t.nationalId === traveler.nationalId) ||
                       newTravelers.some(t => t.nationalId === traveler.nationalId) ||
                       selectedTravelers.some(t => t.nationalId === traveler.nationalId)
    if (isDuplicate) {
      errors.nationalId = "این کد ملی قبلاً ثبت شده است"
    }

    if (traveler.passportNumber && traveler.passportNumber.trim().length < 5) {
      errors.passportNumber = "شماره پاسپورت باید حداقل ۵ کاراکتر باشد"
    }

    if (!selectedDate) {
      errors.dateOfBirth = "تاریخ تولد مسافر الزامی است"
    }

    if (traveler.passportExpiry && isPassportExpired(traveler.passportExpiry)) {
      errors.passportExpiry = "پاسپورت منقضی شده است"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddTraveler = () => {
    if (readOnly) return

    if (!validateTraveler(newTraveler)) {
      setError("لطفا اطلاعات مسافر را به درستی تکمیل کنید")
      return
    }

    const travelerWithAge = {
      ...newTraveler,
      id: Date.now().toString(),
      age: calculateAge(newTraveler.dateOfBirth)
    }

    if (mode === "booking") {
      if (onTravelerAdded) {
        console.log(travelerWithAge)
        onTravelerAdded(travelerWithAge)
      }
    } else {
      console.log(travelerWithAge)
      setNewTravelers(prev => [...prev, travelerWithAge])
    }

    setNewTraveler({
      firstName: "",
      lastName: "",
      nationalId: "",
      dateOfBirth: "",
      passportNumber: "",
      passportExpiry: "",
      phoneNumber: "",
      email: "",
      gender: "",
      passengerType: ""
    })
    setSelectedDate(null)
    setSelectedPassportExpiry(null)
    setFormErrors({})
    setError("")
    setShowForm(false)
  }

  const handleRemoveNewTraveler = (id: string) => {
    if (readOnly) return
    setNewTravelers(prev => prev.filter(traveler => traveler.id !== id))
  }

  const handleNewTravelerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return
    
    const { name, value } = e.target
    
    setNewTraveler(prev => ({
      ...prev,
      [name]: value,
    }))

    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const handleDateChange = (date: DateObject | null) => {
    if (readOnly) return
    
    setSelectedDate(date)
    
    let dateOfBirth = ""
    if (date) {
      const gregorianDate = date.convert(persian, "gregorian")
      dateOfBirth = gregorianDate.toDate().toISOString().split('T')[0]
    }

    setNewTraveler(prev => ({
      ...prev,
      dateOfBirth
    }))

    if (formErrors.dateOfBirth) {
      setFormErrors(prev => ({
        ...prev,
        dateOfBirth: ""
      }))
    }
  }

  const handlePassportExpiryChange = (date: DateObject | null) => {
    if (readOnly) return
    
    setSelectedPassportExpiry(date)
    
    let passportExpiry = ""
    if (date) {
      const gregorianDate = date.convert(persian, "gregorian")
      passportExpiry = gregorianDate.toDate().toISOString().split('T')[0]
    }

    setNewTraveler(prev => ({
      ...prev,
      passportExpiry
    }))

    if (formErrors.passportExpiry) {
      setFormErrors(prev => ({
        ...prev,
        passportExpiry: ""
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (readOnly) {
      setError("این فرم فقط برای مشاهده است")
      return
    }

    if (newTravelers.length === 0) {
      setError("لطفا حداقل یک مسافر جدید اضافه کنید")
      return
    }

    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/travelers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ travelers: newTravelers }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setAllExistingTravelers(prev => [...prev, ...newTravelers])
        setNewTravelers([])
        if (onSave) {
          onSave(newTravelers)
        }
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || "خطا در ذخیره اطلاعات مسافران")
      }
    } catch (err) {
      console.error("Error saving travelers data:", err)
      setError("خطا در برقراری ارتباط با سرور")
    } finally {
      setSaving(false)
    }
  }

  const isNewTravelerValid = () => {
    const basicValidation = newTraveler.firstName.trim().length >= 2 && 
           newTraveler.lastName.trim().length >= 2 && 
           /^\d{10}$/.test(newTraveler.nationalId) && 
           selectedDate !== null

    const isDuplicate = allExistingTravelers.some(t => t.nationalId === newTraveler.nationalId) ||
                       newTravelers.some(t => t.nationalId === newTraveler.nationalId) ||
                       selectedTravelers.some(t => t.nationalId === newTraveler.nationalId)

    const passportValidation = 
      (!newTraveler.passportNumber || newTraveler.passportNumber.trim().length >= 5) &&
      (!newTraveler.passportExpiry || !isPassportExpired(newTraveler.passportExpiry))

    return basicValidation && !isDuplicate && passportValidation
  }

  const isTravelerSelected = (travelerId: string) => {
    return selectedTravelers.some(t => t.id === travelerId)
  }

  const canAddMoreTravelers = selectedTravelers.length < maxTravelers

  if (loading && mode === "dashboard") {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">در حال بارگذاری اطلاعات مسافران...</div>
        </CardContent>
      </Card>
    )
  }

  // Booking Mode Layout
  if (mode === "booking") {
  return (
    <div className="space-y-6">
      {/* Selected Travelers */}
      {selectedTravelers.length > 0 && (
        <div className="space-y-3">
          <Label>مسافران انتخاب شده ({selectedTravelers.length}/{maxTravelers})</Label>
          {selectedTravelers.map(traveler => (
            <div key={traveler.id} className="flex items-center justify-between p-3 border border-green-200 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <User2 className="h-4 w-4 text-green-600" />
                <div>
                  <p className="font-medium">{traveler.firstName} {traveler.lastName}</p>
                  <p className="text-sm text-muted-foreground">
                    کد ملی: {traveler.nationalId} • سن: {traveler.age} سال
                    {traveler.passportNumber && ` • پاسپورت: ${traveler.passportNumber}`}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTravelerRemove?.(traveler.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Existing Travelers Section */}
      {allExistingTravelers.length > 0 && canAddMoreTravelers && (
        <div className="space-y-4">
          <h3 className="font-medium text-lg">مسافران ثبت شده ({allExistingTravelers.length})</h3>
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-700 text-sm">
              این مسافران قبلاً در سیستم ثبت شده‌اند. برای اضافه کردن به سفر، روی دکمه انتخاب کلیک کنید.
            </p>
          </div>
          {allExistingTravelers.map(traveler => (
            <div key={traveler.id} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <User2 className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium">
                    {traveler.firstName} {traveler.lastName}
                  </h4>
                  <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                    <div>کد ملی: {traveler.nationalId}</div>
                    <div>سن: {traveler.age} سال</div>
                    <div>پاسپورت: {traveler.passportNumber || 'ثبت نشده'}</div>
                    <div className={traveler.passportExpiry ? (isPassportExpired(traveler.passportExpiry) ? 'text-red-500' : 'text-green-600') : 'text-gray-500'}>
                      انقضا: {traveler.passportExpiry ? new Date(traveler.passportExpiry).toLocaleDateString('fa-IR') : 'ثبت نشده'}
                      {traveler.passportExpiry && isPassportExpired(traveler.passportExpiry) && ' (منقضی)'}
                    </div>
                  </div>
                </div>
              </div>
              <Button 
                variant={isTravelerSelected(traveler.id) ? "default" : "outline"} 
                size="sm"
                onClick={() => onTravelerSelect?.(traveler)}
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
        <div className="space-y-4">
          <h3 className="font-medium text-lg">افزودن مسافر جدید</h3>
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
                        onChange={handleNewTravelerChange}
                        name="firstName"
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
                        onChange={handleNewTravelerChange}
                        name="lastName"
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
                      onChange={handleNewTravelerChange}
                      name="nationalId"
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

                  {/* Passport Number */}
                  { area == "intl" &&
                  <div className="space-y-2">
                    <Label>شماره پاسپورت</Label>
                    <div className="relative">
                      <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={newTraveler.passportNumber}
                        onChange={handleNewTravelerChange}
                        name="passportNumber"
                        placeholder="شماره پاسپورت"
                        className={formErrors.passportNumber ? "border-red-500" : ""}
                      />
                    </div>
                    {formErrors.passportNumber && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.passportNumber}
                      </p>
                    )}
                  </div>
                  }

                  <div className="space-y-2">
                    <Label>ایمیل (اختیاری)</Label>
                    <div className="relative">
                      <Input
                        value={newTraveler.email}
                        onChange={handleNewTravelerChange}
                        name="email"
                        placeholder="آدرس ایمیل"
                        className={formErrors.email ? "border-red-500" : ""}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>شماره همراه (اختیاری)</Label>
                    <div className="relative">
                      <Input
                        value={newTraveler.phoneNumber}
                        onChange={handleNewTravelerChange}
                        name="phoneNumber"
                        placeholder="شماره موبایل"
                        className={formErrors.phoneNumber ? "border-red-500" : ""}
                      />
                    </div>
                    {formErrors.phoneNumber && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>جنسیت</Label>
                    <div className="relative">
                      <select
                        name="gender"
                        defaultValue="یک مورد را انتخاب کنید"
                        onChange={e => setNewTraveler(prev => ({...prev, gender: e.target.value}))}
                        className={cn(
                                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                              )}
                      >
                        <option value="0">مرد</option>
                        <option value="1">زن</option>
                      </select>
                    </div>
                    {formErrors.gender && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.gender}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>نوع مسافر</Label>
                    <div className="relative">
                      <select
                        name="passengerType"
                        defaultValue="یک مورد را انتخاب کنید"
                        onChange={e => setNewTraveler(prev => ({...prev, passengerType: e.target.value}))}
                        className={cn(
                                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                              )}
                      >
                        <option value="0">کهن سال</option>
                        <option value="1">بزرگسال</option>
                        <option value="2">کودک</option>
                        <option value="3">نوزاد</option>
                      </select>
                    </div>
                    {formErrors.gender && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.gender}
                      </p>
                    )}
                  </div>

                  {/* Date of Birth */}
                  <div className="space-y-2">
                    <Label>تاریخ تولد</Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <DatePicker
                        value={selectedDate}
                        onChange={handleDateChange}
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        render={(value, openCalendar) => (
                          <div className="relative">
                            <input
                              className={`w-full h-10 px-3 pr-10 border rounded-md text-sm bg-background ${
                                formErrors.dateOfBirth ? "border-red-500" : "border-input"
                              }`}
                              placeholder="تاریخ تولد مسافر را انتخاب کنید"
                              value={value || ""}
                              onClick={openCalendar}
                              readOnly
                            />
                          </div>
                        )}
                      />
                    </div>
                    {formErrors.dateOfBirth && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.dateOfBirth}
                      </p>
                    )}
                    {newTraveler.dateOfBirth && (
                      <p className="text-xs text-muted-foreground">
                        سن: {calculateAge(newTraveler.dateOfBirth)} سال
                      </p>
                    )}
                  </div>

                  {/* Passport Expiry */}
                  {area == "intl" &&
                  <div className="space-y-2">
                    <Label>تاریخ انقضای پاسپورت </Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                      <DatePicker
                        value={selectedPassportExpiry}
                        onChange={handlePassportExpiryChange}
                        calendar={persian}
                        locale={persian_fa}
                        calendarPosition="bottom-right"
                        render={(value, openCalendar) => (
                          <div className="relative">
                            <input
                              className={`w-full h-10 px-3 pr-10 border rounded-md text-sm bg-background ${
                                formErrors.passportExpiry ? "border-red-500" : "border-input"
                              }`}
                              placeholder="تاریخ انقضای پاسپورت (اختیاری)"
                              value={value || ""}
                              onClick={openCalendar}
                              readOnly
                            />
                          </div>
                        )}
                      />
                    </div>
                    {formErrors.passportExpiry && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.passportExpiry}
                      </p>
                    )}
                    {newTraveler.passportExpiry && (
                      <p className={`text-xs ${isPassportExpired(newTraveler.passportExpiry) ? 'text-red-500' : 'text-green-600'}`}>
                        {isPassportExpired(newTraveler.passportExpiry) ? 'پاسپورت منقضی شده' : 'پاسپورت معتبر'}
                      </p>
                    )}
                  </div>
                  }
                  <div className="flex gap-2">
                    <Button onClick={handleAddTraveler} disabled={!isNewTravelerValid()} className="flex-1">
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
        </div>
      )}

      {!canAddMoreTravelers && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-amber-700 text-sm text-center">
            شما حداکثر تعداد مجاز مسافر ({maxTravelers} نفر) را انتخاب کرده‌اید
          </p>
        </div>
      )}
    </div>
  )
}

  // Dashboard Mode Layout
  return (
    <Card className="p-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User2 className="h-5 w-5" />
          اطلاعات مسافران
        </CardTitle>
        <CardDescription>
          اطلاعات مسافران خود را مدیریت کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              اطلاعات مسافران با موفقیت ذخیره شد
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Existing Travelers Section */}
          {allExistingTravelers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">مسافران موجود ({allExistingTravelers.length})</h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-700 text-sm">
                  این مسافران قبلاً در سیستم ثبت شده‌اند و برای سفرهای آینده قابل استفاده هستند.
                </p>
              </div>
              {allExistingTravelers.map((traveler) => (
                <div key={traveler.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <User2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {traveler.firstName} {traveler.lastName}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                          <div>کد ملی: {traveler.nationalId}</div>
                          <div>سن: {traveler.age} سال</div>
                          <div>پاسپورت: {traveler.passportNumber || 'ثبت نشده'}</div>
                          <div className={traveler.passportExpiry ? (isPassportExpired(traveler.passportExpiry) ? 'text-red-500' : 'text-green-600') : 'text-gray-500'}>
                            انقضا: {traveler.passportExpiry ? new Date(traveler.passportExpiry).toLocaleDateString('fa-IR') : 'ثبت نشده'}
                            {traveler.passportExpiry && isPassportExpired(traveler.passportExpiry) && ' (منقضی)'}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                      ثبت شده
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Add New Traveler Form */}
          {!readOnly && (
            <div className="bg-gray-50 p-4 rounded-lg border">
              <h3 className="font-medium mb-4 flex items-center gap-2">
                <Plus className="h-4 w-4" />
                افزودن مسافر جدید
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="travelerFirstName">
                    نام مسافر
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="travelerFirstName"
                      name="firstName"
                      placeholder="نام مسافر"
                      className={`pr-10 ${formErrors.firstName ? "border-red-500" : ""}`}
                      value={newTraveler.firstName}
                      onChange={handleNewTravelerChange}
                    />
                  </div>
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.firstName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travelerLastName">
                    نام خانوادگی مسافر
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="travelerLastName"
                      name="lastName"
                      placeholder="نام خانوادگی مسافر"
                      className={`pr-10 ${formErrors.lastName ? "border-red-500" : ""}`}
                      value={newTraveler.lastName}
                      onChange={handleNewTravelerChange}
                    />
                  </div>
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.lastName}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="travelerNationalId">
                    کد ملی مسافر
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="travelerNationalId"
                      name="nationalId"
                      placeholder="کد ملی ۱۰ رقمی"
                      className={`pr-10 ${formErrors.nationalId ? "border-red-500" : ""}`}
                      value={newTraveler.nationalId}
                      onChange={handleNewTravelerChange}
                      maxLength={10}
                    />
                  </div>
                  {formErrors.nationalId && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.nationalId}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travelerPassportNumber">
                    شماره پاسپورت
                    <span className="text-gray-500 mr-1">(اختیاری)</span>
                  </Label>
                  <div className="relative">
                    <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="travelerPassportNumber"
                      name="passportNumber"
                      placeholder="شماره پاسپورت (اختیاری)"
                      className={`pr-10 ${formErrors.passportNumber ? "border-red-500" : ""}`}
                      value={newTraveler.passportNumber}
                      onChange={handleNewTravelerChange}
                    />
                  </div>
                  {formErrors.passportNumber && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.passportNumber}
                    </p>
                  )}
                </div>
              </div>

                  
                  <div className="space-y-2">
                    <Label>ایمیل (اختیاری)</Label>
                    <div className="relative">
                      <Input
                        value={newTraveler.email}
                        onChange={handleNewTravelerChange}
                        name="email"
                        placeholder="آدرس ایمیل"
                        className={formErrors.email ? "border-red-500" : ""}
                      />
                    </div>
                    {formErrors.email && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.email}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>شماره همراه (اختیاری)</Label>
                    <div className="relative">
                      <Input
                        value={newTraveler.phoneNumber}
                        onChange={handleNewTravelerChange}
                        name="phoneNumber"
                        placeholder="شماره موبایل"
                        className={formErrors.phoneNumber ? "border-red-500" : ""}
                      />
                    </div>
                    {formErrors.phoneNumber && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.phoneNumber}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>جنسیت</Label>
                    <div className="relative">
                      <select
                        name="gender"
                        defaultValue="یک مورد را انتخاب کنید"
                        onChange={e => {
                            console.log(e.target.value)
                           setNewTraveler(prev => ({...prev, gender: e.target.value}))}
                        }
                        className={cn(
                                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                              )}
                      >
                        <option value="0">مرد</option>
                        <option value="1">زن</option>
                      </select>
                    </div>
                    {formErrors.gender && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.gender}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>نوع مسافر</Label>
                    <div className="relative">
                      <select
                        name="passengerType"
                        defaultValue="یک مورد را انتخاب کنید"
                        onChange={e => {
                          console.log(e.target.value)
                          setNewTraveler(prev => ({...prev, passengerType: e.target.value}))}
                        }
                        className={cn(
                                'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
                                'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
                                'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
                              )}
                      >
                        <option value="0">کهن سال</option>
                        <option value="1">بزرگسال</option>
                        <option value="2">کودک</option>
                        <option value="3">نوزاد</option>
                      </select>
                    </div>
                    {formErrors.gender && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {formErrors.gender}
                      </p>
                    )}
                  </div>

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="travelerDateOfBirth">
                    تاریخ تولد مسافر
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <DatePicker
                      value={selectedDate}
                      onChange={handleDateChange}
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      render={(value, openCalendar) => (
                        <div className="relative">
                          <input
                            className={`w-full h-10 px-3 pr-10 border rounded-md text-sm bg-background ${
                              formErrors.dateOfBirth ? "border-red-500" : "border-input"
                            }`}
                            placeholder="تاریخ تولد مسافر را انتخاب کنید"
                            value={value || ""}
                            onClick={openCalendar}
                            readOnly
                          />
                        </div>
                      )}
                    />
                  </div>
                  {formErrors.dateOfBirth && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.dateOfBirth}
                    </p>
                  )}
                  {newTraveler.dateOfBirth && (
                    <p className="text-xs text-muted-foreground">
                      سن: {calculateAge(newTraveler.dateOfBirth)} سال
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="travelerPassportExpiry">
                    تاریخ انقضای پاسپورت
                    <span className="text-gray-500 mr-1">(اختیاری)</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                    <DatePicker
                      value={selectedPassportExpiry}
                      onChange={handlePassportExpiryChange}
                      calendar={persian}
                      locale={persian_fa}
                      calendarPosition="bottom-right"
                      render={(value, openCalendar) => (
                        <div className="relative">
                          <input
                            className={`w-full h-10 px-3 pr-10 border rounded-md text-sm bg-background ${
                              formErrors.passportExpiry ? "border-red-500" : "border-input"
                            }`}
                            placeholder="تاریخ انقضای پاسپورت (اختیاری)"
                            value={value || ""}
                            onClick={openCalendar}
                            readOnly
                          />
                        </div>
                      )}
                    />
                  </div>
                  {formErrors.passportExpiry && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {formErrors.passportExpiry}
                    </p>
                  )}
                  {newTraveler.passportExpiry && (
                    <p className={`text-xs ${isPassportExpired(newTraveler.passportExpiry) ? 'text-red-500' : 'text-green-600'}`}>
                      {isPassportExpired(newTraveler.passportExpiry) ? 'پاسپورت منقضی شده' : 'پاسپورت معتبر'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={handleAddTraveler}
                  disabled={!isNewTravelerValid()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="ml-2 h-4 w-4" />
                  افزودن مسافر
                </Button>
              </div>
            </div>
          )}

          {/* New Travelers List */}
          {newTravelers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">مسافران جدید ({newTravelers.length})</h3>
              {newTravelers.map((traveler) => (
                <div key={traveler.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {traveler.firstName} {traveler.lastName}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                          <div>کد ملی: {traveler.nationalId}</div>
                          <div>سن: {traveler.age} سال</div>
                          <div>پاسپورت: {traveler.passportNumber || 'ثبت نشده'}</div>
                          <div className={traveler.passportExpiry ? (isPassportExpired(traveler.passportExpiry) ? 'text-red-500' : 'text-green-600') : 'text-gray-500'}>
                            انقضا: {traveler.passportExpiry ? new Date(traveler.passportExpiry).toLocaleDateString('fa-IR') : 'ثبت نشده'}
                            {traveler.passportExpiry && isPassportExpired(traveler.passportExpiry) && ' (منقضی)'}
                          </div>
                          <div>جنسیت: {traveler.gender || 'ثبت نشد ، امکان بروز خطا'}</div>
                          <div>رده سنی: {traveler.passengerType || 'ثبت نشده ، امکان بروز خطا'}</div>
                          <div>شماره همراه: {traveler.phoneNumber || 'ثبت نشده ، امکان بروز خطا'}</div>
                          <div>ایمیل: {traveler.email || 'ثبت نشده ، امکان بروز خطا'}</div>
                        </div>
                      </div>
                    </div>
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveNewTraveler(traveler.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          {!readOnly && newTravelers.length > 0 && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                disabled={saving}
              >
                <Save className="ml-2 h-4 w-4" />
                {saving ? "در حال ذخیره..." : `ذخیره ${newTravelers.length} مسافر جدید`}
              </Button>
            </div>
          )}

          {allExistingTravelers.length === 0 && newTravelers.length === 0 && !readOnly && (
            <div className="text-center py-8 text-muted-foreground">
              <User2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هنوز مسافری اضافه نکرده‌اید</p>
              <p className="text-sm mt-1">مسافران خود را اضافه کنید</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}