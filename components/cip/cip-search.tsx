// components/cip/cip-search.tsx
"use client"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Plane, Calendar, MapPin, Users, AlertCircle, Loader2, User, Baby, Minus, Plus, Heart } from "lucide-react"
import ShamsiDateModal from "../flights/ShamsiCalendar"
import { shamsiToGregorianString } from "@/lib/jalaalil"
import { useRouter } from "next/navigation"
import { useCip } from "@/contexts/search/CipContext"
import { Select } from "../ui/select"
import { SelectContent, SelectItem, SelectTrigger, SelectValue } from "@radix-ui/react-select"

interface AirportSuggestion {
  id: string,
  name: string,
  airportCity: string,
  airportIata: string,
  airportServeTypes: {
    id: string,
    title: string
  }[]
}

interface CipSearchFormData {
  airport: string;
  airportId?: string;
  date: string;
  adults: number
  children: number
  infants: number
  serviceType: string;
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
    adults: 1,
    children: 0,
    infants: 0,
    serviceType: ""
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isLoading, setIsLoading] = useState(false)

  const [suggestions, setSuggestions] = useState<AirportSuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [currentInput, setCurrentInput] = useState("")
  const [isAirportFocused, setIsAirportFocused] = useState(false)
  const [showPassengers, setShowPassengers] = useState(false)
  const [airports, setAirports] = useState<AirportSuggestion[]>()
  const [selectedAirport, setSelectedAirport] = useState<AirportSuggestion>()
  const [showFavorites, setShowFavorites] = useState(false)
  const router = useRouter()
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const passengersRef = useRef<HTMLDivElement>(null)
  const { setSearchData, searchData } = useCip()

  // Clear errors when user starts typing
  useEffect(() => {
    if (errors.airport && cipSearch.airport) {
      setErrors(prev => ({ ...prev, airport: undefined }))
    }
    if (errors.date && cipSearch.date) {
      setErrors(prev => ({ ...prev, date: undefined }))
    }
  }, [cipSearch.airport, cipSearch.date, errors])

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

  useEffect(() => {
    const fetchAirports = async () => {
      const response = await fetch('/api/airports')
      const data = await response.json()
      console.log(data)
      if (response.ok)
        setAirports(data)
    }
    fetchAirports()
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

  const handlePassengerChange = (type: 'adults' | 'children' | 'infants', operation: 'increment' | 'decrement') => {
    setCipSearch(prev => {
      const currentValue = prev[type];
      let newValue = currentValue;

      if (operation === 'increment') {
        const maxValues = { adults: 9, children: 8, infants: 4 };

        // Calculate current total using all passenger types from prev state
        const currentTotal = prev.adults + prev.children + prev.infants;

        // Check if adding one would exceed maximum total of 9
        if (currentTotal >= 9) {
          return prev; // Don't allow increment - return previous state unchanged
        }

        // Special validation for children - they must be less than adults
        if (type === 'children') {
          // Children cannot be equal to or greater than adults
          if (prev.children >= prev.adults) {
            return prev; // Don't allow increment
          }
        } else if (type === 'infants') {
          // infants cannot be equal to or greater than adults
          if (prev.infants >= prev.adults) {
            return prev; // Don't allow increment
          }
        }

        newValue = Math.min(currentValue + 1, maxValues[type]);
      } else {
        const minValues = { adults: 1, children: 0, infants: 0 };
        newValue = Math.max(currentValue - 1, minValues[type]);
      }

      return { ...prev, [type]: newValue };
    });
  };

  const totalPassengers = cipSearch.adults + cipSearch.children + cipSearch.infants

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

    if (!totalPassengers || totalPassengers < 1) {
      newErrors.passengers = "تعداد مسافران باید حداقل ۱ باشد"
    } else if (totalPassengers > 10) {
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
    setSelectedAirport(suggestion)
    setShowSuggestions(false)
    setShowFavorites(false)
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

  useEffect(() => {
    console.log(selectedAirport)
  }, [selectedAirport])

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

  const renderPassengersSelector = () => {
    if (!showPassengers) return null

    return (
      <div
        ref={passengersRef}
        className="absolute top-full right-0 left-0 bg-[#fffefe] border border-blue-900 shadow-lg z-50 p-4 mt-1 rounded-md"
      >
        <div className="space-y-4">
          {/* Adults Selector */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="font-bold text-blue-950">بزرگسالان</div>
              <div className="text-xs text-gray-600 mt-1">(12 سال به بالا)</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePassengerChange('adults', 'decrement')}
                disabled={cipSearch.adults <= 1}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold text-blue-950 min-w-6 text-center">
                {cipSearch.adults}
              </span>
              <button
                onClick={() => handlePassengerChange('adults', 'increment')}
                disabled={cipSearch.adults >= 9}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Children Selector */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="font-bold text-blue-950">کودکان</div>
              <div className="text-xs text-gray-600 mt-1">(2 تا 12 سال)</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePassengerChange('children', 'decrement')}
                disabled={cipSearch.children <= 0}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold text-blue-950 min-w-6 text-center">
                {cipSearch.children}
              </span>
              <button
                onClick={() => handlePassengerChange('children', 'increment')}
                disabled={cipSearch.children >= 8}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Infants Selector */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="font-bold text-blue-950">نوزادان</div>
              <div className="text-xs text-gray-600 mt-1">(زیر 2 سال)</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handlePassengerChange('infants', 'decrement')}
                disabled={cipSearch.infants <= 0}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
              >
                <Minus className="h-4 w-4" />
              </button>
              <span className="text-lg font-bold text-blue-950 min-w-6 text-center">
                {cipSearch.infants}
              </span>
              <button
                onClick={() => handlePassengerChange('infants', 'increment')}
                disabled={cipSearch.infants >= 4}
                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
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

  const handleFavoriteClick = (favorite: AirportSuggestion) => {
    handleSuggestionClick(favorite)
  }

  const favoritesRef = useRef(null)

  const renderFavorites = () => {
    if (!showFavorites || !airports || currentInput.length > 0) return null

    return (
      <div
        ref={favoritesRef}
        className="absolute top-full right-0 left-0 bg-[#fffefe] shadow-lg z-50 max-h-80 overflow-y-auto mt-1 rounded-md"
      >
        <div className="p-3 bg-gray-50">
          <div className="flex items-center gap-2 justify-start">
            <Heart className="h-4 w-4 text-red-500" />
            <span className="font-bold text-blue-950">مقاصد محبوب داخلی</span>
          </div>
        </div>
        {airports.map((favorite, index) => (
          <div
            key={`${index}`}
            className="p-3 cursor-pointer last:border-b-0 hover:bg-gray-50"
            onMouseDown={(e) => {
              e.preventDefault() // Prevent input blur
              handleFavoriteClick(favorite)
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1 text-right">
                <div className="flex items-center gap-2 justify-start">
                  <span className="font-bold text-blue-950">
                    {favorite.name}
                  </span>
                  <span className="text-blue-500 font-bold">({favorite.airportCity})</span>
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {favorite.airportIata}
                </div>
                <div className="flex items-center gap-2 mt-1 justify-start">
                  <span className="text-xs text-gray-500">
                    ایران
                  </span>
                  <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-blue-900">
                    فرودگاه
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
              className={`pr-10 h-12 border cursor-pointer border-blue-900 bg-[#fffefe] text-blue-950 placeholder-gray-500 ${errors.airport
                ? 'border-red-500 bg-red-500'
                : 'border-blue-900'
                }`}
              value={cipSearch.airport}
              onChange={(e) => fetchSuggestions(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                setIsAirportFocused(true)
                setShowFavorites(true)
                setShowSuggestions(suggestions.length > 0)
              }}
              onClick={() => {
                setCipSearch((prev) => ({
                  ...prev,
                  airport: ""
                }))
                setShowFavorites(true)
              }}
              onBlur={() => {
                setIsAirportFocused(false)
                setTimeout(() => setShowSuggestions(false), 200)
              }}
              autoComplete="off"
            />
            {renderSuggestions()}
            {renderFavorites()}
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
            <Select
              value={cipSearch.serviceType || "placeholder"}
              onValueChange={(value) => {
                if (value === "placeholder") {
                  setCipSearch({ ...cipSearch, serviceType: "" });
                } else {
                  setCipSearch({ ...cipSearch, serviceType: value });
                }
              }}
              disabled={!selectedAirport}
            >
              <SelectTrigger className="h-12 border border-blue-900 rounded-lg col-span-2 text-right px-4 bg-white hover:border-blue-700 transition-colors">
                <SelectValue>
                  {cipSearch.serviceType.length > 0 && cipSearch.serviceType || "یک سرویس انتخاب کنید"}
                </SelectValue>
              </SelectTrigger>

              <SelectContent className="border border-blue-900 rounded-lg mt-1 shadow-lg bg-white max-h-60 overflow-y-auto">
                {/* Placeholder option with a unique value */}
                <SelectItem
                  value="placeholder"
                  className="
                    h-12 
                    flex 
                    items-center 
                    px-4 
                    text-gray-500
                    hover:bg-blue-50 
                    hover:text-blue-800
                    cursor-pointer
                    data-[state=checked]:bg-blue-100
                    data-[state=checked]:text-blue-800
                    border-b
                    border-b-gray-100
                  "
                >
                  یک سرویس انتخاب کنید
                </SelectItem>

                {/* Service options */}
                {selectedAirport && selectedAirport.airportServeTypes.length > 0 ? (
                  selectedAirport.airportServeTypes.map((service, index) => (
                    <SelectItem
                      key={service.id || index}
                      value={service.title}
                      className="
                        h-12 
                        flex 
                        items-center 
                        px-4 
                        text-gray-700
                        bg-white
                        hover:bg-blue-50 
                        hover:text-blue-800
                        cursor-pointer
                        transition-colors
                        data-[state=checked]:bg-blue-100
                        data-[state=checked]:text-blue-800
                        data-[state=checked]:font-medium
                        border-t
                        border-t-gray-100
                      "
                    >
                      {service.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem
                    value="no-service"
                    disabled
                    className="h-12 flex items-center px-4 text-gray-400 border-t border-t-gray-100"
                  >
                    سرویسی موجود نیست
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Passengers */}
        {/* Passengers Selector */}
        <div className="space-y-2 col-span-1 relative">
          <Label className="text-blue-950 text-right block">مسافران</Label>
          <div
            className="passengers-trigger cursor-pointer"
            onClick={() => setShowPassengers(!showPassengers)}
          >
            <div className={`relative h-12 border rounded-lg bg-[#fffefe] hover:border-gray-400 flex items-center justify-between px-3 ${showPassengers ? 'border-blue-500' : 'border-blue-900'
              }`}>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-gray-400" />
                <User className="h-4 w-4 text-gray-400" />
                <Baby className="h-4 w-4 text-gray-400" />
              </div>
              <div className="text-right">
                <div className="text-blue-950 text-sm font-medium">
                  {totalPassengers} مسافر
                </div>
                <div className="text-gray-500 text-xs">
                  {cipSearch.adults} بزرگسال, {cipSearch.children} کودک, {cipSearch.infants} نوزاد
                </div>
              </div>
            </div>
          </div>
          {renderPassengersSelector()}
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
    </div >
  )
}

export default CipSearch