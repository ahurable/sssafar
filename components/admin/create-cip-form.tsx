"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, ArrowRight, Upload, X, Image as ImageIcon, HelpCircle } from "lucide-react"
import { toast } from "sonner"

interface AirportSuggestion {
  id: string,
  name: string,
  airportIata: string,
  airportCity: string
}

interface FAQItem {
  question: string
  answer: string
  order: number
  isActive: boolean
}

export function CreateCipForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    airportId: "",
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
  const [faqs, setFaqs] = useState<FAQItem[]>([
    { question: "", answer: "", order: 0, isActive: true }
  ])
  const [airportSuggestions, setAirportSuggestions] = useState<AirportSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [airportSearch, setAirportSearch] = useState("")

  const fetchAirportSuggestions = async (q: string) => {
    if (q.length < 2) {
      setAirportSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      const response = await fetch(`/api/admin/settings/airports?q=${q}`)
      if (response.ok) {
        const data = await response.json()
        setAirportSuggestions(data)
        setShowSuggestions(data.length > 0)
      }
    } catch (error) {
      console.error("Error fetching airport suggestions:", error)
      setAirportSuggestions([])
      setShowSuggestions(false)
    }
  }

  const handleAirportSearchChange = (value: string) => {
    setAirportSearch(value)
    if (!value) {
      setFormData(prev => ({ ...prev, airportId: "" }))
      setShowSuggestions(false)
    } else {
      fetchAirportSuggestions(value)
    }
  }

  const handleAirportSelect = (airport: AirportSuggestion) => {
    setFormData(prev => ({ ...prev, airportId: airport.id }))
    setAirportSearch(`${airport.name} (${airport.airportIata}) - ${airport.airportCity}`)
    setShowSuggestions(false)
    setAirportSuggestions([])
  }

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (!target.closest('.airport-suggestions-container')) {
      setShowSuggestions(false)
    }
  }

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const renderAirportSuggestions = () => {
    if (!showSuggestions || airportSuggestions.length === 0) {
      return null
    }

    return (
      <div className="absolute top-full left-0 right-0 bg-[#fffefe] border border-blue-900 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto airport-suggestions-container">
        {airportSuggestions.map((airport) => (
          <div
            key={airport.id}
            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
            onClick={() => handleAirportSelect(airport)}
          >
            <div className="font-medium text-gray-900">{airport.name}</div>
            <div className="text-sm text-gray-600">
              {airport.airportIata} - {airport.airportCity}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleImageUpload = async (file: File) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/cip/upload/image", {
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

  // FAQ Functions
  const addFaq = () => {
    setFaqs(prev => [
      ...prev,
      { question: "", answer: "", order: prev.length, isActive: true }
    ])
  }

  const removeFaq = (index: number) => {
    if (faqs.length > 1) {
      setFaqs(prev => prev.filter((_, i) => i !== index))
    }
  }

  const updateFaq = (index: number, field: keyof FAQItem, value: string | boolean | number) => {
    setFaqs(prev => prev.map((faq, i) =>
      i === index ? { ...faq, [field]: value } : faq
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.airportId) {
      toast.error("لطفا یک فرودگاه انتخاب کنید")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/cip", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          image: formData.image || undefined,
          airportId: formData.airportId,
          price: formData.price ? parseFloat(formData.price) : undefined,
          duration: formData.duration || undefined,
          features: formData.features.filter(f => f.trim()),
          included: formData.included.filter(f => f.trim()),
          notIncluded: formData.notIncluded.filter(f => f.trim()),
          priority: parseInt(formData.priority),
          published: formData.published,
          featured: formData.featured,
          entry: formData.entry,
          deferent: formData.deferent,
          faqs: faqs.filter(faq => faq.question.trim() && faq.answer.trim())
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("خدمت CIP با موفقیت ایجاد شد")
        router.push("/admin/cip")
        router.refresh()
      } else {
        toast.error(result.error || "خطا در ایجاد خدمت")
      }
    } catch (error) {
      console.error("Error creating CIP service:", error)
      toast.error("خطا در ایجاد خدمت")
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

  return (
    <div className="max-w-4xl mx-auto">
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
                  placeholder="مثلا: سرویس CIP تجاری"
                />
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="airport">فرودگاه *</Label>
                <Input
                  id="airport"
                  value={airportSearch}
                  onChange={(e) => handleAirportSearchChange(e.target.value)}
                  placeholder="مثلا: امام خمینی (تهران)"
                  required
                />
                {renderAirportSuggestions()}
                {formData.airportId && (
                  <input type="hidden" name="airportId" value={formData.airportId} />
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات کوتاه</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="توضیح مختصر درباره خدمت..."
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label>تصویر خدمت</Label>

              {imagePreview ? (
                <div className="relative inline-block">
                  <div className="w-64 h-48 rounded-lg border-2 border-dashed border-blue-900 overflow-hidden">
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
                    className={`flex flex-col items-center justify-center w-64 h-32 border-2 border-dashed border-blue-900 rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""
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

        {/* جزئیات خدمت */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>جزئیات خدمت</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">قیمت (ریال)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">مدت زمان</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                  placeholder="2 ساعت"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">اولویت نمایش</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ویژگی‌ها */}
        <Card className="py-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ویژگی‌های اصلی</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addFeature("features")}
              >
                <Plus className="h-4 w-4 ml-1" />
                افزودن ویژگی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateFeature("features", index, e.target.value)}
                    placeholder="ویژگی خدمت (مثلا: پذیرایی ویژه)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature("features", index)}
                    disabled={formData.features.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* خدمات شامل شده */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>خدمات شامل شده</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addFeature("included")}
              >
                <Plus className="h-4 w-4 ml-1" />
                افزودن خدمت
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.included.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateFeature("included", index, e.target.value)}
                    placeholder="خدمت شامل شده (مثلا: ترانسفر فرودگاهی)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature("included", index)}
                    disabled={formData.included.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* خدمات شامل نشده */}
        <Card className="py-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>خدمات شامل نشده</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addFeature("notIncluded")}
              >
                <Plus className="h-4 w-4 ml-1" />
                افزودن خدمت
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.notIncluded.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateFeature("notIncluded", index, e.target.value)}
                    placeholder="خدمت شامل نشده (مثلا: هتل)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFeature("notIncluded", index)}
                    disabled={formData.notIncluded.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* سوالات متداول (FAQ) */}
        <Card className="py-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                سوالات متداول (FAQ)
              </CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addFaq}
              >
                <Plus className="h-4 w-4 ml-1" />
                افزودن سوال
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index} className="border border-blue-900">
                  <CardContent className="p-4 space-border-blue-900">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-gray-900">
                        سوال #{index + 1}
                      </h4>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          <Label htmlFor={`faq-active-${index}`} className="text-sm text-gray-600">
                            فعال
                          </Label>
                          <Switch
                            id={`faq-active-${index}`}
                            checked={faq.isActive}
                            onCheckedChange={(checked) => updateFaq(index, 'isActive', checked)}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeFaq(index)}
                          disabled={faqs.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="space-y-2">
                        <Label htmlFor={`faq-question-${index}`}>سوال</Label>
                        <Input
                          id={`faq-question-${index}`}
                          value={faq.question}
                          onChange={(e) => updateFaq(index, 'question', e.target.value)}
                          placeholder="مثلا: چگونه می‌توانم خدمت CIP را رزرو کنم؟"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`faq-answer-${index}`}>پاسخ</Label>
                        <Textarea
                          id={`faq-answer-${index}`}
                          value={faq.answer}
                          onChange={(e) => updateFaq(index, 'answer', e.target.value)}
                          rows={3}
                          placeholder="پاسخ کامل به سوال..."
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`faq-order-${index}`}>ترتیب نمایش</Label>
                        <Input
                          id={`faq-order-${index}`}
                          type="number"
                          value={faq.order}
                          onChange={(e) => updateFaq(index, 'order', parseInt(e.target.value) || 0)}
                          min="0"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent >
        </Card >

        {/* تنظیمات */}
        < Card className="py-6" >
          <CardHeader>
            <CardTitle>تنظیمات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published" className="text-base">خدمت فعال</Label>
                  <p className="text-sm text-muted-foreground">
                    نمایش این خدمت در سایت برای کاربران
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured" className="text-base">خدمت ویژه</Label>
                  <p className="text-sm text-muted-foreground">
                    نشان دادن این خدمت به عنوان خدمت ویژه
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="entry" className="text-base">ورودی</Label>
                  <p className="text-sm text-muted-foreground">
                    خدمت برای پرواز های ورودی فعال باشد؟
                  </p>
                </div>
                <Switch
                  id="entry"
                  checked={formData.entry}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, entry: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="deferent" className="text-base">خروجی</Label>
                  <p className="text-sm text-muted-foreground">
                    خدمت برای پرواز های خروجی فعال باشد؟
                  </p>
                </div>
                <Switch
                  id="deferent"
                  checked={formData.deferent}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, deferent: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card >

        {/* دکمه‌های اقدام */}
        < div className="flex gap-4 justify-end pt-6 border-t" >
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/cip")}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={loading || uploading} className="min-w-32">
            {loading ? (
              "در حال ایجاد..."
            ) : (
              <>
                ایجاد خدمت
                <ArrowRight className="h-4 w-4 mr-2" />
              </>
            )}
          </Button>
        </div >
      </form >
    </div >
  )
}