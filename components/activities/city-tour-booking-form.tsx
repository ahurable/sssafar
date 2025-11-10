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
  phoneNumber: string
  passengerType: string
  description: string
}

export function CityTourBookingForm({ tour }: BookingFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [passenger, setPassenger] = useState<Passenger>(
    { firstName: '', lastName: '', passengerType: 'ADULT', phoneNumber: '', description: '' }
  )
  const { success, error } = useSnack()


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/activities/${tour.id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(passenger),
      })

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
    <Card className="sticky top-4 py-6  ">
      <CardHeader>
        <CardTitle className="text-2xl text-blue-600">درخواست رزرو</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* passenger */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>ثبت درخواست</Label>
            </div>
            <div className="grid grid-cols-12">
                <div className="col-span-12">
                    <Label htmlFor="firstName">نام:</Label>
                    <Input placeholder="نام خود را وارد کنید"
                      name="firstName"
                      onChange={(e) => setPassenger({ ...passenger, firstName: e.currentTarget.value })}
                      value={passenger.firstName}
                    />
                </div>
                <div className="col-span-12 mt-4">
                    <Label htmlFor="firstName">نام خانوادگی:</Label>
                    <Input placeholder="نام خانوادگی خود را وارد کنید"
                      name="lastName"
                      onChange={(e) => setPassenger({ ...passenger, lastName: e.currentTarget.value })}
                      value={passenger.lastName}
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
                value={passenger.phoneNumber}
                onChange={(e) => setPassenger({ ...passenger, phoneNumber: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>توضیحات (اختیاری)</Label>
              <Input
                value={passenger.description}
                onChange={(e) => setPassenger({ ...passenger, description: e.target.value })}
                placeholder="درخواست‌های خاص یا توضیحات اضافی"
              />
            </div>
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