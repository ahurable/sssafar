// components/tours/booking-form.tsx
"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useRouter } from "next/navigation"
import { useSnack } from "@/hooks/use-notification"

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
  const { success, error } = useSnack()
  const [contactInfo, setContactInfo] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/tours/${tour.id}/book?firstName=${contactInfo.firstName}&lastName=${contactInfo.lastName}&phoneNumber=${contactInfo.phone}`)

      const data = await response.json()

      if (response.ok) {
        success(data.message)
      } else {
        error(data.message)
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
    <Card className="sticky top-14 py-6  ">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-900">درخواست رزرو</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Passengers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>ثبت درخواست</Label>
            </div>
            <div className="grid grid-cols-12">
                <div className="col-span-12 mb-4">
                    <Input placeholder="نام خود را وارد کنید" 
                      value={contactInfo.firstName}
                      onChange={e => setContactInfo((prev:any) => ({ ...prev, firstName: e.target.value}))}
                    />
                </div>
                <div className="col-span-12">
                    <Input placeholder="نام خانوادگی خود را وارد کنید" 
                      value={contactInfo.lastName}
                      onChange={e => setContactInfo((prev:any) => ({ ...prev, lastName: e.target.value}))}
                    />
                </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <Label>اطلاعات تماس</Label>

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
                {tour.prices[0].price.toLocaleString('fa-IR')} تومان
              </span>
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-800 text-lg py-6" disabled={loading}>
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