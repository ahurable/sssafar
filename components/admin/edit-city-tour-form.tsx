// components/admin/edit-city-tour-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, MapPin, Save, X } from "lucide-react"
import { MapSelector } from "./map-selector"

interface Price {
  id?: string
  type: string
  price: number
  currency: string
}

interface Inclusion {
  id?: string
  item: string
}

interface Exclusion {
  id?: string
  item: string
}

interface Itinerary {
  id?: string
  order: number
  title: string
  description: string
  duration: number
}

interface CityTour {
  id: string
  title: string
  slug: string
  description: string
  shortDescription: string
  city: string
  location: string
  latitude?: number
  longitude?: number
  meetingPoint: string
  meetingLatitude?: number
  meetingLongitude?: number
  duration: number
  maxCapacity: number
  featured: boolean
  isActive: boolean
  images: string[]
  prices: Price[]
  inclusions: Inclusion[]
  exclusions: Exclusion[]
  itineraries: Itinerary[]
}

interface EditCityTourFormProps {
  tour: CityTour
}

export function EditCityTourForm({ tour }: EditCityTourFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(
    tour.latitude && tour.longitude ? {
      lat: tour.latitude,
      lng: tour.longitude,
      address: tour.location
    } : null
  )
  const [selectedMeetingPoint, setSelectedMeetingPoint] = useState<{ lat: number; lng: number; address: string } | null>(
    tour.meetingLatitude && tour.meetingLongitude ? {
      lat: tour.meetingLatitude,
      lng: tour.meetingLongitude,
      address: tour.meetingPoint
    } : null
  )

  const [formData, setFormData] = useState({
    title: tour.title,
    slug: tour.slug,
    description: tour.description,
    shortDescription: tour.shortDescription,
    city: tour.city,
    location: tour.location,
    duration: tour.duration.toString(),
    maxCapacity: tour.maxCapacity.toString(),
    featured: tour.featured,
    isActive: tour.isActive,
    images: tour.images
  })

  const [prices, setPrices] = useState<Price[]>(tour.prices)
  const [inclusions, setInclusions] = useState<Inclusion[]>(tour.inclusions)
  const [exclusions, setExclusions] = useState<Exclusion[]>(tour.exclusions)
  const [itineraries, setItineraries] = useState<Itinerary[]>(tour.itineraries)

  const handleInputChange = (field: string, value: string | boolean | string[]) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePriceChange = (index: number, field: keyof Price, value: string | number) => {
    const newPrices = [...prices]
    newPrices[index] = { ...newPrices[index], [field]: value }
    setPrices(newPrices)
  }

  const addPrice = () => {
    setPrices([...prices, { type: "", price: 0, currency: "IRR" }])
  }

  const removePrice = (index: number) => {
    if (prices.length > 1) {
      setPrices(prices.filter((_, i) => i !== index))
    }
  }

  const addInclusion = () => {
    setInclusions([...inclusions, { item: "" }])
  }

  const updateInclusion = (index: number, value: string) => {
    const newInclusions = [...inclusions]
    newInclusions[index] = { ...newInclusions[index], item: value }
    setInclusions(newInclusions)
  }

  const removeInclusion = (index: number) => {
    if (inclusions.length > 1) {
      setInclusions(inclusions.filter((_, i) => i !== index))
    }
  }

  const addExclusion = () => {
    setExclusions([...exclusions, { item: "" }])
  }

  const updateExclusion = (index: number, value: string) => {
    const newExclusions = [...exclusions]
    newExclusions[index] = { ...newExclusions[index], item: value }
    setExclusions(newExclusions)
  }

  const removeExclusion = (index: number) => {
    if (exclusions.length > 1) {
      setExclusions(exclusions.filter((_, i) => i !== index))
    }
  }

  const addItinerary = () => {
    setItineraries([...itineraries, { 
      order: itineraries.length + 1, 
      title: "", 
      description: "", 
      duration: 0 
    }])
  }

  const updateItinerary = (index: number, field: string, value: string | number) => {
    const newItineraries = [...itineraries]
    newItineraries[index] = { ...newItineraries[index], [field]: value }
    setItineraries(newItineraries)
  }

  const removeItinerary = (index: number) => {
    if (itineraries.length > 1) {
      const filteredItineraries = itineraries
        .filter((_, i) => i !== index)
        .map((item, idx) => ({ ...item, order: idx + 1 }))
      setItineraries(filteredItineraries)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/city-tours/${tour.id}`, {
        method: "PUT",
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
        alert(error.error || "خطا در ویرایش گشت شهری")
      }
    } catch (error) {
      console.error("Error updating city tour:", error)
      alert("خطا در ویرایش گشت شهری")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8" dir="rtl">
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
                className="text-right"
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => handleInputChange("slug", e.target.value)}
                required
                placeholder="paris-city-tour"
                className="text-right"
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
              className="text-right"
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
              placeholder="توضیحات کامل درباره گشت"
              className="text-right"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">شهر *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => handleInputChange("city", e.target.value)}
                required
                placeholder="مثلا: پاریس"
                className="text-right"
              />
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
                className="text-right"
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
                className="text-right"
              />
            </div>
          </div>
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
          </div>

          <div>
            <Label>نقطه تجمع</Label>
            <MapSelector
              onLocationSelect={setSelectedMeetingPoint}
              selectedLocation={selectedMeetingPoint}
            />
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
                  className="text-right"
                />
              </div>
              <div className="flex-1">
                <Label>قیمت (تومان)</Label>
                <Input
                  type="number"
                  value={price.price}
                  onChange={(e) => handlePriceChange(index, "price", parseInt(e.target.value) || 0)}
                  min="0"
                  className="text-right"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removePrice(index)}
                disabled={prices.length === 1}
                className="mb-1"
              >
                <Trash2 className="h-4 w-4 ml-2" />
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
            {inclusions.map((inclusion, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={inclusion.item}
                  onChange={(e) => updateInclusion(index, e.target.value)}
                  placeholder="مثلا: ترانسفر فرودگاهی"
                  className="text-right"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeInclusion(index)}
                  disabled={inclusions.length === 1}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
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
            {exclusions.map((exclusion, index) => (
              <div key={index} className="flex gap-2">
                <Input
                  value={exclusion.item}
                  onChange={(e) => updateExclusion(index, e.target.value)}
                  placeholder="مثلا: بیمه مسافرتی"
                  className="text-right"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeExclusion(index)}
                  disabled={exclusions.length === 1}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
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
          {itineraries.map((itinerary, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">مرحله {itinerary.order}</h4>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeItinerary(index)}
                  disabled={itineraries.length === 1}
                >
                  <Trash2 className="h-4 w-4 ml-2" />
                </Button>
              </div>
              
              <div>
                <Label>عنوان مرحله</Label>
                <Input
                  value={itinerary.title}
                  onChange={(e) => updateItinerary(index, "title", e.target.value)}
                  placeholder="مثلا: بازدید از برج ایفل"
                  className="text-right"
                />
              </div>
              
              <div>
                <Label>توضیحات</Label>
                <Textarea
                  value={itinerary.description}
                  onChange={(e) => updateItinerary(index, "description", e.target.value)}
                  rows={3}
                  placeholder="توضیحات کامل این مرحله از سفر"
                  className="text-right"
                />
              </div>
              
              <div className="w-48">
                <Label>مدت زمان (دقیقه)</Label>
                <Input
                  type="number"
                  value={itinerary.duration}
                  onChange={(e) => updateItinerary(index, "duration", parseInt(e.target.value) || 0)}
                  min="0"
                  className="text-right"
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
          disabled={loading}
          className="flex-1"
          size="lg"
        >
          <Save className="h-4 w-4 ml-2" />
          {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          className="flex-1"
          size="lg"
        >
          <X className="h-4 w-4 ml-2" />
          انصراف
        </Button>
      </div>
    </form>
  )
}