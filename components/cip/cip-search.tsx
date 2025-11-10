// components/cip/cip-search.tsx
"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plane, Calendar, MapPin, Users, AlertCircle, Loader2 } from "lucide-react"
import ShamsiDateModal from "../flights/ShamsiCalendar"
import { shamsiToGregorianString } from "@/lib/jalaalil" // Adjust the path as needed
import { useRouter } from "next/navigation"

interface AirportSuggestion {
  id: string,
  name: string,
  airportCity: string,
  airportIata: string
}

interface CipSearchFormData {
  airport: string;
  airportId?: string;
  date: string;
  passengers: number;
  serviceType: "departure" | "arrival";
}

interface FormErrors {
  airport?: string;
  date?: string;
  passengers?: string;
  general?: string;
}

const CipSearch = () => {
  const [cipSearch, setCipSearch] = useState<CipSearchFormData>({
    airport: "",
    airportId: undefined,
    date: "",
    passengers: 1,
    serviceType: "departure"
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)
  
  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [currentInput, setCurrentInput] = useState("")
  const [isAirportFocused, setIsAirportFocused] = useState(false)
  const router = useRouter()
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.airport && cipSearch.airport) {
      setErrors(prev => ({ ...prev, airport: undefined }))
    }
    if (errors.date && cipSearch.date) {
      setErrors(prev => ({ ...prev, date: undefined }))
    }
    if (errors.passengers && cipSearch.passengers) {
      setErrors(prev => ({ ...prev, passengers: undefined }))
    }
  }, [cipSearch.airport, cipSearch.date, cipSearch.passengers, errors])

  // Handle click outside for suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const fetchSuggestions = async (query: string) => {
    setCipSearch((prev: any) => ({
      ...prev,
      airport: query
    }))
    
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setSuggestionLoading(true)
    try {
      const response = await fetch(`/api/cip/suggestions?q=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
        setShowSuggestions(true)
        setActiveSuggestionIndex(0)
      } else {
        throw new Error('Failed to fetch suggestions')
      }
    } catch (error) {
      console.error("Error fetching airport suggestions:", error)
      setErrors(prev => ({ ...prev, general: "خطا در دریافت پیشنهادات فرودگاه" }))
    } finally {
      setSuggestionLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!cipSearch.airport.trim()) {
      newErrors.airport = "لطفاً یک فرودگاه معتبر انتخاب کنید"
    } else if (!cipSearch.airportId) {
      newErrors.airport = "لطفاً از لیست پیشنهادی یک فرودگاه انتخاب کنید"
    }

    if (!cipSearch.date) {
      newErrors.date = "لطفاً تاریخ را انتخاب کنید"
    }

    if (!cipSearch.passengers || cipSearch.passengers < 1) {
      newErrors.passengers = "تعداد مسافران باید حداقل ۱ باشد"
    } else if (cipSearch.passengers > 10) {
      newErrors.passengers = "تعداد مسافران نمی‌تواند بیشتر از ۱۰ باشد"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSuggestionClick = (suggestion: AirportSuggestion) => {
    const displayValue = suggestion.name 
      ? `${suggestion.name} (${suggestion.airportIata}) - ${suggestion.airportCity}`
      : suggestion.name;
    
    setCipSearch(prev => ({
      ...prev,
      airport: displayValue,
      airportId: suggestion.id
    }))
    
    setShowSuggestions(false)
    setCurrentInput("")
    setIsAirportFocused(false)
    
    // Clear airport error
    setErrors(prev => ({ ...prev, airport: undefined }))
  }

  const handleInputChange = (value: string) => {
    setCurrentInput(value)
    setCipSearch(prev => ({ 
      ...prev, 
      airport: value,
      airportId: undefined
    }))
    
    // Clear airport error when user starts typing
    if (errors.airport) {
      setErrors(prev => ({ ...prev, airport: undefined }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveSuggestionIndex(prev => 
        prev < suggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : prev)
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (suggestions[activeSuggestionIndex]) {
        handleSuggestionClick(suggestions[activeSuggestionIndex])
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleSearch = async () => {
    // Clear previous errors
    setErrors({})
    
    // Validate form
    if (!validateForm()) {
      // Focus on first error field
      if (errors.airport) {
        inputRef.current?.focus()
      }
      return
    }

    setIsLoading(true)
    try {
      // Convert Shamsi date to Gregorian for API
      const gregorianDate = shamsiToGregorianString(cipSearch.date)
      
      const searchPayload = {
        ...cipSearch,
        date: gregorianDate
      }

      console.log("CIP Search Payload:", searchPayload)

      // Implement your actual API call here
      router.push(`/cip?airport=${searchPayload.airportId}&date=${searchPayload.date}&passengers=${searchPayload.passengers}`)
      
      // Redirect or show results as needed
      // router.push('/cip/results')
      
    } catch (error) {
      console.error("Error searching CIP services:", error)
      setErrors(prev => ({ 
        ...prev, 
        general: "خطا در جستجوی سرویس CIP. لطفا دوباره تلاش کنید." 
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleDateChange = (date: string) => {
    setCipSearch(prev => ({ ...prev, date }))
    // Clear date error when user selects a date
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: undefined }))
    }
  }

  const renderError = (field: keyof FormErrors) => {
    if (!errors[field]) return null
    
    return (
      <div className="flex items-center gap-2 mt-2 text-white text-sm animate-fadeIn">
        <AlertCircle className="h-4 w-4" />
        <span>{errors[field]}</span>
      </div>
    )
  }

  const renderSuggestions = () => {
    if (!showSuggestions || suggestions.length === 0) return null

    return (
      <div 
        ref={suggestionsRef}
        className="absolute top-full right-0 left-0 bg-white border-2 border-purple-300 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto mt-2 transition-all duration-300 transform origin-top"
        style={{
          animation: 'slideDown 0.3s ease-out'
        }}
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.id}`}
            className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
              index === activeSuggestionIndex 
                ? 'bg-purple-50 border-r-4 border-r-purple-500 scale-[1.02]' 
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
                  <span className={`text-sm px-3 py-1.5 rounded-full font-medium bg-green-100 text-green-800 border border-green-200`}>
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
      {/* General Error Display */}
      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 animate-fadeIn">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700 text-sm font-medium">{errors.general}</p>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Airport Input - Enhanced with error handling */}
        <div className="space-y-3 relative">
          <Label htmlFor="cip-airport" className="text-lg font-bold text-white text-right block">فرودگاه</Label>
          <div className="relative">
            <MapPin className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
            {suggestionLoading && (
              <Loader2 className="absolute left-4 top-4 h-5 w-5 animate-spin text-purple-600" />
            )}
            <Input 
              ref={inputRef}
              id="cip-airport" 
              placeholder="فرودگاه بین المللی امام خمینی..." 
              className={`pr-12 h-14 rounded-2xl border-2 bg-white text-gray-800 placeholder-gray-500 text-lg font-medium transition-all duration-300 ${
                errors.airport 
                  ? 'border-red-500 bg-red-50 scale-105 shadow-lg' 
                  : isAirportFocused 
                  ? 'border-purple-500 scale-105 shadow-lg' 
                  : 'border-gray-300 hover:border-purple-400'
              } ${showSuggestions ? 'rounded-b-none border-b-2 border-b-purple-300' : ''}`}
              value={cipSearch.airport}
              onChange={(e) => fetchSuggestions(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsAirportFocused(true)
                setShowSuggestions(suggestions.length > 0)
              }}
              onBlur={() => {
                setIsAirportFocused(false)
                setTimeout(() => setShowSuggestions(false), 200)
              }}
            />
            {renderSuggestions()}
            {renderError("airport")}
          </div>
        </div>

        {/* Date Input */}
        <div className="space-y-3">
          {/* <Label className="text-lg font-bold text-white text-right block">تاریخ</Label> */}
          <div className="relative">
            <ShamsiDateModal
              departureDate={cipSearch.date}
              returnDate={""}
              tripType={'OneWay'}
              onDepartureDateChange={handleDateChange}
              onReturnDateChange={() => null}
              onTripTypeChange={() => null}
              error={errors.date}
              normalReturnCal={true}
            />
            {/* {renderError("date")} */}
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
              className={`pr-12 h-14 rounded-2xl border-2 bg-white text-gray-800 text-lg font-medium transition-all duration-300 ${
                errors.passengers 
                  ? 'border-red-500 bg-red-50 scale-105 shadow-lg' 
                  : 'border-gray-300 hover:border-purple-400'
              }`}
              value={cipSearch.passengers}
              onChange={(e) => setCipSearch(prev => ({ 
                ...prev, 
                passengers: Math.max(1, Math.min(10, parseInt(e.target.value) || 1))
              }))}
            />
            {renderError("passengers")}
          </div>
        </div>
      </div>

      {/* Search Button */}
      <Button 
        className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-white to-purple-100 text-purple-600 hover:from-purple-100 hover:to-white transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 mt-8"
        onClick={handleSearch}
        disabled={isLoading}
      >
        <Plane className="ml-3 h-6 w-6" />
        {isLoading ? "در حال جستجو..." : "جستجوی CIP"}
      </Button>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

export default CipSearch