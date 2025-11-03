"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, MapPin, CreditCard, Save, Mail, Calendar, AlertCircle } from "lucide-react"
import DatePicker from "react-multi-date-picker"
import { DateObject } from "react-multi-date-picker"
import persian from "react-date-object/calendars/persian"
import persian_fa from "react-date-object/locales/persian_fa"
import { useSnack } from "@/hooks/use-notification"

export function ProfileForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [_success, setSuccess] = useState(false)
  const [_error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    address: "",
    postalCode: "",
    city: "",
    province: "",
    dateOfBirth: "",
  })
  const [phoneNumber, setPhoneNumber] = useState("")
  const [otpCode, setOtpCode] = useState("")
  const [emailVerificationCode, setEmailVerificationCode] = useState("")
  const [hasPhone, setHasPhone] = useState(false)
  const [hasEmail, setHasEmail] = useState(false)
  const [isPhoneVerified, setIsPhoneVerified] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [hasExistingData, setHasExistingData] = useState(false)
  const [selectedDate, setSelectedDate] = useState<DateObject | null>(null)
  const [hasOtpSent, setHasOtpSent] = useState(false)
  const [hasEmailVerificationSent, setHasEmailVerificationSent] = useState(false)
  const { success, error } = useSnack()
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          console.log("user data is ", data.user)
          const userData = {
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            nationalId: data.user.nationalId || "",
            address: data.user.address || "",
            postalCode: data.user.postalCode || "",
            city: data.user.city || "",
            province: data.user.province || "",
            dateOfBirth: data.user.dateOfBirth || "",
          }
          
          setFormData(userData)
          // Set Persian date if exists
          if (userData.dateOfBirth) {
            try {
              const gregorianDate = new Date(userData.dateOfBirth)
              const persianDate = new DateObject({
                date: gregorianDate,
                calendar: persian,
                locale: persian_fa
              })
              setSelectedDate(persianDate)
            } catch (error) {
              console.error("Error setting date:", error)
            }
          }
          if (data.user.phoneVerified == true) 
            setIsPhoneVerified(true)
          if (!data.user.phone || data.user.phone.length == 0)
            setHasPhone(false)
          else{
            setPhoneNumber(data.user.phone)
            setHasPhone(true)
          }
          // Check if any field has existing data
          const hasData = Object.values(userData).some(value => value && value.trim() !== "")
          setHasExistingData(hasData)
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching profile:", err)
        setLoading(false)
      })
  }, [])


  // Validate form fields
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    // Required fields validation
    if (!formData.firstName.trim()) {
      errors.firstName = "نام الزامی است"
    } else if (formData.firstName.trim().length < 2) {
      errors.firstName = "نام باید حداقل ۲ حرف باشد"
    }

    if (!formData.lastName.trim()) {
      errors.lastName = "نام خانوادگی الزامی است"
    } else if (formData.lastName.trim().length < 2) {
      errors.lastName = "نام خانوادگی باید حداقل ۲ حرف باشد"
    }

    if (!formData.nationalId.trim()) {
      errors.nationalId = "کد ملی الزامی است"
    } else if (!/^\d{10}$/.test(formData.nationalId)) {
      errors.nationalId = "کد ملی باید ۱۰ رقم باشد"
    }

    if (!selectedDate) {
      errors.dateOfBirth = "تاریخ تولد الزامی است"
    }

    if (!formData.address.trim()) {
      errors.address = "آدرس الزامی است"
    } else if (formData.address.trim().length < 10) {
      errors.address = "آدرس باید حداقل ۱۰ حرف باشد"
    }

    if (!formData.city.trim()) {
      errors.city = "شهر الزامی است"
    }

    if (!formData.postalCode.trim()) {
      errors.postalCode = "کد پستی الزامی است"
    } else if (!/^\d{10}$/.test(formData.postalCode)) {
      errors.postalCode = "کد پستی باید ۱۰ رقم باشد"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission if there's existing data
    if (hasExistingData) {
      setError("برای ویرایش اطلاعات لطفا با پشتیبانی تماس بگیرید")
      return
    }
    
    // Validate form
    if (!validateForm()) {
      setError("لطفا اطلاعات فرم را به درستی تکمیل کنید")
      return
    }
    
    setSaving(true)
    setError("")
    setSuccess(false)
    setFormErrors({})

    try {
      // Convert Persian date to Gregorian for storage
      let dateOfBirth = ""
      if (selectedDate) {
        const gregorianDate = selectedDate.convert(persian, "gregorian")
        dateOfBirth = gregorianDate.toDate().toISOString().split('T')[0]
      }

      const submitData = {
        ...formData,
        dateOfBirth
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setHasExistingData(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || "خطا در به‌روزرسانی پروفایل")
      }
    } catch (err) {
      console.error("[v0] Error updating profile:", err)
      setError("خطا در برقراری ارتباط با سرور")
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (hasExistingData) return
    
    const { name, value } = e.target
    
    setFormData((prev) => ({
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
    if (hasExistingData) return
    
    setSelectedDate(date)
    
    // Clear date error when user selects a date
    if (formErrors.dateOfBirth) {
      setFormErrors(prev => ({
        ...prev,
        dateOfBirth: ""
      }))
    }
  }

  const isFormValid = () => {
    return formData.firstName.trim().length >= 2 && 
           formData.lastName.trim().length >= 2 && 
          //  /^\d{10}$/.test(formData.nationalId) && 
           formData.address.trim().length >= 10 && 
           formData.city.trim() && 
          //  /^\d{10}$/.test(formData.postalCode) && 
           selectedDate !== null
  }


  const addPhoneNumber = async () => {
    const res = await fetch("/api/auth/add-phone", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({ phoneNumber : phoneNumber})
    })
    const data = await res.json()
    if (res.ok){
      success(data.message, "",3000)
      setHasPhone(true)
    }
    else 
      error(data.message, "", 3000)
  } 


  const generateOtp = async () => {
    const res = await fetch("/api/auth/generate-otp", {
      method: "POST"
    })
    const data = await res.json()
    if (res.ok){
      success(data.message, "", 3000)
      setHasOtpSent(true)
    }else
      error(data.message, "", 3000)
  }

  const handleVerifyNumber = async () => {
    if (otpCode.length > 0) {
      const res = await fetch("/api/auth/verify-number", {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          otpCode: otpCode
        })
      })
      const data = await res.json()
      if (res.ok) {
        success(data.message)
        setHasOtpSent(true)
      } else {
        success(data.message)
      }
    }
  }

  const addEmail = async () => {
    const res = await fetch("/api/auth/add-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      }, 
      body: JSON.stringify({ email })
    })
    const data = await res.json()
    if (res.ok){
      success(data.message, "",3000)
      setHasEmail(true)
    }
    else 
      error(data.message, "", 3000)
  }

  const sendEmailVerification = async () => {
    const res = await fetch("/api/auth/send-email-verification", {
      method: "POST"
    })
    const data = await res.json()
    if (res.ok){
      success(data.message, "", 3000)
      setHasEmailVerificationSent(true)
    } else
      error(data.message, "", 3000)
  }

  const handleVerifyEmail = async () => {
    if (emailVerificationCode.length > 0) {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type":"application/json"
        },
        body: JSON.stringify({
          verificationCode: emailVerificationCode
        })
      })
      const data = await res.json()
      if (res.ok) {
        success(data.message)
        setIsEmailVerified(true)
        setHasEmailVerificationSent(false)
      } else {
        error(data.message)
      }
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">در حال بارگذاری...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
    {hasPhone === false ?
    <Card className="p-4 my-4">
      <CardTitle>افزودن شماره همراه</CardTitle>
      <CardDescription>برای استفاده از خدمات سایت باید شماره همراه خود را اضافه کنید</CardDescription>
      <CardContent>
        <div className="grid grid-cols-4 items-center w-full">
          <div className="md:col-span-3 col-span-4 pe-2">
            <Input type="text" placeholder="شماره همراه خود را وارد کنید" onChange={ e => setPhoneNumber(e.currentTarget.value)} />
          </div>
          <div className="md:col-span-1 col-span-4 p-2">
            <Button className="w-full"
            onClick={addPhoneNumber}>
              افزودن شماره همراه
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    :
    <Card className="p-4 my-4">
      <CardTitle>شماره همراه</CardTitle>
      <CardContent>
        <div className="grid grid-cols-4 w-full">
          <div className="col-span-1 p-2">
            <span>موبایل:</span>
          </div>
          <div className="col-span-3 pe-2">
            <Input type="text" disabled value={phoneNumber} />
          </div>
        </div>
      </CardContent>
    </Card>
    }

    {isPhoneVerified == false && hasPhone &&
    <Card className="p-4 my-4">
      <CardTitle>تایید شماره تلفن همراه</CardTitle>
      <CardContent>
        <div className="grid grid-cols-4 w-full items-center">
          <div className="md:col-span-3 col-span-4 pe-2">
            <Input type="text" disabled={!hasOtpSent} onChange={e => setOtpCode(e.currentTarget.value)} placeholder="کد تایید را وارد کنید" />
          </div>
          <div className="md:col-span-1 col-span-4">
            { hasOtpSent ?
            <Button className="bg-blue-400 ps-2 w-full"
            onClick={handleVerifyNumber}>تایید شماره</Button>
            :
            <Button className="bg-blue-400 ps-2 w-full"
            onClick={generateOtp}>ارسال کد تایید</Button>
            }
          </div>
        </div>
      </CardContent>
    </Card>
    }

      {/* Email Section */}
      {hasEmail === false ?
      <Card className="p-4 my-4">
        <CardTitle>افزودن ایمیل</CardTitle>
        <CardDescription>برای دریافت اطلاعیه‌ها و بازیابی رمز عبور، ایمیل خود را اضافه کنید</CardDescription>
        <CardContent>
          <div className="grid grid-cols-4 items-center w-full">
            <div className="md:col-span-3 col-span-4 pe-2">
              <Input 
                type="email" 
                placeholder="آدرس ایمیل خود را وارد کنید" 
                onChange={e => setEmail(e.currentTarget.value)} 
              />
            </div>
            <div className="md:col-span-1 col-span-4 p-2">
              <Button className="w-full" onClick={addEmail}>
                افزودن ایمیل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      :
      <Card className="p-4 my-4">
        <CardTitle>ایمیل</CardTitle>
        <CardContent>
          <div className="grid grid-cols-4 w-full items-center">
            <div className="col-span-1 p-2">
              <span>ایمیل:</span>
            </div>
            <div className="col-span-3 pe-2">
              <Input type="email" disabled value={email} />
            </div>
          </div>
          {isEmailVerified && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <Mail className="h-4 w-4" />
              تایید شده
            </div>
          )}
        </CardContent>
      </Card>
      }

      {/* Email Verification Section */}
      {isEmailVerified == false && hasEmail &&
      <Card className="p-4 my-4">
        <CardTitle>تایید آدرس ایمیل</CardTitle>
        <CardContent>
          <div className="grid grid-cols-4 w-full items-center">
            <div className="md:col-span-3 col-span-4 pe-2">
              <Input 
                type="text" 
                disabled={!hasEmailVerificationSent} 
                onChange={e => setEmailVerificationCode(e.currentTarget.value)} 
                placeholder="کد تایید ایمیل را وارد کنید" 
              />
            </div>
            <div className="md:col-span-1 col-span-4">
              { hasEmailVerificationSent ?
              <Button className="bg-blue-400 ps-2 w-full" onClick={handleVerifyEmail}>
                تایید ایمیل
              </Button>
              :
              <Button className="bg-blue-400 ps-2 w-full" onClick={sendEmailVerification}>
                ارسال کد تایید
              </Button>
              }
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-600">
            کد تایید به ایمیل <strong>{email}</strong> ارسال خواهد شد
          </div>
        </CardContent>
      </Card>
      }



    <Card className="p-4">
      <CardHeader>
        <CardTitle>اطلاعات شخصی</CardTitle>
        <CardDescription>
          {hasExistingData 
            ? "اطلاعات شما قبلا ثبت شده است. برای ویرایش با پشتیبانی تماس بگیرید."
            : "اطلاعات خود را وارد و به‌روزرسانی کنید"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasExistingData && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-3 text-blue-700">
              <Mail className="h-5 w-5" />
              <div>
                <p className="font-medium">اطلاعات شما قبلا ثبت شده است</p>
                <p className="text-sm mt-1">برای ویرایش اطلاعات لطفا با پشتیبانی تماس بگیرید</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {_success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              اطلاعات با موفقیت به‌روزرسانی شد
            </div>
          )}
          {_error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {_error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                نام
                <span className="text-red-500 mr-1">*</span>
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="نام خود را وارد کنید"
                  className={`pr-10 ${formErrors.firstName ? "border-red-500" : ""}`}
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={hasExistingData}
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
              <Label htmlFor="lastName">
                نام خانوادگی
                <span className="text-red-500 mr-1">*</span>
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="نام خانوادگی خود را وارد کنید"
                  className={`pr-10 ${formErrors.lastName ? "border-red-500" : ""}`}
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={hasExistingData}
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

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nationalId">
                کد ملی
                <span className="text-red-500 mr-1">*</span>
              </Label>
              <div className="relative">
                <CreditCard className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="nationalId"
                  name="nationalId"
                  placeholder="کد ملی ۱۰ رقمی"
                  className={`pr-10 ${formErrors.nationalId ? "border-red-500" : ""}`}
                  value={formData.nationalId}
                  onChange={handleChange}
                  maxLength={10}
                  disabled={hasExistingData}
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
              <Label htmlFor="dateOfBirth">
                تاریخ تولد
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
                  disabled={hasExistingData}
                  render={(value, openCalendar) => (
                    <div className="relative">
                      <input
                        className={`w-full h-10 px-3 pr-10 border rounded-md text-sm bg-background ${
                          formErrors.dateOfBirth ? "border-red-500" : "border-input"
                        } ${hasExistingData ? "bg-muted cursor-not-allowed" : ""}`}
                        placeholder="تاریخ تولد را انتخاب کنید"
                        value={value || ""}
                        onClick={openCalendar}
                        readOnly
                        disabled={hasExistingData}
                      />
                    </div>
                  )}
                  className="rmdp-prime"
                />
              </div>
              {formErrors.dateOfBirth && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.dateOfBirth}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">
              آدرس
              <span className="text-red-500 mr-1">*</span>
            </Label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                name="address"
                placeholder="آدرس کامل خود را وارد کنید"
                className={`pr-10 min-h-24 ${formErrors.address ? "border-red-500" : ""}`}
                value={formData.address}
                onChange={handleChange}
                disabled={hasExistingData}
              />
            </div>
            {formErrors.address && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.address}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">
                شهر
                <span className="text-red-500 mr-1">*</span>
              </Label>
              <Input 
                id="city" 
                name="city" 
                placeholder="نام شهر" 
                className={formErrors.city ? "border-red-500" : ""}
                value={formData.city} 
                onChange={handleChange} 
                disabled={hasExistingData}
              />
              {formErrors.city && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.city}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">
                کد پستی
                <span className="text-red-500 mr-1">*</span>
              </Label>
              <Input
                id="postalCode"
                name="postalCode"
                placeholder="کد پستی ۱۰ رقمی"
                className={formErrors.postalCode ? "border-red-500" : ""}
                value={formData.postalCode}
                onChange={handleChange}
                maxLength={10}
                disabled={hasExistingData}
              />
              {formErrors.postalCode && (
                <p className="text-red-500 text-xs flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {formErrors.postalCode}
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" disabled={hasExistingData}>
              انصراف
            </Button>
            <Button 
              type="submit" 
              disabled={saving || hasExistingData || !isFormValid()}
              className={hasExistingData || !isFormValid() ? "bg-gray-400 cursor-not-allowed" : ""}
            >
              <Save className="ml-2 h-4 w-4" />
              {hasExistingData ? "غیرقابل ویرایش" : saving ? "در حال ذخیره..." : "ذخیره اطلاعات"}
            </Button>
          </div>

          {!isFormValid() && !hasExistingData && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              لطفا تمام فیلدهای ضروری (علامت‌دار با *) را به درستی پر کنید
            </div>
          )}
        </form>
      </CardContent>
    </Card>
    </>
  )
}