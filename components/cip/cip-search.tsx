// components/cip/cip-search.tsx
"use client"

import { useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plane, Calendar, MapPin, Users } from "lucide-react"
import ShamsiDateModal from "../flights/ShamsiCalendar"


interface AirportSuggestion {
  id: string,
  name: string,
  airportCity: string,
  airportIata: string
}

const CipSearch = () => {
  const [cipSearch, setCipSearch] = useState({
    airport: "",
    date: "",
    passengers: 1,
    serviceType: "departure" // departure or arrival
  })
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [suggestionLoading, setSuggestionLoading] = useState(false)

  const suggestionsRef = useRef<HTMLDivElement>(null)

  const fetchSuggestions = async (query: string) => {
    setCipSearch((prev:any) => ({
      ...prev,
      airport:query
    }))


    const response = await fetch(`/api/cip/suggestions?q=${query}`)
    
    if (response.ok) {
      const data = await response.json()
      setShowSuggestions(true)
      console.log(data)
      setSuggestions(data)
    } 
  }

  const handleSearch = () => {
    console.log("CIP Search:", cipSearch)
    // Implement CIP search logic
  }

  const handleSuggestionClick = (suggestion: AirportSuggestion) => {
    const displayValue = suggestion.name 
      ? `${suggestion.name} (${suggestion.airportIata}) - ${suggestion.airportCity}`
      : suggestion.name;
    
    setCipSearch( (prev:any) => ({
      ...prev,
      airport: displayValue
    }))
    
    setShowSuggestions(false)
    
  }

  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null

    return (
      <div 
        ref={suggestionsRef}
        className="absolute top-full right-0 left-0 bg-white border-2 border-blue-300 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto mt-2 transition-all duration-300 transform origin-top"
        style={{
          animation: 'slideDown 0.3s ease-out'
        }}
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.id}`}
            className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
              index === activeSuggestionIndex 
                ? 'bg-blue-50 border-r-4 border-r-blue-500 scale-[1.02]' 
                : 'hover:bg-gray-50 hover:scale-[1.01]'
            }`}
            onMouseDown={(e) => {
              e.preventDefault()
              handleSuggestionClick(suggestion)
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 text-right">
                <div className="flex items-center gap-3 justify-end">
                  <span className="font-bold text-md text-gray-800">
                    {suggestion.name}
                  </span>
                </div>
                <div className="flex items-center gap-3 mt-2 justify-end">
                  <span className={`text-sm px-3 py-1.5 rounded-full font-mediumbg-green-100 text-green-800 border border-green-200`}>
                    {suggestion.airportCity}
                  </span>
                  <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full font-medium border border-yellow-200">
                    {suggestion.airportIata}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="rounded-3xl" style={{direction:'rtl'}}>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Airport Input */}
        <div className="space-y-3">
          <Label htmlFor="cip-airport" className="text-lg font-bold text-white text-right block">فرودگاه</Label>
          <div className="relative">
            <MapPin className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
            <Input 
              id="cip-airport" 
              placeholder="فرودگاه بین المللی امام خمینی..." 
              className="pr-12 h-14 rounded-2xl border-2 bg-white text-gray-800 placeholder-gray-500 text-lg font-medium border-gray-300 hover:border-purple-400 transition-all duration-300"
              value={cipSearch.airport}
              onChange={(e) => fetchSuggestions(e.currentTarget.value)}
            />
            
            {renderSuggestions()}
          </div>
        </div>

        {/* Date Input */}
        <div className="space-y-3">
          <div className="relative">
            <ShamsiDateModal
                departureDate={cipSearch.date}
                returnDate={""}
                tripType={'OneWay'}
                onDepartureDateChange={(date) => setCipSearch(prev => ({ ...prev, date: date }))}
                onReturnDateChange={(date) => null}
                onTripTypeChange={(type) => null}
                // error={errors.departureDate}
                normalReturnCal={true}
            />
          </div>
        </div>

        {/* Service Type */}
        <div className="space-y-3">
          <Label className="text-lg font-bold text-white text-right block">نوع سرویس</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={cipSearch.serviceType === "departure" ? "default" : "outline"}
              className="h-14 rounded-2xl"
              onClick={() => setCipSearch(prev => ({ ...prev, serviceType: "departure" }))}
            >
              خروج
            </Button>
            <Button
              variant={cipSearch.serviceType === "arrival" ? "default" : "outline"}
              className="h-14 rounded-2xl"
              onClick={() => setCipSearch(prev => ({ ...prev, serviceType: "arrival" }))}
            >
              ورود
            </Button>
          </div>
        </div>

        {/* Passengers */}
        <div className="space-y-3">
          <Label htmlFor="cip-passengers" className="text-lg font-bold text-white text-right block">تعداد مسافران</Label>
          <div className="relative">
            <Users className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
            <Input 
              type="number"
              id="cip-passengers" 
              min="1"
              max="10"
              className="pr-12 h-14 rounded-2xl border-2 bg-white text-gray-800 text-lg font-medium border-gray-300 hover:border-purple-400 transition-all duration-300"
              value={cipSearch.passengers}
              onChange={(e) => setCipSearch(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
            />
          </div>
        </div>
      </div>

      {/* Search Button */}
      <Button 
        className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-white to-purple-100 text-purple-600 hover:from-purple-100 hover:to-white transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 mt-8"
        onClick={handleSearch}
      >
        <Plane className="ml-3 h-6 w-6" />
        جستجوی CIP
      </Button>
    </div>
  )
}

export default CipSearch