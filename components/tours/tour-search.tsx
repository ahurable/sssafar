// components/tours/tour-search.tsx
"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Map, Calendar, Users, Globe, CalendarIcon, AlertCircle, Loader2 } from "lucide-react"
import ShamsiDateModal from "../flights/ShamsiCalendar"
import { useRouter } from "next/navigation"
import { useTour } from "@/contexts/search/TourContext"

interface FormErrors {
  destination?: string;
  startDate?: string;
  endDate?: string;
  general?: string;
}

interface TourSuggestion {
  id: string;
  name: string;
  city: string;
}

const TourSearch = () => {
  const [tourSearch, setTourSearch] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [suggestions, setSuggestions] = useState<TourSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [currentInput, setCurrentInput] = useState("")
  const [openCalendarId, setOpenCalendarId] = useState<string | null>(null)
  const [isDestinationFocused, setIsDestinationFocused] = useState(false)
  
  const router = useRouter()
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const { setSearchData } = useTour()

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.destination && tourSearch.destination) {
      setErrors(prev => ({ ...prev, destination: undefined }))
    }
    if (errors.startDate && tourSearch.startDate) {
      setErrors(prev => ({ ...prev, startDate: undefined }))
    }
    if (errors.endDate && tourSearch.endDate) {
      setErrors(prev => ({ ...prev, endDate: undefined }))
    }
  }, [tourSearch.destination, tourSearch.startDate, tourSearch.endDate, errors])

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
    setTourSearch(prev => ({
      ...prev,
      destination: query
    }))
    
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setSuggestionLoading(true)
    try {
      const response = await fetch(`/api/activities/suggestions?q=${encodeURIComponent(query)}`)
      
      if (response.ok) {
        const data = await response.json()
        setSuggestions(data)
        setShowSuggestions(true)
        setActiveSuggestionIndex(0)
      } else {
        throw new Error('Failed to fetch suggestions')
      }
    } catch (error) {
      console.error("Error fetching city suggestions:", error)
      setErrors(prev => ({ ...prev, general: "خطا در دریافت پیشنهادات شهر" }))
    } finally {
      setSuggestionLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!tourSearch.destination.trim()) {
      newErrors.destination = "لطفاً یک شهر معتبر انتخاب کنید"
    }

    if (!tourSearch.startDate) {
      newErrors.startDate = "لطفاً تاریخ ورود را انتخاب کنید"
    }

    if (!tourSearch.endDate) {
      newErrors.endDate = "لطفاً تاریخ خروج را انتخاب کنید"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSuggestionClick = (suggestion: TourSuggestion) => {
    setTourSearch(prev => ({
      ...prev,
      destination: suggestion.name
    }))
    
    setShowSuggestions(false)
    setCurrentInput("")
    setIsDestinationFocused(false)
    
    setErrors(prev => ({ ...prev, destination: undefined }))
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
      return
    }

    try {
      setSearchData(tourSearch)
    } catch (error) {
      console.error("Error searching tours:", error)
      setErrors(prev => ({ 
        ...prev, 
        general: "خطا در جستجوی گشت. لطفا دوباره تلاش کنید." 
      }))
    }
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

  const renderError = (field: keyof FormErrors) => {
    if (!errors[field]) return null
    
    return (
      <div className="flex items-center gap-2 mt-2 text-black text-sm">
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
        className="absolute top-full right-0 left-0 bg-[#fffefe] border border-gray-300 z-50 max-h-80 overflow-y-auto mt-1"
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={suggestion.id}
            className={`p-3 cursor-pointer border-b border-gray-300 last:border-b-0 ${
              index === activeSuggestionIndex 
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
                  <span className="font-bold text-black">
                    {suggestion.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className="text-xs bg-gray-200 text-black px-2 py-1 font-medium border border-gray-300">
                    {suggestion.city}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleTripTypeChange = () => null

  return (
    <div style={{direction:'rtl'}} className="container mx-auto">
      {/* General Error Display */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-500 border border-red-700 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
          <p className="text-white text-sm font-medium">{errors.general}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Destination Input */}
        <div className="space-y-2 relative">
          <Label htmlFor="tour-destination" className="text-black text-right block">شهر</Label>
          <div className="relative">
            <Map className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            {suggestionLoading && (
              <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-blue-500" />
            )}
            <Input 
              ref={inputRef}
              id="tour-destination" 
              placeholder="کیش، استانبول، آنتالیا..." 
              className={`pr-10 h-12 border border-gray-300 bg-[#fffefe] text-black placeholder-gray-500 ${
                errors.destination 
                  ? 'border-red-500 bg-red-500' 
                  : 'border-gray-300'
              }`}
              value={tourSearch.destination}
              onChange={(e) => fetchSuggestions(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsDestinationFocused(true)
                setShowSuggestions(suggestions.length > 0)
              }}
              onBlur={() => {
                setIsDestinationFocused(false)
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              autoComplete="off"
            />
            {renderSuggestions()}
            {renderError("destination")}
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2 relative">
          <Label className="text-black text-right block mb-2">تاریخ ورود</Label>

          <ShamsiDateModal
            calendarId="calendar1"
            onOpenChange={setOpenCalendarId}
            isOpen={openCalendarId == "calendar1"}
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
        <div className="space-y-2 relative">
          <Label className="text-black text-right block mb-2">تاریخ خروج</Label>

          <ShamsiDateModal
            calendarId="calendar2"
            isOpen={openCalendarId == "calendar2"}
            onOpenChange={setOpenCalendarId}
            departureDate={tourSearch.startDate}
            returnDate={tourSearch.endDate}
            tripType="roundtrip"
            onDepartureDateChange={handleFromChange}
            onReturnDateChange={handleToChange}
            onTripTypeChange={handleTripTypeChange}
            error={errors.endDate}
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