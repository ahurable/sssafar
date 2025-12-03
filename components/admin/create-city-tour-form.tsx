// components/admin/create-city-tour-form.tsx
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, MapPin, Calendar, Upload, X } from "lucide-react"
import MapSelector from "@/components/admin/leaflet-map"
import Link from "next/link"

interface Price {
  type: string
  price: number
  date: Date
  currency: string
}

interface Inclusion {
  id: string
  item: string
}

interface Exclusion {
  id: string
  item: string
}

interface Itinerary {
  id: string
  order: number
  title: string
  description: string
  duration: number
}

interface City {
  id: string
  name: string
  description: string
  image: string
}

export function CreateCityTourForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<{ lat: number; lng: number; address: string } | null>(null)

  const [cities, setCities] = useState<City[]>([])
  const [citiesLoading, setCitiesLoading] = useState(true)
  const [images, setImages] = useState<string[]>([])

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    shortDescription: "",
    cityId: "",
    city: "",
    location: "",
    duration: "",
    maxCapacity: "",
    featured: false,
    isActive: true,
  })

  useEffect(() => {
    const fetchTourCities = async () => {
      try {
        const response = await fetch("/api/admin/tours/cities")
        const data = await response.json()
        if (response.ok) {
          setCities(data.cities || [])
        }
      } catch (error) {
        console.error("Error fetching tour cities:", error)
      } finally {
        setCitiesLoading(false)
      }
    }

    fetchTourCities()
  }, [])

  const today = new Date()

  const [prices, setPrices] = useState<Price[]>([
    { type: "بزرگسال", price: 0, currency: "IRR", date: today },
    { type: "کودک", price: 0, currency: "IRR", date: today }
  ])

  const [inclusions, setInclusions] = useState<Inclusion[]>([{ id: "1", item: "" }])
  const [exclusions, setExclusions] = useState<Exclusion[]>([{ id: "1", item: "" }])
  const [itineraries, setItineraries] = useState<Itinerary[]>([
    { id: "1", order: 1, title: "", description: "", duration: 0 }
  ])

  const formatDate = (date: any) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePriceChange = (index: number, field: keyof Price, value: string | number | Date) => {
    const newPrices = [...prices]
    newPrices[index] = { ...newPrices[index], [field]: value }
    setPrices(newPrices)
  }

  const addPrice = () => {
    setPrices([...prices, { type: "", price: 0, currency: "IRR", date: today }])
  }

  const removePrice = (index: number) => {
    if (prices.length > 1) {
      setPrices(prices.filter((_, i) => i !== index))
    }
  }

  const addInclusion = () => {
    setInclusions([...inclusions, { id: Date.now().toString(), item: "" }])
  }

  const updateInclusion = (id: string, value: string) => {
    setInclusions(inclusions.map(item =>
      item.id === id ? { ...item, item: value } : item
    ))
  }

  const removeInclusion = (id: string) => {
    if (inclusions.length > 1) {
      setInclusions(inclusions.filter(item => item.id !== id))
    }
  }

  const addExclusion = () => {
    setExclusions([...exclusions, { id: Date.now().toString(), item: "" }])
  }

  const updateExclusion = (id: string, value: string) => {
    setExclusions(exclusions.map(item =>
      item.id === id ? { ...item, item: value } : item
    ))
  }

  const removeExclusion = (id: string) => {
    if (exclusions.length > 1) {
      setExclusions(exclusions.filter(item => item.id !== id))
    }
  }

  const addItinerary = () => {
    setItineraries([...itineraries, {
      id: Date.now().toString(),
      order: itineraries.length + 1,
      title: "",
      description: "",
      duration: 0
    }])
  }

  const updateItinerary = (id: string, field: string, value: string | number) => {
    setItineraries(itineraries.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const removeItinerary = (id: string) => {
    if (itineraries.length > 1) {
      const filteredItineraries = itineraries
        .filter(item => item.id !== id)
        .map((item, index) => ({ ...item, order: index + 1 }))
      setItineraries(filteredItineraries)
    }
  }

  // Image upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploading(true)
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const data = await response.json()
          setImages(prev => [...prev, data.url])
        } else {
          console.error('Upload failed for file:', file.name)
        }
      }
    } catch (error) {
      console.error('Error uploading images:', error)
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/city-tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          location: selectedLocation?.address || formData.location,
          latitude: selectedLocation?.lat,
          longitude: selectedLocation?.lng,
          meetingPoint: selectedMeetingPoint?.address,
          meetingLatitude: selectedMeetingPoint?.lat,
          meetingLongitude: selectedMeetingPoint?.lng,
          duration: parseInt(formData.duration) || 0,
          maxCapacity: parseInt(formData.maxCapacity) || 0,
          images: images,
          prices: prices.filter(p => p.type && p.price > 0),
          inclusions: inclusions.filter(i => i.item.trim() !== ""),
          exclusions: exclusions.filter(i => i.item.trim() !== ""),
          itineraries: itineraries
            .filter(i => i.title.trim() !== "")
            .map((it, index) => ({ ...it, order: index + 1 })),
        }),
      })

      if (response.ok) {
        router.push("/admin/citytours")
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.error || "خطا در ایجاد گشت شهری")
      }
    } catch (error) {
      console.error("Error creating city tour:", error)
      alert("خطا در ایجاد گشت شهری")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* اطلاعات اصلی */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>اطلاعات اصلی گشت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">عنوان گشت *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                required
                placeholder="مثلا: گشت شهری پاریس"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="shortDescription">توضیح کوتاه *</Label>
            <Textarea
              id="shortDescription"
              value={formData.shortDescription}
              onChange={(e) => handleInputChange("shortDescription", e.target.value)}
              required
              rows={2}
              placeholder="توضیح مختصر درباره گشت"
            />
          </div>

          <div>
            <Label htmlFor="description">توضیحات کامل *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              required
              rows={4}
              placeholder="توضیحات کامل درباره گشت، امکانات و تجربه‌ای که مسافر خواهد داشت"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="tourCityId">شهر تور</Label>
              <select
                id="cityId"
                value={formData.cityId}
                onChange={(e) => setFormData({ ...formData, cityId: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                <option value="">انتخاب شهر (اختیاری)</option>
                {citiesLoading ? (
                  <option value="" disabled>در حال بارگذاری...</option>
                ) : (
                  cities.map((city) => (
                    <option key={city.id} value={city.id}>
                      {city.name}
                    </option>
                  ))
                )}
              </select>
              <p className="text-sm text-muted-foreground mt-1">
                اگر شهر مورد نظر در لیست نیست، <Link href="/admin/tours/city/new" className="text-blue-600 hover:underline">از اینجا ایجاد کنید</Link>
              </p>
            </div>
            <div>
              <Label htmlFor="duration">مدت زمان (دقیقه) *</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration}
                onChange={(e) => handleInputChange("duration", e.target.value)}
                required
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="maxCapacity">ظرفیت *</Label>
              <Input
                id="maxCapacity"
                type="number"
                value={formData.maxCapacity}
                onChange={(e) => handleInputChange("maxCapacity", e.target.value)}
                required
                min="1"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* آپلود تصاویر */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>تصاویر گشت</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>آپلود تصاویر</Label>
            <div className="border-2 border-dashed border-blue-900 rounded-lg p-6 text-center">
              <Input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploading}
                className="hidden"
                id="image-upload"
              />
              <Label
                htmlFor="image-upload"
                className="cursor-pointer flex flex-col items-center justify-center space-y-2"
              >
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {uploading ? "در حال آپلود..." : "برای آپلود تصاویر کلیک کنید یا فایل‌ها را اینجا بکشید"}
                </span>
                <span className="text-xs text-gray-500">فرمت‌های مجاز: JPG, PNG, WebP</span>
              </Label>
            </div>
          </div>

          {/* Preview uploaded images */}
          {images.length > 0 && (
            <div>
              <Label>تصاویر آپلود شده:</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Uploaded ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* موقعیت مکانی */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>موقعیت مکانی</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label>موقعیت اصلی گشت روی نقشه</Label>
            <MapSelector
              onLocationSelect={setSelectedLocation}
              selectedLocation={selectedLocation}
            />
            {selectedLocation && (
              <div className="mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 inline ml-1" />
                {selectedLocation.address}
              </div>
            )}
          </div>

          <div>
            <Label>نقطه تجمع</Label>
            <MapSelector
              onLocationSelect={setSelectedMeetingPoint}
              selectedLocation={selectedMeetingPoint}
            />
            {selectedMeetingPoint && (
              <div className="mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 inline ml-1" />
                {selectedMeetingPoint.address}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* قیمت‌ها */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>قیمت‌ها</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {prices.map((price, index) => (
            <div key={index} className="flex gap-4 items-end">
              <div className="flex-1">
                <Label>نوع</Label>
                <Input
                  value={price.type}
                  onChange={(e) => handlePriceChange(index, "type", e.target.value)}
                  placeholder="مثلا: بزرگسال، کودک"
                />
              </div>
              <div className="flex-1">
                <Label>قیمت (تومان)</Label>
                <Input
                  type="number"
                  value={price.price}
                  onChange={(e) => handlePriceChange(index, "price", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              {/* تاریخ شروع و پایان */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">تاریخ شروع *</Label>
                  <Input
                    id={`startDate-${index}`}
                    type="date"
                    value={formatDate(price.date)}
                    onChange={(e) =>
                      handlePriceChange(index, "date", new Date(e.target.value))
                    }
                    required
                  />
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePrice(index)}
                disabled={prices.length === 1}
                className="mb-1"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addPrice}>
            <Plus className="h-4 w-4 ml-2" />
            افزودن قیمت
          </Button>
        </CardContent>
      </Card>

      {/* شامل‌ها و غیر شامل‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="py-6">
          <CardHeader>
            <CardTitle>شامل‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {inclusions.map((inclusion) => (
              <div key={inclusion.id} className="flex gap-2">
                <Input
                  value={inclusion.item}
                  onChange={(e) => updateInclusion(inclusion.id, e.target.value)}
                  placeholder="مثلا: ترانسفر فرودگاهی"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeInclusion(inclusion.id)}
                  disabled={inclusions.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addInclusion}>
              <Plus className="h-4 w-4 ml-2" />
              افزودن
            </Button>
          </CardContent>
        </Card>

        <Card className="py-6">
          <CardHeader>
            <CardTitle>غیر شامل‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {exclusions.map((exclusion) => (
              <div key={exclusion.id} className="flex gap-2">
                <Input
                  value={exclusion.item}
                  onChange={(e) => updateExclusion(exclusion.id, e.target.value)}
                  placeholder="مثلا: بیمه مسافرتی"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeExclusion(exclusion.id)}
                  disabled={exclusions.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button type="button" variant="outline" onClick={addExclusion}>
              <Plus className="h-4 w-4 ml-2" />
              افزودن
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* برنامه سفر */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>برنامه سفر</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {itineraries.map((itinerary) => (
            <div key={itinerary.id} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">مرحله {itinerary.order}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItinerary(itinerary.id)}
                  disabled={itineraries.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div>
                <Label>عنوان مرحله</Label>
                <Input
                  value={itinerary.title}
                  onChange={(e) => updateItinerary(itinerary.id, "title", e.target.value)}
                  placeholder="مثلا: بازدید از برج ایفل"
                />
              </div>

              <div>
                <Label>توضیحات</Label>
                <Textarea
                  value={itinerary.description}
                  onChange={(e) => updateItinerary(itinerary.id, "description", e.target.value)}
                  rows={3}
                  placeholder="توضیحات کامل این مرحله از سفر"
                />
              </div>

              <div className="w-48">
                <Label>مدت زمان (دقیقه)</Label>
                <Input
                  type="number"
                  value={itinerary.duration}
                  onChange={(e) => updateItinerary(itinerary.id, "duration", parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
            </div>
          ))}

          <Button type="button" variant="outline" onClick={addItinerary}>
            <Plus className="h-4 w-4 ml-2" />
            افزودن مرحله جدید
          </Button>
        </CardContent>
      </Card>

      {/* تنظیمات */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>تنظیمات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="featured" className="cursor-pointer">
              تور ویژه
            </Label>
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => handleInputChange("featured", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="isActive" className="cursor-pointer">
              فعال
            </Label>
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => handleInputChange("isActive", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 pt-6">
        <Button
          type="submit"
          disabled={loading || uploading}
          className="flex-1"
          size="lg"
        >
          {loading ? "در حال ایجاد..." : uploading ? "در حال آپلود..." : "ایجاد گشت شهری"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
          size="lg"
        >
          انصراف
        </Button>
      </div>
    </form>
  )
}