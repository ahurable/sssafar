"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Save, Upload, X, Image as ImageIcon, Eye, Star, FormInput, FileOutput, FormInputIcon } from "lucide-react"
import { toast } from "sonner"

interface CipService {
  id: string
  title: string
  description: string | null
  image: string | null
  airport: string
  price: number | null
  currency: string
  duration: string | null
  features: string[]
  included: string[]
  notIncluded: string[]
  priority: number
  published: boolean
  featured: boolean
  reservations: any[]
  entry: boolean
  deferent: boolean
}

interface EditCipFormProps {
  service: CipService
}

export function EditCipForm({ service }: EditCipFormProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    airport: "",
    price: "",
    duration: "",
    features: [""],
    included: [""],
    notIncluded: [""],
    priority: "0",
    published: false,
    featured: false,
    entry: false,
    deferent: false
  })

  // Initialize form with service data
  useEffect(() => {
    setFormData({
      title: service.title,
      description: service.description || "",
      image: service.image || "",
      airport: service.airport,
      price: service.price?.toString() || "",
      duration: service.duration || "",
      features: service.features.length > 0 ? service.features : [""],
      included: service.included.length > 0 ? service.included : [""],
      notIncluded: service.notIncluded.length > 0 ? service.notIncluded : [""],
      priority: service.priority.toString(),
      published: service.published,
      featured: service.featured,
      entry: service.entry,
      deferent: service.deferent
    })
    
    if (service.image) {
      setImagePreview(service.image)
    }
  }, [service])

  const handleImageUpload = async (file: File) => {
    setUploading(true)
    
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setFormData(prev => ({ ...prev, image: result.url }))
        setImagePreview(result.url)
        toast.success("تصویر با موفقیت آپلود شد")
      } else {
        toast.error(result.error || "خطا در آپلود تصویر")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("خطا در آپلود تصویر")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Create preview
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      
      // Upload file
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: "" }))
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/cip/${service.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          image: formData.image || undefined,
          airport: formData.airport,
          price: formData.price ? parseFloat(formData.price) : undefined,
          duration: formData.duration || undefined,
          features: formData.features.filter(f => f.trim()),
          included: formData.included.filter(f => f.trim()),
          notIncluded: formData.notIncluded.filter(f => f.trim()),
          priority: parseInt(formData.priority),
          published: formData.published,
          featured: formData.featured,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("خدمت CIP با موفقیت ویرایش شد")
        router.push("/admin/cip")
        router.refresh()
      } else {
        toast.error(result.error || "خطا در ویرایش خدمت")
      }
    } catch (error) {
      console.error("Error updating CIP service:", error)
      toast.error("خطا در ویرایش خدمت")
    } finally {
      setLoading(false)
    }
  }

  const addFeature = (field: "features" | "included" | "notIncluded") => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }))
  }

  const removeFeature = (field: "features" | "included" | "notIncluded", index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateFeature = (field: "features" | "included" | "notIncluded", index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((f, i) => i === index ? value : f)
    }))
  }

  const previewService = () => {
    window.open(`/cip/${service.id}`, '_blank')
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions Card */}
      <Card className="py-6">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">{service.title}</h2>
              <p className="text-muted-foreground mt-1">
                {service.reservations.length} درخواست رزرو
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={previewService}>
                <Eye className="h-4 w-4 ml-2" />
                پیش‌نمایش
              </Button>
              <Button asChild>
                <a href={`/cip/${service.id}`} target="_blank">
                  مشاهده در سایت
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اطلاعات اصلی */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>اطلاعات اصلی</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان خدمت *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="airport">فرودگاه *</Label>
                <Input
                  id="airport"
                  value={formData.airport}
                  onChange={(e) => setFormData(prev => ({ ...prev, airport: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات کوتاه</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label>تصویر خدمت</Label>
              
              {imagePreview ? (
                <div className="relative inline-block">
                  <div className="w-64 h-48 rounded-lg border-2 border-gray-300 overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-64 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${
                      uploading ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-1 text-sm text-gray-500">
                            <span className="font-semibold">کلیک کنید برای آپلود</span>
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF (حداکثر ۵MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      id="image-upload"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}

              {/* Manual URL Input as fallback */}
              <div className="space-y-2">
                <Label htmlFor="image-url">یا آدرس تصویر</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, image: e.target.value }))
                      setImagePreview(e.target.value)
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImagePreview(formData.image)
                        toast.success("تصویر از آدرس بارگذاری شد")
                      }}
                    >
                      <ImageIcon className="h-4 w-4 ml-1" />
                      بارگذاری
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* تنظیمات نمایش */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>تنظیمات نمایش</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Active/Published Switch */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${formData.published ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <Eye className={`h-5 w-5 ${formData.published ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Label htmlFor="published" className="text-base font-medium cursor-pointer">
                      خدمت فعال
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      نمایش این خدمت در سایت
                    </p>
                  </div>
                </div>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
              </div>

              {/* Featured/Special Switch */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${formData.featured ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <Star className={`h-5 w-5 ${formData.featured ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Label htmlFor="featured" className="text-base font-medium cursor-pointer">
                      خدمت ویژه
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      نشان دادن به عنوان خدمت ویژه
                    </p>
                  </div>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${formData.entry ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <FormInputIcon className={`h-5 w-5 ${formData.entry ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Label htmlFor="entry" className="text-base font-medium cursor-pointer">
                      ورودی
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      نشان دادن خدمت برای پرواز های ورودی
                    </p>
                  </div>
                </div>
                <Switch
                  id="entry"
                  checked={formData.entry}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, entry: checked }))}
                />
              </div>

              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${formData.deferent ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <FileOutput className={`h-5 w-5 ${formData.deferent ? 'text-purple-600' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <Label htmlFor="deferent" className="text-base font-medium cursor-pointer">
                      خروجی
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      نشان دادن خدمت برای پرواز های خروجی
                    </p>
                  </div>
                </div>
                <Switch
                  id="deferent"
                  checked={formData.deferent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, deferent: checked }))}
                />
              </div>

            </div>

            {/* Priority Setting */}
            <div className="mt-6 p-4 border border-gray-200 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-base font-medium">
                  اولویت نمایش
                </Label>
                <p className="text-sm text-muted-foreground mb-3">
                  خدمات با اولویت بالاتر در ابتدا نمایش داده می‌شوند
                </p>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  min="0"
                  max="100"
                  className="max-w-32"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* بقیه بخش‌های فرم */}
        {/* ... سایر بخش‌های فرم مانند قبل ... */}

        {/* دکمه‌های اقدام */}
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/cip")}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={loading || uploading} className="min-w-32">
            {loading ? (
              "در حال ذخیره..."
            ) : (
              <>
                ذخیره تغییرات
                <Save className="h-4 w-4 mr-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}