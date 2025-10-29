// components/admin/edit-tour-form.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Calendar, Save, X } from "lucide-react"
import { TourImageUpload } from "./tour-image-upload"
import { toast } from "sonner"

interface Price {
  id?: string
  type: string
  price: number
  description: string
}

interface Itinerary {
  id?: string
  day: number
  title: string
  description: string
  activities: any
}

interface Route {
  id?: string
  order: number
  city: string
  country: string
  duration: number
  description: string
}

interface Rule {
  id?: string
  title: string
  description: string
}

interface Transport {
  id?: string
  type: string
  departure: Date
  arrival: Date
  fromCity: string
  toCity: string
  carrier: string
  flightNumber: string
  trainNumber: string
}

interface TourImage {
  id: string
  filename: string
  path: string
  altText?: string
  isPrimary: boolean
  order: number
}

interface EditTourFormProps {
  tour: {
    id: string
    title: string
    description: string
    startDate: Date
    endDate: Date
    featured: boolean
    isActive: boolean
    prices: Price[]
    itineraries: Itinerary[]
    routes: Route[]
    rules: Rule[]
    transports: Transport[]
    images: TourImage[]
  }
}

// Helper function to format date for datetime-local input
const formatDateForInput = (date: Date): string => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  
  return `${year}-${month}-${day}`
}

