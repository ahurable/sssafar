"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Calendar, Plus, Trash2, Save, AlertCircle, User2, FileText } from "lucide-react"
import DatePicker from "react-multi-date-picker"
import type { DateObject } from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"

export interface ChildData {
  id: string
  firstName: string
  lastName: string
  nationalId: string
  dateOfBirth: string
  passportNumber?: string
  passportExpiry?: string
  age?: number
}

interface ChildrenFormProps {
  existingChildren?: ChildData[]
  onSave?: (children: ChildData[]) => void
  readOnly?: boolean
}

export function TravelerForm({ existingChildren = [], onSave, readOnly = false }: ChildrenFormProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  
  // Separate states for existing travelers and new travelers
  const [existingTravelers, setExistingTravelers] = useState<ChildData[]>([])
  const [newTravelers, setNewTravelers] = useState<ChildData[]>([])

  // New child form state
  const [newChild, setNewChild] = useState<Omit<ChildData, 'id'>>({
    firstName: "",
    lastName: "",
    nationalId: "",
    dateOfBirth: "",
    passportNumber: "",
    passportExpiry: "",
  })
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null)
  const [selectedPassportExpiry, setSelectedPassportExpiry] = useState<DateObject | null>(null)

  useEffect(() => {
    const loadChildrenData = async () => {
      try {
        // Load existing travelers from props or API
        if (existingChildren.length > 0) {
          setExistingTravelers(existingChildren)
        } else {
          const response = await fetch("/api/travelers")
          const data = await response.json()
          console.log(data)
          if (data.travelers && data.travelers.length > 0) {
            setExistingTravelers(data.travelers)
          }
        }
      } catch (err) {
        console.error("Error loading children data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadChildrenData()
  }, [])

  // Calculate age from date of birth
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

  // Check if passport is expired
  const isPassportExpired = (expiryDate: string): boolean => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    return expiry < today
  }

  // Validate child data
  const validateChild = (child: Omit<ChildData, 'id'>): boolean => {
    const errors: Record<string, string> = {}

    if (!child.firstName.trim()) {
      errors.firstName = "نام مسافر الزامی است"
    } else if (child.firstName.trim().length < 2) {
      errors.firstName = "نام باید حداقل ۲ حرف باشد"
    }

    if (!child.lastName.trim()) {
      errors.lastName = "نام خانوادگی مسافر الزامی است"
    } else if (child.lastName.trim().length < 2) {
      errors.lastName = "نام خانوادگی باید حداقل ۲ حرف باشد"
    }

    if (!child.nationalId.trim()) {
      errors.nationalId = "کد ملی مسافر الزامی است"
    } else if (!/^\d{10}$/.test(child.nationalId)) {
      errors.nationalId = "کد ملی باید ۱۰ رقم باشد"
    }

    // Check for duplicate national ID in new travelers
    const isDuplicate = newTravelers.some(traveler => traveler.nationalId === child.nationalId)
    if (isDuplicate) {
      errors.nationalId = "این کد ملی قبلاً در لیست مسافران جدید اضافه شده است"
    }

    // Passport number is optional, but if provided, validate length
    if (child.passportNumber && child.passportNumber.trim().length < 5) {
      errors.passportNumber = "شماره پاسپورت باید حداقل ۵ کاراکتر باشد"
    }

    if (!selectedDate) {
      errors.dateOfBirth = "تاریخ تولد مسافر الزامی است"
    } else {
      const age = calculateAge(child.dateOfBirth)
      if (age >= 12) {
        errors.dateOfBirth = "مسافر باید زیر ۱۲ سال باشد"
      }
    }

    // Passport expiry is optional, but if provided, check if expired
    if (child.passportExpiry && isPassportExpired(child.passportExpiry)) {
      errors.passportExpiry = "پاسپورت منقضی شده است"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleAddChild = () => {
    if (readOnly) return

    if (!validateChild(newChild)) {
      setError("لطفا اطلاعات مسافر را به درستی تکمیل کنید")
      return
    }

    const childWithAge = {
      ...newChild,
      id: Date.now().toString(),
      age: calculateAge(newChild.dateOfBirth)
    }

    setNewTravelers(prev => [...prev, childWithAge])
    setNewChild({
      firstName: "",
      lastName: "",
      nationalId: "",
      dateOfBirth: "",
      passportNumber: "",
      passportExpiry: "",
    })
    setSelectedDate(null)
    setSelectedPassportExpiry(null)
    setFormErrors({})
    setError("")
  }

  const handleRemoveNewTraveler = (id: string) => {
    if (readOnly) return
    setNewTravelers(prev => prev.filter(child => child.id !== id))
  }

  const handleNewChildChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return
    
    const { name, value } = e.target
    
    setNewChild(prev => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user starts typing
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

    setNewChild(prev => ({
      ...prev,
      dateOfBirth
    }))

    // Clear date error when user selects a date
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

    setNewChild(prev => ({
      ...prev,
      passportExpiry
    }))

    // Clear passport expiry error when user selects a date
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
      // Only send new travelers to the API
      const res = await fetch("/api/travelers/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ children: newTravelers }),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        // Add the new travelers to existing travelers and clear the form
        setExistingTravelers(prev => [...prev, ...newTravelers])
        setNewTravelers([])
        if (onSave) {
          onSave(newTravelers)
        }
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || "خطا در ذخیره اطلاعات مسافران")
      }
    } catch (err) {
      console.error("Error saving children data:", err)
      setError("خطا در برقراری ارتباط با سرور")
    } finally {
      setSaving(false)
    }
  }

  const isNewChildValid = () => {
    const basicValidation = newChild.firstName.trim().length >= 2 && 
           newChild.lastName.trim().length >= 2 && 
           /^\d{10}$/.test(newChild.nationalId) && 
           selectedDate !== null &&
           calculateAge(newChild.dateOfBirth) < 12

    // Check for duplicate national ID
    const isDuplicate = newTravelers.some(traveler => traveler.nationalId === newChild.nationalId)
    if (isDuplicate) {
      return false
    }

    // Passport validation (optional)
    const passportValidation = 
      (!newChild.passportNumber || newChild.passportNumber.trim().length >= 5) &&
      (!newChild.passportExpiry || !isPassportExpired(newChild.passportExpiry))

    return basicValidation && passportValidation
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">در حال بارگذاری اطلاعات مسافران...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User2 className="h-5 w-5" />
          اطلاعات مسافران
        </CardTitle>
        <CardDescription>
          اطلاعات مسافران زیر ۱۲ سال خود را وارد کنید
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
          {existingTravelers.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-medium text-lg">مسافران موجود ({existingTravelers.length})</h3>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-blue-700 text-sm">
                  این مسافران قبلاً در سیستم ثبت شده‌اند و برای سفرهای آینده قابل استفاده هستند.
                </p>
              </div>
              {existingTravelers.map((child, index) => (
                <div key={child.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-full">
                        <User2 className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {child.firstName} {child.lastName}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                          <div>کد ملی: {child.nationalId}</div>
                          <div>سن: {child.age} سال</div>
                          <div>پاسپورت: {child.passportNumber || 'ثبت نشده'}</div>
                          <div className={child.passportExpiry ? (isPassportExpired(child.passportExpiry) ? 'text-red-500' : 'text-green-600') : 'text-gray-500'}>
                            انقضا: {child.passportExpiry ? new Date(child.passportExpiry).toLocaleDateString('fa-IR') : 'ثبت نشده'}
                            {child.passportExpiry && isPassportExpired(child.passportExpiry) && ' (منقضی)'}
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
                  <Label htmlFor="childFirstName">
                    نام مسافر
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="childFirstName"
                      name="firstName"
                      placeholder="نام مسافر"
                      className={`pr-10 ${formErrors.firstName ? "border-red-500" : ""}`}
                      value={newChild.firstName}
                      onChange={handleNewChildChange}
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
                  <Label htmlFor="childLastName">
                    نام خانوادگی مسافر
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="childLastName"
                      name="lastName"
                      placeholder="نام خانوادگی مسافر"
                      className={`pr-10 ${formErrors.lastName ? "border-red-500" : ""}`}
                      value={newChild.lastName}
                      onChange={handleNewChildChange}
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
                  <Label htmlFor="childNationalId">
                    کد ملی مسافر
                    <span className="text-red-500 mr-1">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="childNationalId"
                      name="nationalId"
                      placeholder="کد ملی ۱۰ رقمی"
                      className={`pr-10 ${formErrors.nationalId ? "border-red-500" : ""}`}
                      value={newChild.nationalId}
                      onChange={handleNewChildChange}
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
                  <Label htmlFor="childPassportNumber">
                    شماره پاسپورت
                    <span className="text-gray-500 mr-1">(اختیاری)</span>
                  </Label>
                  <div className="relative">
                    <FileText className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="childPassportNumber"
                      name="passportNumber"
                      placeholder="شماره پاسپورت (اختیاری)"
                      className={`pr-10 ${formErrors.passportNumber ? "border-red-500" : ""}`}
                      value={newChild.passportNumber}
                      onChange={handleNewChildChange}
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

              <div className="grid gap-4 md:grid-cols-2 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="childDateOfBirth">
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
                  {newChild.dateOfBirth && (
                    <p className="text-xs text-muted-foreground">
                      سن: {calculateAge(newChild.dateOfBirth)} سال
                      {calculateAge(newChild.dateOfBirth) >= 12 && (
                        <span className="text-red-500 mr-2"> (باید زیر ۱۲ سال باشد)</span>
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="childPassportExpiry">
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
                  {newChild.passportExpiry && (
                    <p className={`text-xs ${isPassportExpired(newChild.passportExpiry) ? 'text-red-500' : 'text-green-600'}`}>
                      {isPassportExpired(newChild.passportExpiry) ? 'پاسپورت منقضی شده' : 'پاسپورت معتبر'}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <Button
                  type="button"
                  onClick={handleAddChild}
                  disabled={!isNewChildValid()}
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
              {newTravelers.map((child, index) => (
                <div key={child.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-full">
                        <User2 className="h-4 w-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">
                          {child.firstName} {child.lastName}
                        </h4>
                        <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
                          <div>کد ملی: {child.nationalId}</div>
                          <div>سن: {child.age} سال</div>
                          <div>پاسپورت: {child.passportNumber || 'ثبت نشده'}</div>
                          <div className={child.passportExpiry ? (isPassportExpired(child.passportExpiry) ? 'text-red-500' : 'text-green-600') : 'text-gray-500'}>
                            انقضا: {child.passportExpiry ? new Date(child.passportExpiry).toLocaleDateString('fa-IR') : 'ثبت نشده'}
                            {child.passportExpiry && isPassportExpired(child.passportExpiry) && ' (منقضی)'}
                          </div>
                        </div>
                      </div>
                    </div>
                    {!readOnly && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveNewTraveler(child.id)}
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

          {existingTravelers.length === 0 && newTravelers.length === 0 && !readOnly && (
            <div className="text-center py-8 text-muted-foreground">
              <User2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هنوز مسافری اضافه نکرده‌اید</p>
              <p className="text-sm mt-1">مسافران زیر ۱۲ سال خود را اضافه کنید</p>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  )
}