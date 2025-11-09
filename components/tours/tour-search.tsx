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
    // tourType: "domestic" // domestic or international
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
    // Clear startDate error when user selects a date
    if (errors.startDate) {
      setErrors(prev => ({ ...prev, startDate: undefined }))
    }
  }

  const handleToChange = (date: string) => {
    setTourSearch(prev => ({ ...prev, endDate: date }))
    // Clear startDate error when user selects a date
    if (errors.endDate) {
      setErrors(prev => ({ ...prev, endDate: undefined }))
    }
  }

  const handleTripTypeChange = () => null

  return (
    <div className="rounded-3xl" style={{direction:'rtl'}}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Destination Input */}
        <div className="space-y-3">
          <Label htmlFor="tour-destination" className="text-lg font-bold text-white text-right block">شهر</Label>
          <div className="relative">
            <Map className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
            <Input 
              id="tour-destination" 
              placeholder="کیش، استانبول، آنتالیا..." 
              className="pr-12 h-14 rounded-2xl border-2 bg-white text-gray-800 placeholder-gray-500 text-lg font-medium border-gray-300 hover:border-orange-400 transition-all duration-300"
              value={tourSearch.destination}
              onChange={(e) => setTourSearch(prev => ({ ...prev, destination: e.target.value }))}
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-3">
          <ShamsiDateModal
            departureDate={tourSearch.startDate}
            returnDate={tourSearch.endDate}
            tripType="roundtrip" // Fixed for hotel search
            onDepartureDateChange={handleFromChange}
            onReturnDateChange={handleToChange}
            onTripTypeChange={handleTripTypeChange}
            error={errors.startDate}
            normalReturnCal={true}
          />
        </div>

        {/* End Date */}
        <div className="space-y-3">
            <Label className="text-lg font-bold text-white text-right block">تاریخ خروج</Label>
            <div className="relative">
            <CalendarIcon    className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
            <div className={`w-full h-14 rounded-2xl border-2 bg-white text-gray-800 text-lg font-medium flex items-center px-4 pr-12 transition-all duration-300 ${
                errors.endDate 
                ? 'border-red-500 bg-red-50 scale-105 shadow-lg' 
                : 'border-gray-300'
            }`}>
                <span className="text-gray-800">
                {formatShamsiDate(tourSearch.endDate)}
                </span>
            </div>
            </div>
            {/* {renderError("checkOut")} */}
        </div>
      </div>

      {/* Search Button */}
      <Button 
        className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-white to-orange-100 text-orange-600 hover:from-orange-100 hover:to-white transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 mt-8"
        onClick={handleSearch}
      >
        <Globe className="ml-3 h-6 w-6" />
        جستجوی گشت
      </Button>
    </div>
  )
}

export default TourSearch