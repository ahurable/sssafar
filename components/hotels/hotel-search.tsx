"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Calendar, MapPin, Users, Loader2, Bed, Plus, Minus, CalendarIcon, AlertCircle } from "lucide-react"
import { useHotel } from "@/contexts/search/HotelContext"
import { useRouter } from "next/navigation"
import ShamsiDateModal from "../flights/ShamsiCalendar"
import { formatShamsiDate } from "../flights/utils"
import { shamsiToGregorianString } from "@/lib/jalaalil"

interface CitySuggestion {
  id: number;
  name: string;
  nameFa?: string;
  propertyDestinationId: number;
  type: 'domestic' | 'international';
  isPopular?: boolean;
  searchDestinationOrCity?: boolean;
  isActive?: boolean;
}

interface HotelSearchFormData {
  city: string;
  cityId?: number;
  cityType?: 'domestic' | 'international';
  propertyDestinationId?: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

interface FormErrors {
  city?: string;
  checkIn?: string;
  checkOut?: string;
  general?: string;
}

const HotelSearch = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const router = useRouter()
  
  const [hotelSearch, setHotelSearch] = useState<HotelSearchFormData>({
    city: "",
    cityId: undefined,
    cityType: undefined,
    propertyDestinationId: undefined,
    checkIn: "",
    checkOut: "",
    guests: 1,
    rooms: 1
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [showGuestsRooms, setShowGuestsRooms] = useState(false)
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [currentInput, setCurrentInput] = useState("")
  const [isCityFocused, setIsCityFocused] = useState(false)

  const { setHotelsData, setRequest } = useHotel()

  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const guestsRoomsRef = useRef<HTMLDivElement>(null)

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.city && hotelSearch.city) {
      setErrors(prev => ({ ...prev, city: undefined }))
    }
    if (errors.checkIn && hotelSearch.checkIn) {
      setErrors(prev => ({ ...prev, checkIn: undefined }))
    }
    if (errors.checkOut && hotelSearch.checkOut) {
      setErrors(prev => ({ ...prev, checkOut: undefined }))
    }
  }, [hotelSearch.city, hotelSearch.checkIn, hotelSearch.checkOut, errors])

  const fetchCitySuggestions = async (query: string): Promise<CitySuggestion[]> => {
    if (query.length < 2) {
      return [];
    }

    const response = await fetch(`/api/hotels/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to fetch suggestions');
    }
    const data = await response.json();
    console.log(data)
    return data.results || [];
  };

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (currentInput.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        return
      }

      setSuggestionLoading(true)
      try {
        const data = await fetchCitySuggestions(currentInput)
        setSuggestions(data)
        setShowSuggestions(true)
        setActiveSuggestionIndex(0)
      } catch (error) {
        console.error("Error fetching suggestions:", error)
        setSuggestions([])
        setErrors(prev => ({ ...prev, general: "خطا در دریافت پیشنهادات شهرها" }))
      } finally {
        setSuggestionLoading(false)
      }
    }

    const timer = setTimeout(fetchSuggestions, 300)
    return () => clearTimeout(timer)
  }, [currentInput])

  // Handle click outside for both suggestions and guests/rooms
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

      if (
        guestsRoomsRef.current && 
        !guestsRoomsRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('.guests-rooms-trigger')
      ) {
        setShowGuestsRooms(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!hotelSearch.city.trim()) {
      newErrors.city = "لطفاً یک شهر معتبر انتخاب کنید"
    } else if (!hotelSearch.cityId) {
      newErrors.city = "لطفاً از لیست پیشنهادی یک شهر انتخاب کنید"
    }

    if (!hotelSearch.checkIn) {
      newErrors.checkIn = "لطفاً تاریخ ورود را انتخاب کنید"
    }

    if (!hotelSearch.checkOut) {
      newErrors.checkOut = "لطفاً تاریخ خروج را انتخاب کنید"
    }

    if (hotelSearch.checkIn && hotelSearch.checkOut) {
      const checkInDate = new Date(hotelSearch.checkIn)
      const checkOutDate = new Date(hotelSearch.checkOut)
      
      if (checkOutDate <= checkInDate) {
        newErrors.checkOut = "تاریخ خروج باید بعد از تاریخ ورود باشد"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    const displayValue = suggestion.nameFa 
      ? `${suggestion.nameFa} (${suggestion.name})`
      : suggestion.name;
    
    setHotelSearch(prev => ({
      ...prev,
      city: displayValue,
      cityId: suggestion.id,
      cityType: suggestion.type,
      propertyDestinationId: suggestion.propertyDestinationId
    }))
    
    setShowSuggestions(false)
    setCurrentInput("")
    setIsCityFocused(false)
    
    setErrors(prev => ({ ...prev, city: undefined }))
  }

  const handleInputChange = (value: string) => {
    setCurrentInput(value)
    setHotelSearch(prev => ({ 
      ...prev, 
      city: value,
      cityId: undefined,
      cityType: undefined,
      propertyDestinationId: undefined
    }))
    
    if (errors.city) {
      setErrors(prev => ({ ...prev, city: undefined }))
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

  const handleGuestsRoomsChange = (type: 'guests' | 'rooms', operation: 'increment' | 'decrement') => {
    setHotelSearch(prev => {
      const currentValue = prev[type]
      let newValue = currentValue

      if (operation === 'increment') {
        newValue = type === 'guests' ? Math.min(currentValue + 1, 10) : Math.min(currentValue + 1, 5)
      } else {
        newValue = type === 'guests' ? Math.max(currentValue - 1, 1) : Math.max(currentValue - 1, 1)
      }

      return { ...prev, [type]: newValue }
    })
  }

  const handleHotelSearch = async () => {
    setErrors({})
    
    if (!validateForm()) {
      if (errors.city) {
        inputRef.current?.focus()
      }
      return
    }

    setIsLoading(true)
    try {
      setSearchLoading(true)
      
      const gregorianCheckIn = shamsiToGregorianString(hotelSearch.checkIn)
      const gregorianCheckOut = shamsiToGregorianString(hotelSearch.checkOut)
      
      const searchPayload = {
        ...hotelSearch,
        checkIn: gregorianCheckIn,
        checkOut: gregorianCheckOut
      }

      const response = await fetch('/api/hotels/search/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(searchPayload)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch hotels')
      }

      const data = await response.json()
      setHotelsData(data.data)
      setRequest(data.request)
      router.push('/hotels/')
      setSearchLoading(false)
      
    } catch (error) {
      console.error("Error searching hotels:", error)
      setErrors(prev => ({ 
        ...prev, 
        general: "خطا در جستجوی هتل. لطفا دوباره تلاش کنید." 
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleCheckInDateChange = (date: string) => {
    setHotelSearch(prev => ({ ...prev, checkIn: date }))
    if (errors.checkIn) {
      setErrors(prev => ({ ...prev, checkIn: undefined }))
    }
  }

  const handleCheckOutDateChange = (date: string) => {
    setHotelSearch(prev => ({ ...prev, checkOut: date }))
    if (errors.checkOut) {
      setErrors(prev => ({ ...prev, checkOut: undefined }))
    }
  }

  const handleTripTypeChange = (type: string) => {
    console.log("Trip type changed:", type)
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
        className="absolute top-full right-0 left-0 bg-white border border-gray-300 z-50 max-h-80 overflow-y-auto mt-1"
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.id}-${suggestion.type}`}
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
                    {suggestion.nameFa || suggestion.name}
                  </span>
                  {suggestion.nameFa && (
                    <span className="text-sm text-black">({suggestion.name})</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 justify-end">
                  <span className={`text-xs px-2 py-1 font-medium ${
                    suggestion.type === 'domestic' 
                      ? 'bg-gray-200 text-black border border-gray-300' 
                      : 'bg-gray-200 text-black border border-gray-300'
                  }`}>
                    {suggestion.type === 'domestic' ? 'داخلی' : 'بین‌المللی'}
                  </span>
                  {suggestion.isPopular && (
                    <span className="text-xs bg-gray-200 text-black px-2 py-1 font-medium border border-gray-300">
                      محبوب
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderGuestsRoomsSelector = () => {
    if (!showGuestsRooms) return null

    return (
      <div 
        ref={guestsRoomsRef}
        className="absolute top-full right-0 left-0 bg-white border border-gray-300 z-50 p-4 mt-1"
      >
        <div className="space-y-4">
          {/* Guests Selector */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="font-bold text-black">تعداد مهمان</div>
              <div className="text-xs text-black mt-1">حداکثر 10 مهمان</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleGuestsRoomsChange('guests', 'decrement')}
                disabled={hotelSearch.guests <= 1}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold text-black min-w-6 text-center">
                {hotelSearch.guests}
              </span>
              <button
                onClick={() => handleGuestsRoomsChange('guests', 'increment')}
                disabled={hotelSearch.guests >= 10}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Rooms Selector */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="font-bold text-black">تعداد اتاق</div>
              <div className="text-xs text-black mt-1">حداکثر 5 اتاق</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleGuestsRoomsChange('rooms', 'decrement')}
                disabled={hotelSearch.rooms <= 1}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold text-black min-w-6 text-center">
                {hotelSearch.rooms}
              </span>
              <button
                onClick={() => handleGuestsRoomsChange('rooms', 'increment')}
                disabled={hotelSearch.rooms >= 5}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{direction:'rtl'}} className="container mx-auto">
      {/* General Error Display */}
      {errors.general && (
        <div className="mb-4 p-3 bg-red-500 border border-red-700 flex items-center gap-3">
          <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
          <p className="text-white text-sm font-medium">{errors.general}</p>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* City Input */}
        <div className="space-y-2 relative">
          <Label htmlFor="hotel-city" className="text-black text-right block">شهر مقصد</Label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            {suggestionLoading && (
              <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-blue-500" />
            )}
            <Input 
              ref={inputRef}
              id="hotel-city" 
              placeholder="تهران، استانبول، دبی..." 
              className={`pr-10 h-12 border border-gray-300 bg-white text-black placeholder-gray-500 ${
                errors.city 
                  ? 'border-red-500 bg-red-500' 
                  : 'border-gray-300'
              }`}
              value={hotelSearch.city}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsCityFocused(true)
                setShowSuggestions(suggestions.length > 0)
              }}
              onBlur={() => {
                setIsCityFocused(false)
                setTimeout(() => setShowSuggestions(false), 200)
              }}
            />
            {renderSuggestions()}
            {renderError("city")}
          </div>
        </div>
        
        {/* Check-in Date */}
        <div className="space-y-2">
          <Label className="text-black text-right block">تاریخ ورود</Label>
          <ShamsiDateModal
            departureDate={hotelSearch.checkIn}
            returnDate={hotelSearch.checkOut}
            tripType="roundtrip"
            onDepartureDateChange={handleCheckInDateChange}
            onReturnDateChange={handleCheckOutDateChange}
            onTripTypeChange={handleTripTypeChange}
            error={errors.checkIn}
            errorColor="black"
          />
        </div>
        
        {/* Check-out Date Display */}
        <div className="space-y-2">
          <Label className="text-black text-right block">تاریخ خروج</Label>
          <ShamsiDateModal
            departureDate={hotelSearch.checkIn}
            returnDate={hotelSearch.checkOut}
            tripType="roundtrip"
            onDepartureDateChange={handleCheckInDateChange}
            onReturnDateChange={handleCheckOutDateChange}
            onTripTypeChange={handleTripTypeChange}
            error={errors.checkIn}
            errorColor="black"
            returnCal={true}
          />
          {renderError("checkOut")}
        </div>
        
        {/* Guests & Rooms Selector */}
        <div className="space-y-2 relative">
          <Label className="text-black text-right block">مهمان و اتاق</Label>
          <div 
            className="guests-rooms-trigger cursor-pointer"
            onClick={() => setShowGuestsRooms(!showGuestsRooms)}
          >
            <div className="relative h-12 border border-gray-300 bg-white hover:border-gray-400 flex items-center justify-between px-3">
              <div className="flex items-center gap-3">
                <Users className="h-4 w-4 text-gray-400" />
                <Bed className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-right">
                <div className="text-black text-sm font-medium">
                  {hotelSearch.guests} مهمان
                </div>
                <div className="text-gray-500 text-xs">
                  {hotelSearch.rooms} اتاق
                </div>
              </div>
            </div>
          </div>
          {renderGuestsRoomsSelector()}
        </div>
      </div>
      
      {/* Search Button */}
      <Button 
        className="w-full h-12 bg-orange-500 text-white hover:bg-orange-600 mt-6"
        onClick={handleHotelSearch}
        disabled={isLoading}
      >
        <Search className="ml-2 h-4 w-4" />
        {isLoading ? "در حال جستجو..." : "جستجوی هتل"}
      </Button>
    </div>
  )
}

export default HotelSearch