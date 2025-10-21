// components/admin/create-tour-form.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Calendar } from "lucide-react"

interface Price {
  type: string
  price: number
  description: string
}

interface Itinerary {
  day: number
  title: string
  description: string
  activities: any
}

interface Route {
  order: number
  city: string
  country: string
  duration: number
  description: string
}

interface Rule {
  title: string
  description: string
}

interface Transport {
  type: string
  departure: string
  arrival: string
  fromCity: string
  toCity: string
  carrier: string
  flightNumber: string
  trainNumber: string
}

export function CreateTourForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    featured: false,
    isActive: true,
  })

  const [prices, setPrices] = useState<Price[]>([
    { type: "ADULT", price: 0, description: "" }
  ])
  
  const [itineraries, setItineraries] = useState<Itinerary[]>([
    { day: 1, title: "", description: "", activities: null }
  ])
  
  const [routes, setRoutes] = useState<Route[]>([
    { order: 1, city: "", country: "", duration: 1, description: "" }
  ])
  
  const [rules, setRules] = useState<Rule[]>([
    { title: "", description: "" }
  ])
  
  const [transports, setTransports] = useState<Transport[]>([
    { 
      type: "FLIGHT", 
      departure: "", 
      arrival: "", 
      fromCity: "", 
      toCity: "", 
      carrier: "", 
      flightNumber: "", 
      trainNumber: "" 
    }
  ])

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

  // توابع مشابه برای itineraries, routes, rules, transports
  const addItinerary = () => {
    setItineraries([...itineraries, { day: itineraries.length + 1, title: "", description: "", activities: null }])
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

  const addRoute = () => {
    setRoutes([...routes, { order: routes.length + 1, city: "", country: "", duration: 1, description: "" }])
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

  const addTransport = () => {
    setTransports([...transports, { 
      type: "FLIGHT", 
      departure: "", 
      arrival: "", 
      fromCity: "", 
      toCity: "", 
      carrier: "", 
      flightNumber: "", 
      trainNumber: "" 
    }])
  }

  const removeTransport = (index: number) => {
    if (transports.length > 1) {
      setTransports(transports.filter((_, i) => i !== index))
    }
  }

  const updateTransport = (index: number, field: string, value: any) => {
    const updated = [...transports]
    updated[index] = { ...updated[index], [field]: value }
    setTransports(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch("/api/admin/tours", {
        method: "POST",
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
        router.push("/admin/tours")
        router.refresh()
      } else {
        alert(data.error || "خطا در ایجاد تور")
      }
    } catch (error) {
      console.error("Error creating tour:", error)
      alert("خطا در ایجاد تور")
    } finally {
      setLoading(false)
    }
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
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="endDate">تاریخ پایان *</Label>
              <Input
                id="endDate"
                type="datetime-local"
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
            <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
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
                    onChange={(e) => updatePrice(index, "price", parseFloat(e.target.value))}
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
            <div key={index} className="p-4 border rounded-lg space-y-4">
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
            <div key={index} className="p-4 border rounded-lg">
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
                    onChange={(e) => updateRoute(index, "duration", parseInt(e.target.value))}
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
            <div key={index} className="flex gap-4 items-start p-4 border rounded-lg">
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
          {transports.map((transport, index) => (
            <div key={index} className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">مسیر حمل و نقل {index + 1}</h4>
                {transports.length > 1 && (
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

      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading ? "در حال ایجاد..." : "ایجاد تور"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/tours")}>
          انصراف
        </Button>
      </div>
    </form>
  )
}