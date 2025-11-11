// components/tours/tour-search.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Map, Calendar, Users, Globe, CalendarIcon } from "lucide-react"
import ShamsiDateModal from "../flights/ShamsiCalendar"
import { formatShamsiDate } from "../flights/utils"
import { useRouter } from "next/navigation"

interface FormErrors {
  city?: string;
  startDate?: string;
  endDate?: string;
  general?: string;
}

const TourSearch = () => {
  const [tourSearch, setTourSearch] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const router = useRouter()

  useEffect(() => {
      if (errors.city && tourSearch.destination) {
        setErrors(prev => ({ ...prev, destination: undefined }))
      }
      if (errors.startDate && tourSearch.startDate) {
        setErrors(prev => ({ ...prev, startDate: undefined }))
      }
      if (errors.endDate && tourSearch.endDate) {
        setErrors(prev => ({ ...prev, endDate: undefined }))
      }
    }, [tourSearch.destination, tourSearch.startDate, tourSearch.endDate, errors])

  const handleSearch = () => {
    router.push(`/acitivities?city=${tourSearch.destination}&from=${tourSearch.startDate}&to=${tourSearch.endDate}`)
  }

  const handleFromChange = (date: string) => {
    setTourSearch(prev => ({ ...prev, startDate: date }))
    if (errors.startDate) {
      setErrors(prev => ({ ...prev, startDate: undefined }))
    }
  }

  const handleToChange = (date: string) => {
    setTourSearch(prev => ({ ...prev, endDate: date }))
    if (errors.endDate) {
      setErrors(prev => ({ ...prev, endDate: undefined }))
    }
  }

  const handleTripTypeChange = () => null

  return (
    <div style={{direction:'rtl'}} className="container mx-auto">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Destination Input */}
        <div className="space-y-2">
          <Label htmlFor="tour-destination" className="text-black text-right block">شهر</Label>
          <div className="relative">
            <Map className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              id="tour-destination" 
              placeholder="کیش، استانبول، آنتالیا..." 
              className="pr-10 h-12 border border-gray-300 bg-white text-black placeholder-gray-500"
              value={tourSearch.destination}
              onChange={(e) => setTourSearch(prev => ({ ...prev, destination: e.target.value }))}
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label className="text-black text-right block mb-2">تاریخ ورود</Label>

          <ShamsiDateModal
            departureDate={tourSearch.startDate}
            returnDate={tourSearch.endDate}
            tripType="roundtrip"
            onDepartureDateChange={handleFromChange}
            onReturnDateChange={handleToChange}
            onTripTypeChange={handleTripTypeChange}
            error={errors.startDate}
            errorColor="black"
            normalReturnCal={true}
          />
        </div>

        {/* End Date */}
        <div className="space-y-2">
          <Label className="text-black text-right block mb-2">تاریخ خروج</Label>

          <ShamsiDateModal
            departureDate={tourSearch.startDate}
            returnDate={tourSearch.endDate}
            tripType="roundtrip"
            onDepartureDateChange={handleFromChange}
            onReturnDateChange={handleToChange}
            onTripTypeChange={handleTripTypeChange}
            error={errors.startDate}
            errorColor="black"
            normalReturnCal={true}
            returnCal={true}
          />
        </div>
      </div>

      {/* Search Button */}
      <Button 
        className="w-full h-12 bg-blue-500 text-white hover:bg-blue-900 mt-6"
        onClick={handleSearch}
      >
        <Globe className="ml-2 h-4 w-4" />
        جستجوی گشت
      </Button>
    </div>
  )
}

export default TourSearch