// Helper function to format datetime for datetime-local input
const formatDateTimeForInput = (date: Date): string => {
  if (!date) return ''
  
  const d = new Date(date)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export function EditTourForm({ tour }: EditTourFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: tour.title,
    description: tour.description,
    startDate: formatDateForInput(tour.startDate),
    endDate: formatDateForInput(tour.endDate),
    featured: tour.featured,
    isActive: tour.isActive,
  })

  const [prices, setPrices] = useState<Price[]>(tour.prices)
  const [itineraries, setItineraries] = useState<Itinerary[]>(tour.itineraries)
  const [routes, setRoutes] = useState<Route[]>(tour.routes)
  const [rules, setRules] = useState<Rule[]>(tour.rules)
  const [transports, setTransports] = useState<Transport[]>(
    tour.transports.map(t => ({
      ...t,
      departure: t.departure,
      arrival: t.arrival
    }))
  )
  const [images, setImages] = useState<TourImage[]>(tour.images)

  // Convert transport dates for display in form
  const getTransportFormData = () => {
    return transports.map(transport => ({
      ...transport,
      departure: formatDateTimeForInput(transport.departure),
      arrival: formatDateTimeForInput(transport.arrival)
    }))
  }

  const [transportFormData, setTransportFormData] = useState(getTransportFormData())

  // Price Management
  const addPrice = () => {
    setPrices([...prices, { type: "ADULT", price: 0, description: "" }])
  }

  const removePrice = (index: number) => {
    if (prices.length > 1) {
      setPrices(prices.filter((_, i) => i !== index))
    }
  }

  const updatePrice = (index: number, field: string, value: any) => {
    const updated = [...prices]
    updated[index] = { ...updated[index], [field]: value }
    setPrices(updated)
  }

  // Itinerary Management
  const addItinerary = () => {
    setItineraries([...itineraries, { 
      day: itineraries.length + 1, 
      title: "", 
      description: "", 
      activities: null 
    }])
  }

  const removeItinerary = (index: number) => {
    if (itineraries.length > 1) {
      setItineraries(itineraries.filter((_, i) => i !== index))
    }
  }

  const updateItinerary = (index: number, field: string, value: any) => {
    const updated = [...itineraries]
    updated[index] = { ...updated[index], [field]: value }
    setItineraries(updated)
  }

  // Route Management
  const addRoute = () => {
    setRoutes([...routes, { 
      order: routes.length + 1, 
      city: "", 
      country: "", 
      duration: 1, 
      description: "" 
    }])
  }

  const removeRoute = (index: number) => {
    if (routes.length > 1) {
      setRoutes(routes.filter((_, i) => i !== index))
    }
  }

  const updateRoute = (index: number, field: string, value: any) => {
    const updated = [...routes]
    updated[index] = { ...updated[index], [field]: value }
    setRoutes(updated)
  }

  // Rule Management
  const addRule = () => {
    setRules([...rules, { title: "", description: "" }])
  }

  const removeRule = (index: number) => {
    if (rules.length > 1) {
      setRules(rules.filter((_, i) => i !== index))
    }
  }

  const updateRule = (index: number, field: string, value: any) => {
    const updated = [...rules]
    updated[index] = { ...updated[index], [field]: value }
    setRules(updated)
  }

  // Transport Management
  const addTransport = () => {
    const newTransport = { 
      type: "FLIGHT", 
      departure: new Date(), 
      arrival: new Date(), 
      fromCity: "", 
      toCity: "", 
      carrier: "", 
      flightNumber: "", 
      trainNumber: "" 
    }
    
    setTransports([...transports, newTransport])
    setTransportFormData([...transportFormData, {
      ...newTransport,
      departure: formatDateTimeForInput(newTransport.departure),
      arrival: formatDateTimeForInput(newTransport.arrival)
    }])
  }

  const removeTransport = (index: number) => {
    if (transports.length > 1) {
      setTransports(transports.filter((_, i) => i !== index))
      setTransportFormData(transportFormData.filter((_, i) => i !== index))
    }
  }

  const updateTransport = (index: number, field: string, value: any) => {
    const updatedTransports = [...transports]
    const updatedFormData = [...transportFormData]

    if (field === 'departure' || field === 'arrival') {
      // Update form data for display
      updatedFormData[index] = { ...updatedFormData[index], [field]: value }
      setTransportFormData(updatedFormData)

      // Update actual transport data with Date object
      updatedTransports[index] = { 
        ...updatedTransports[index], 
        [field]: new Date(value) 
      }
    } else {
      // Update both form data and transport data
      updatedFormData[index] = { ...updatedFormData[index], [field]: value }
      updatedTransports[index] = { ...updatedTransports[index], [field]: value }
      setTransportFormData(updatedFormData)
    }

    setTransports(updatedTransports)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/tours/${tour.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          prices: prices.filter(p => p.price > 0),
          itineraries: itineraries.filter(i => i.title && i.description),
          routes: routes.filter(r => r.city && r.country),
          rules: rules.filter(r => r.title && r.description),
          transports: transports.filter(t => t.fromCity && t.toCity)
        }),
      })

      const data = await response.json()

      if (response.ok) {
        toast.success("تور با موفقیت به روزرسانی شد")
        router.push("/admin/tours")
        router.refresh()
      } else {
        toast.error(data.error || "خطا در به روزرسانی تور")
      }
    } catch (error) {
      console.error("Error updating tour:", error)
      toast.error("خطا در به روزرسانی تور")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    router.push("/admin/tours")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* اطلاعات اصلی تور */}
      <Card>
        <CardHeader>
          <CardTitle>اطلاعات اصلی تور</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان تور *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">توضیحات تور *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startDate">تاریخ شروع *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">تاریخ پایان *</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              />
              <Label>تور ویژه</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label>فعال</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Management */}
      <TourImageUpload 
        tourId={tour.id}
        images={images}
        onImagesChange={setImages}
      />

      {/* قیمت‌ها */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قیمت‌ها</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addPrice}>
              <Plus className="h-4 w-4 ml-1" />
              افزودن قیمت
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {prices.map((price, index) => (
            <div key={price.id || index} className="flex gap-4 items-start p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>نوع قیمت</Label>
                  <select
                    value={price.type}
                    onChange={(e) => updatePrice(index, "type", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="ADULT">بزرگسال</option>
                    <option value="CHILD">کودک</option>
                    <option value="INFANT">نوزاد</option>
                    <option value="STUDENT">دانشجو</option>
                    <option value="SENIOR">سالمند</option>
                  </select>
                </div>
                <div>
                  <Label>قیمت (تومان)</Label>
                  <Input
                    type="number"
                    value={price.price}
                    onChange={(e) => updatePrice(index, "price", parseFloat(e.target.value) || 0)}
                    min="0"
                  />
                </div>
                <div>
                  <Label>توضیحات (اختیاری)</Label>
                  <Input
                    value={price.description}
                    onChange={(e) => updatePrice(index, "description", e.target.value)}
                  />
                </div>
              </div>
              {prices.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removePrice(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* برنامه سفر */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>برنامه سفر</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItinerary}>
              <Plus className="h-4 w-4 ml-1" />
              افزودن روز
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {itineraries.map((itinerary, index) => (
            <div key={itinerary.id || index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">روز {itinerary.day}</h4>
                {itineraries.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItinerary(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>عنوان روز</Label>
                  <Input
                    value={itinerary.title}
                    onChange={(e) => updateItinerary(index, "title", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>توضیحات برنامه</Label>
                  <Textarea
                    value={itinerary.description}
                    onChange={(e) => updateItinerary(index, "description", e.target.value)}
                    rows={3}
                    required
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* مسیر تور */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>مسیر تور</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRoute}>
              <Plus className="h-4 w-4 ml-1" />
              افزودن مقصد
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {routes.map((route, index) => (
            <div key={route.id || index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium">مقصد {index + 1}</h4>
                {routes.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRoute(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>شهر *</Label>
                  <Input
                    value={route.city}
                    onChange={(e) => updateRoute(index, "city", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>کشور *</Label>
                  <Input
                    value={route.country}
                    onChange={(e) => updateRoute(index, "country", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>مدت اقامت (روز)</Label>
                  <Input
                    type="number"
                    value={route.duration}
                    onChange={(e) => updateRoute(index, "duration", parseInt(e.target.value) || 1)}
                    min="1"
                  />
                </div>
                <div>
                  <Label>توضیحات (اختیاری)</Label>
                  <Input
                    value={route.description}
                    onChange={(e) => updateRoute(index, "description", e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* قوانین تور */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>قوانین تور</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addRule}>
              <Plus className="h-4 w-4 ml-1" />
              افزودن قانون
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {rules.map((rule, index) => (
            <div key={rule.id || index} className="flex gap-4 items-start p-4 border rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>عنوان قانون *</Label>
                  <Input
                    value={rule.title}
                    onChange={(e) => updateRule(index, "title", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>توضیحات قانون *</Label>
                  <Input
                    value={rule.description}
                    onChange={(e) => updateRule(index, "description", e.target.value)}
                    required
                  />
                </div>
              </div>
              {rules.length > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRule(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* حمل و نقل */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>حمل و نقل</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addTransport}>
              <Plus className="h-4 w-4 ml-1" />
              افزودن مسیر
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {transportFormData.map((transport, index) => (
            <div key={transport.id || index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">مسیر حمل و نقل {index + 1}</h4>
                {transportFormData.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTransport(index)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>نوع حمل و نقل *</Label>
                  <select
                    value={transport.type}
                    onChange={(e) => updateTransport(index, "type", e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="FLIGHT">پرواز</option>
                    <option value="TRAIN">قطار</option>
                    <option value="BUS">اتوبوس</option>
                    <option value="FERRY">کشتی</option>
                  </select>
                </div>
                <div>
                  <Label>شرکت حمل کننده</Label>
                  <Input
                    value={transport.carrier}
                    onChange={(e) => updateTransport(index, "carrier", e.target.value)}
                  />
                </div>
                <div>
                  <Label>شهر مبدا *</Label>
                  <Input
                    value={transport.fromCity}
                    onChange={(e) => updateTransport(index, "fromCity", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>شهر مقصد *</Label>
                  <Input
                    value={transport.toCity}
                    onChange={(e) => updateTransport(index, "toCity", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>تاریخ و زمان حرکت *</Label>
                  <Input
                    type="datetime-local"
                    value={transport.departure}
                    onChange={(e) => updateTransport(index, "departure", e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>تاریخ و زمان رسیدن *</Label>
                  <Input
                    type="datetime-local"
                    value={transport.arrival}
                    onChange={(e) => updateTransport(index, "arrival", e.target.value)}
                    required
                  />
                </div>
                {transport.type === "FLIGHT" && (
                  <div>
                    <Label>شماره پرواز</Label>
                    <Input
                      value={transport.flightNumber}
                      onChange={(e) => updateTransport(index, "flightNumber", e.target.value)}
                    />
                  </div>
                )}
                {transport.type === "TRAIN" && (
                  <div>
                    <Label>شماره قطار</Label>
                    <Input
                      value={transport.trainNumber}
                      onChange={(e) => updateTransport(index, "trainNumber", e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4 sticky bottom-4 bg-background p-4 rounded-lg border shadow-lg">
        <Button type="submit" disabled={loading} className="flex-1">
          <Save className="h-4 w-4 ml-2" />
          {loading ? "در حال ذخیره..." : "ذخیره تغییرات"}
        </Button>
        <Button type="button" variant="outline" onClick={handleCancel}>
          <X className="h-4 w-4 ml-2" />
          انصراف
        </Button>
      </div>
    </form>
  )
}