"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { User, MapPin, CreditCard, Save, Mail } from "lucide-react"

export function ProfileForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    nationalId: "",
    address: "",
    postalCode: "",
    city: "",
    province: "",
  })
  const [hasExistingData, setHasExistingData] = useState(false)

  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          const userData = {
            firstName: data.user.firstName || "",
            lastName: data.user.lastName || "",
            nationalId: data.user.nationalId || "",
            address: data.user.address || "",
            postalCode: data.user.postalCode || "",
            city: data.user.city || "",
            province: data.user.province || "",
          }
          
          setFormData(userData)
          
          // Check if any field has existing data
          const hasData = Object.values(userData).some(value => value && value.trim() !== "")
          setHasExistingData(hasData)
        }
        console.log(data.user)
        setLoading(false)
      })
      .catch((err) => {
        console.error("[v0] Error fetching profile:", err)
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Prevent submission if there's existing data
    if (hasExistingData) {
      setError("برای ویرایش اطلاعات لطفا با پشتیبانی تماس بگیرید")
      return
    }
    
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setHasExistingData(true) // Mark as having data after successful save
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
    // Prevent changes if there's existing data
    if (hasExistingData) return
    
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
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
    <Card>
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
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
              اطلاعات با موفقیت به‌روزرسانی شد
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">نام</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="firstName"
                  name="firstName"
                  placeholder="نام خود را وارد کنید"
                  className="pr-10"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  disabled={hasExistingData}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">نام خانوادگی</Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="lastName"
                  name="lastName"
                  placeholder="نام خانوادگی خود را وارد کنید"
                  className="pr-10"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  disabled={hasExistingData}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="nationalId">کد ملی</Label>
            <div className="relative">
              <CreditCard className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="nationalId"
                name="nationalId"
                placeholder="کد ملی ۱۰ رقمی"
                className="pr-10"
                value={formData.nationalId}
                onChange={handleChange}
                maxLength={10}
                disabled={hasExistingData}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">آدرس</Label>
            <div className="relative">
              <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="address"
                name="address"
                placeholder="آدرس کامل خود را وارد کنید"
                className="pr-10 min-h-24"
                value={formData.address}
                onChange={handleChange}
                disabled={hasExistingData}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="city">شهر</Label>
              <Input 
                id="city" 
                name="city" 
                placeholder="نام شهر" 
                value={formData.city} 
                onChange={handleChange} 
                disabled={hasExistingData}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode">کد پستی</Label>
              <Input
                id="postalCode"
                name="postalCode"
                placeholder="کد پستی ۱۰ رقمی"
                value={formData.postalCode}
                onChange={handleChange}
                maxLength={10}
                disabled={hasExistingData}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" disabled={hasExistingData}>
              انصراف
            </Button>
            <Button 
              type="submit" 
              disabled={saving || hasExistingData}
              className={hasExistingData ? "bg-gray-400 cursor-not-allowed" : ""}
            >
              <Save className="ml-2 h-4 w-4" />
              {hasExistingData ? "غیرقابل ویرایش" : saving ? "در حال ذخیره..." : "ذخیره اطلاعات"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}