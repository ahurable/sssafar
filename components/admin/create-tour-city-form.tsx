// components/admin/create-tour-city-form.tsx
"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

export function CreateTourCityForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: ""
  })
  const [previewUrl, setPreviewUrl] = useState("")
  const [uploadError, setUploadError] = useState("")

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Reset error
    setUploadError("")

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"]
    if (!allowedTypes.includes(file.type)) {
      setUploadError("فرمت فایل مجاز نیست. فقط فایل‌های JPEG, PNG, WebP, GIF قابل قبول هستند")
      return
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      setUploadError("حجم فایل نباید بیشتر از ۵ مگابایت باشد")
      return
    }

    // Create preview
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    // Upload file
    setUploading(true)
    try {
      const uploadFormData = new FormData()
      uploadFormData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Use the full URL returned by your API
        setFormData(prev => ({ ...prev, image: data.url }))
        setUploadError("")
      } else {
        setUploadError(data.error || "خطا در آپلود تصویر")
        setPreviewUrl("")
        setFormData(prev => ({ ...prev, image: "" }))
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setUploadError("خطا در آپلود تصویر")
      setPreviewUrl("")
      setFormData(prev => ({ ...prev, image: "" }))
    } finally {
      setUploading(false)
    }
  }

  const removeImage = () => {
    setPreviewUrl("")
    setFormData(prev => ({ ...prev, image: "" }))
    setUploadError("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Check if all required fields are filled
    if (!formData.name.trim() || !formData.description.trim() || !formData.image) {
      alert("لطفا تمام فیلدهای ضروری را پر کنید")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/admin/tours/cities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim(),
          image: formData.image // This is the full URL from your upload API
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push("/admin/tours")
        router.refresh()
      } else {
        alert(data.error || "خطا در ایجاد شهر")
      }
    } catch (error) {
      console.error("Error creating tour city:", error)
      alert("خطا در ایجاد شهر")
    } finally {
      setLoading(false)
    }
  }

  // Check if form is valid for submission
  const isFormValid = formData.name.trim() && 
                     formData.description.trim() && 
                     formData.image && 
                     !uploading

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>ایجاد شهر تور جدید</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">نام شهر *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="مثال: تهران"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">توضیحات شهر *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="توضیحات کامل درباره شهر و جاذبه‌های گردشگری آن"
              rows={4}
              required
            />
          </div>

          <div>
            <Label htmlFor="image">تصویر شهر *</Label>
            
            {/* Image Upload Area */}
            <div className="mt-2">
              {!previewUrl ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="h-8 w-8 text-gray-400 animate-spin mb-2" />
                        <p className="text-sm text-gray-600">در حال آپلود...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">برای آپلود کلیک کنید</span> یا فایل را اینجا بکشید
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WebP, GIF تا ۵MB
                        </p>
                      </>
                    )}
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium">تصویر انتخاب شده</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={removeImage}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                    <div className="relative aspect-video rounded-md overflow-hidden bg-gray-100">
                      <Image
                        src={previewUrl}
                        alt="Preview"
                        fill
                        className="object-cover"
                        onLoad={() => URL.revokeObjectURL(previewUrl)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center truncate">
                      {formData.image}
                    </p>
                  </div>
                </div>
              )}

              {/* Upload Error */}
              {uploadError && (
                <div className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                  {uploadError}
                </div>
              )}

              {/* Upload Success */}
              {formData.image && !uploadError && (
                <div className="mt-2 text-sm text-green-600 bg-green-50 p-3 rounded-md">
                  تصویر با موفقیت آپلود شد
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button 
          type="submit" 
          disabled={!isFormValid || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              در حال ایجاد...
            </>
          ) : (
            "ایجاد شهر"
          )}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.push("/admin/tours")}
        >
          انصراف
        </Button>
      </div>

      {/* Debug info - you can remove this in production */}
      <div className="text-xs text-gray-500 p-4 bg-gray-50 rounded-md">
        <p>اطلاعات دیباگ:</p>
        <p>نام: {formData.name ? "پر شده" : "خالی"}</p>
        <p>توضیحات: {formData.description ? "پر شده" : "خالی"}</p>
        <p>تصویر: {formData.image ? "آپلود شده" : "آپلود نشده"}</p>
        <p>در حال آپلود: {uploading ? "بله" : "خیر"}</p>
        <p>فرم معتبر: {isFormValid ? "بله" : "خیر"}</p>
        {formData.image && (
          <p className="truncate">آدرس تصویر: {formData.image}</p>
        )}
      </div>
    </form>
  )
}