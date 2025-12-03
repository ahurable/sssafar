// components/cip/cip-search.tsx
"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plane, Calendar, MapPin, Users, AlertCircle, Loader2 } from "lucide-react"
import ShamsiDateModal from "../flights/ShamsiCalendar"
import { shamsiToGregorianString } from "@/lib/jalaalil"
import { useRouter } from "next/navigation"
import { useCip } from "@/contexts/search/CipContext"

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

  const { setSearchData, searchData } = useCip()

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

    setErrors(prev => ({ ...prev, airport: undefined }))
  }

  const handleInputChange = (value: string) => {
    setCurrentInput(value)
    setCipSearch(prev => ({
      ...prev,
      airport: value,
      airportId: undefined
    }))

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
    setErrors({})

    if (!validateForm()) {
      if (errors.airport) {
        inputRef.current?.focus()
      }
      return
    }

    setIsLoading(true)
    try {

      const searchPayload = {
        ...cipSearch
      }

      setSearchData(searchPayload)

      router.push(`/cip`)

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
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: undefined }))
    }
  }

  const renderError = (field: keyof FormErrors) => {
    if (!errors[field]) return null

    return (
      <div className="flex items-center gap-2 mt-2 text-blue-950 text-sm">
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
        className="absolute top-full right-0 left-0 bg-[#fffefe] border border-blue-900 z-50 max-h-80 overflow-y-auto mt-1"
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.id}`}
            className={`p-3 cursor-pointer border-b border-blue-900 last:border-b-0 ${index === activeSuggestionIndex
              ? 'bg-gray-100'
              : 'hover:bg-gray-50'
              }`}
            onMouseDown={(e) => {
              e.preventDefault()
              handleSuggestionClick(suggestion)
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 text-right">
                <div className="flex items-center gap-2 justify-end">
                  <span className="font-bold text-blue-950">
                    {suggestion.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className="text-xs bg-gray-200 text-blue-950 px-2 py-1 font-medium border border-blue-900">
                    {suggestion.airportCity}
                  </span>
                  <span className="text-xs bg-gray-200 text-blue-950 px-2 py-1 font-medium border border-blue-900">
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
    <div style={{ direction: 'rtl' }} className="container mx-auto">
      {/* General Error Display */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-500 border border-red-700 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
          <p className="text-white text-sm font-medium">{errors.general}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Airport Input */}
        <div className="space-y-2 relative">
          <Label htmlFor="cip-airport" className="text-blue-950 text-right block">فرودگاه</Label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            {suggestionLoading && (
              <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-blue-500" />
            )}
            <Input
              ref={inputRef}
              id="cip-airport"
              placeholder="فرودگاه بین المللی امام خمینی..."
              className={`pr-10 h-12 border border-blue-900 bg-[#fffefe] text-blue-950 placeholder-gray-500 ${errors.airport
                ? 'border-red-500 bg-red-500'
                : 'border-blue-900'
                }`}
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
              autoComplete="off"
            />
            {renderSuggestions()}
            {renderError("airport")}
          </div>
        </div>

        {/* Date Input */}
        <div className="space-y-2 relative">
          <Label className="text-blue-950 text-right block">تاریخ</Label>

          <ShamsiDateModal
            calendarId="calendar1"
            departureDate={cipSearch.date}
            returnDate={""}
            tripType={'OneWay'}
            onDepartureDateChange={handleDateChange}
            onReturnDateChange={() => null}
            onTripTypeChange={() => null}
            error={errors.date}
            errorColor="black"
            normalReturnCal={true}
          />
        </div>

        {/* Service Type */}
        <div className="space-y-2">
          <Label className="text-blue-950 text-right block">نوع سرویس</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={cipSearch.serviceType === "departure" ? "default" : "outline"}
              className={`h-12 ${cipSearch.serviceType === "departure"
                ? 'bg-blue-800 text-white'
                : 'bg-[#fffefe] text-blue-950 border border-blue-900'
                }`}
              onClick={() => setCipSearch(prev => ({ ...prev, serviceType: "departure" }))}
            >
              خروج
            </Button>
            <Button
              variant={cipSearch.serviceType === "arrival" ? "default" : "outline"}
              className={`h-12 ${cipSearch.serviceType === "arrival"
                ? 'bg-blue-800 text-white'
                : 'bg-[#fffefe] text-blue-950 border border-blue-900'
                }`}
              onClick={() => setCipSearch(prev => ({ ...prev, serviceType: "arrival" }))}
            >
              ورود
            </Button>
          </div>
        </div>

        {/* Passengers */}
        <div className="space-y-2">
          <Label htmlFor="cip-passengers" className="text-blue-950 text-right block">تعداد مسافران</Label>
          <div className="relative">
            <Users className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              id="cip-passengers"
              min="1"
              max="10"
              className={`pr-10 h-12 border border-blue-900 bg-[#fffefe] text-blue-950 ${errors.passengers
                ? 'border-red-500 bg-red-500'
                : 'border-blue-900'
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
        className="w-full h-12 bg-blue-500 text-white hover:bg-blue-900 mt-6"
        onClick={handleSearch}
        disabled={isLoading}
      >
        <Plane className="ml-2 h-4 w-4" />
        {isLoading ? "در حال جستجو..." : "جستجوی CIP"}
      </Button>
    </div>
  )
}

export default CipSearch