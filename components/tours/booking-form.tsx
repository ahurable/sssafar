// components/tours/booking-form.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"

interface BookingFormProps {
  tour: {
    id: string
    title: string
    prices: { type: string; price: number; description?: string }[]
  }
}

interface Passenger {
  firstName: string
  lastName: string
  nationalId: string
  dateOfBirth: string
  passengerType: string
}

export function BookingForm({ tour }: BookingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [passengers, setPassengers] = useState<Passenger[]>([
    { firstName: '', lastName: '', nationalId: '', dateOfBirth: '', passengerType: 'ADULT' }
  ])
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    notes: ''
  })

  const addPassenger = () => {
    setPassengers([...passengers, { 
      firstName: '', 
      lastName: '', 
      nationalId: '', 
      dateOfBirth: '', 
      passengerType: 'ADULT' 
    }])
  }

  const removePassenger = (index: number) => {
    if (passengers.length > 1) {
      setPassengers(passengers.filter((_, i) => i !== index))
    }
  }

  const updatePassenger = (index: number, field: string, value: string) => {
    const updated = [...passengers]
    updated[index] = { ...updated[index], [field]: value }
    setPassengers(updated)
  }

  const calculateTotal = () => {
    return passengers.reduce((total, passenger) => {
      const price = tour.prices.find(p => p.type === passenger.passengerType)
      return total + (price?.price || 0)
    }, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tourId: tour.id,
          passengers,
          contactInfo,
          totalPrice: calculateTotal()
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/bookings/${data.booking.id}`)
      } else {
        alert(data.error || 'خطا در ثبت درخواست')
      }
    } catch (error) {
      console.error('Error submitting booking:', error)
      alert('خطا در ثبت درخواست')
    } finally {
      setLoading(false)
    }
  }

  const getPriceTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      ADULT: 'بزرگسال',
      CHILD: 'کودک',
      INFANT: 'نوزاد',
      STUDENT: 'دانشجو',
      SENIOR: 'سالمند'
    }
    return labels[type] || type
  }

  return (
    <Card className="sticky top-4 py-6  ">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-600">درخواست رزرو</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Passengers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>ثبت درخواست</Label>
            </div>
            <div className="grid grid-cols-12">
                <div className="col-span-12">
                    <Input placeholder="نام و نام خانوادگی خود را وارد کنید" />
                </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <Label>اطلاعات تماس</Label>
            
            <div>
              <Label>ایمیل</Label>
              <Input
                type="email"
                value={contactInfo.email}
                onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>شماره تماس</Label>
              <Input
                type="tel"
                value={contactInfo.phone}
                onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>توضیحات (اختیاری)</Label>
              <Input
                value={contactInfo.notes}
                onChange={(e) => setContactInfo({ ...contactInfo, notes: e.target.value })}
                placeholder="درخواست‌های خاص یا توضیحات اضافی"
              />
            </div>
          </div>

          {/* Total Price */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-muted-foreground">قیمت کل:</span>
              <span className="text-2xl font-bold text-green-600">
                {calculateTotal().toLocaleString('fa-IR')} تومان
              </span>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              {passengers.length} مسافر
            </p>
          </div>

          <Button type="submit" className="w-full bg-blue-600 text-lg py-6" size="lg" disabled={loading}>
            {loading ? 'در حال ثبت درخواست...' : 'ثبت درخواست رزرو'}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            پس از ثبت درخواست، همکاران ما در اسرع وقت با شما تماس خواهند گرفت.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}