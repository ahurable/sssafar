// components/admin/create-faq-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const FAQ_TYPES = [
  { value: "HOTEL", label: "رزرو هتل" },
  { value: "AIR", label: "پرواز" },
  { value: "CIP", label: "خدمات فرودگاهی" },
  { value: "TOUR", label: "تور" },
  { value: "CITY_TOUR", label: "گشت شهری" },
  { value: "VISA", label: "ویزا" },
  { value: "OTHER", label: "سایر" }
]

export function CreateFAQForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    type: "OTHER",
    order: 0,
    isActive: true
  })

  const handleInputChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/faqs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        router.push("/admin/faqs")
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "خطا در ایجاد سوال")
      }
    } catch (error) {
      console.error("Error creating FAQ:", error)
      alert("خطا در ایجاد سوال")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card className="py-6">
        <CardHeader>
          <CardTitle>اطلاعات سوال و پاسخ</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Type */}
          <div>
            <Label htmlFor="type">دسته‌بندی *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleInputChange("type", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FAQ_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Question */}
          <div>
            <Label htmlFor="question">سوال *</Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) => handleInputChange("question", e.target.value)}
              required
              placeholder="مثلا: چگونه می‌توانم هتل رزرو کنم؟"
            />
          </div>

          {/* Answer */}
          <div>
            <Label htmlFor="answer">پاسخ *</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => handleInputChange("answer", e.target.value)}
              required
              rows={6}
              placeholder="پاسخ کامل و دقیق به سوال را وارد کنید..."
              className="resize-vertical"
            />
          </div>

          {/* Order */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="order">ترتیب نمایش</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => handleInputChange("order", parseInt(e.target.value) || 0)}
                min="0"
                placeholder="0"
              />
              <p className="text-xs text-muted-foreground mt-1">
                اعداد کمتر اولویت بالاتری دارند
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <Label htmlFor="isActive" className="cursor-pointer">
                فعال
              </Label>
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => handleInputChange("isActive", checked)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ایجاد..." : "ایجاد سوال"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          انصراف
        </Button>
      </div>
    </form>
  )
}