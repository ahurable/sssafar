"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { 
  MapPin, 
  Clock, 
  ArrowRight,
  Shield,
  Check,
  User,
  Phone
} from "lucide-react"
import { toast } from "sonner"
import { useCip } from "@/contexts/search/CipContext"

interface BookingSectionProps {
  service: {
    id: string
    title: string
    airport: string
    price: number | null
    currency: string
    duration: string | null
    search?: {}
  }
}

export function BookingSection({ service }: BookingSectionProps) {
  const [showReservationForm, setShowReservationForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    search: {}
  })
  const { searchData } = useCip()

  useEffect(() => {
    if (searchData) {
      setFormData((prev:any) => ({
        ...prev,
        search: searchData
      }))
    }
  },[searchData])

  const formatPrice = (price: number | null, currency: string) => {
    if (!price) return "رایگان"
    return price.toLocaleString("fa-IR") + " " + currency
  }

  const handleReserveClick = () => {
    setShowReservationForm(true)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    // console.log('button clicked')
    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.phoneNumber.trim()) {
      toast.error("لطفا تمام فیلدهای ضروری را پر کنید")
      setLoading(false)
      return
    }

    // Phone number validation (Iranian format)
    const phoneRegex = /^09[0-9]{9}$/
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast.error("لطفا شماره موبایل معتبر وارد کنید (09xxxxxxxxx)")
      setLoading(false)
      return
    }

    try {
      // Simulate API call
      const response = await fetch(
        '/api/cip/reservations',
        {
          method: 'POST',
          headers: {
            "Content-Type":"application/json"
          },
          body: JSON.stringify({
            serviceId: service.id,
            firstName: formData.firstName,
            lastName: formData.lastName,
            search: JSON.stringify(formData.search)
          })
        }
      )

      const data = await response.json()

      if (response.ok) {
         // Here you would typically send the data to your API
        // console.log("Reservation data:", {
        //   data
        // })
        toast.success("درخواست رزرو شما با موفقیت ثبت شد، پس از بررسی، همکاران ما با شما تماس خواهند گرفت.")
        // Reset form
        setFormData({
          firstName: "",
          lastName: "",
          phoneNumber: "",
          search:{}
        })
        setShowReservationForm(false)
      
      }
      else {
        toast.error("خطا در ثبت رزرو")
        // console.log(data)
      }

     
    } catch (error) {
      // console.log('its the catch ', error)
      toast.error("خطا در ثبت رزرو. لطفا مجددا تلاش کنید.")
    } finally {
      // console.log('its finally')
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Card className="sticky top-6 bg-[#fffefe]">
      <CardContent className="p-6">
        <div className="text-center mb-6">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {formatPrice(service.price, service.currency)}
          </div>
          <div className="text-gray-600">به ازای هر نفر</div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">فرودگاه</span>
            <span className="font-semibold">{service.airport}</span>
          </div>
          
          {service.duration && (
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-600">مدت زمان</span>
              <span className="font-semibold">{service.duration}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-2 border-b border-gray-200">
            <span className="text-gray-600">وضعیت</span>
            <Badge className="bg-green-500">فعال</Badge>
          </div>
        </div>

        {!showReservationForm ? (
          <Button 
            className="w-full" 
            size="lg"
            onClick={handleReserveClick}
          >
            رزرو خدمت
            <ArrowRight className="h-5 w-5 mr-2" />
          </Button>
        ) : (
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="text-right mb-4">
              <h3 className="font-semibold text-gray-900">فرم رزرو خدمت</h3>
              <p className="text-sm text-gray-600 mt-1">اطلاعات خود را وارد کنید</p>
            </div>

            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-right block">
                نام *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  placeholder="نام خود را وارد کنید"
                  className="pr-3 pl-10"
                  required
                />
              </div>
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-right block">
                نام خانوادگی *
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  placeholder="نام خانوادگی خود را وارد کنید"
                  className="pr-3 pl-10"
                  required
                />
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="text-right block">
                شماره موبایل *
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                  placeholder="09xxxxxxxxx"
                  className="pr-3 pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 text-right">
                شماره موبایل باید با 09 شروع شود و 11 رقمی باشد
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setShowReservationForm(false)}
                disabled={loading}
              >
                انصراف
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    در حال ثبت...
                  </>
                ) : (
                  "ثبت درخواست"
                )}
              </Button>
            </div>
          </form>
        )}

        <div className="mt-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
            <Shield className="h-4 w-4" />
            تضمین بهترین قیمت
          </div>
        </div>

        {/* Quick Features */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3">مزایای این خدمت:</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-500" />
              صرفه‌جویی در زمان
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-500" />
              آرامش و راحتی
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Check className="h-4 w-4 text-green-500" />
              خدمات اختصاصی
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}