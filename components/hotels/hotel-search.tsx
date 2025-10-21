"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Calendar, MapPin, Users, Loader2, Bed, Plus, Minus } from "lucide-react"
import gsap from "gsap"
import { hotels } from "@/lib/data/hotels"
import { useSnack } from "@/hooks/use-notification"
import { useHotel } from "@/contexts/search/HotelContext"
import { useRouter } from "next/navigation"

// Updated interface for city suggestions
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

const HotelSearch = () => {
  const [isLoading, setIsLoading] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const router = useRouter()
  
  // Hotel search state
  const [hotelSearch, setHotelSearch] = useState<HotelSearchFormData>({
    city: "",
    cityId: undefined,
    cityType: undefined,
    propertyDestinationId: undefined,
    checkIn: "",
    checkOut: "",
    guests: 2,
    rooms: 1
  })

  // Guests & Rooms popover state
  const [showGuestsRooms, setShowGuestsRooms] = useState(false)

  // Suggestions state
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [currentInput, setCurrentInput] = useState("")
  const [isCityFocused, setIsCityFocused] = useState(false)

  const { error, success } = useSnack()
  const { setHotelsData, setRequest } = useHotel()

  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const guestsRoomsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          end: "top 50%",
          scrub: 1,
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  // Fetch city suggestions with debounce
  const fetchCitySuggestions = async (query: string): Promise<CitySuggestion[]> => {
    if (query.length < 2) {
      return [];
    }

    try {
      const response = await fetch(`/api/hotels/search?q=${encodeURIComponent(query)}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions');
      }
      const data = await response.json();
      return data.results || [];
    } catch (error) {
      console.error("Error fetching city suggestions:", error);
      return [];
    }
  };

  // Fetch suggestions with debounce
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
      // Close suggestions
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false)
      }

      // Close guests/rooms popover
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
    if (!hotelSearch.city || !hotelSearch.cityId) {
      alert("لطفاً یک شهر معتبر انتخاب کنید")
      return
    }

    if (!hotelSearch.checkIn || !hotelSearch.checkOut) {
      alert("لطفاً تاریخ ورود و خروج را انتخاب کنید")
      return
    }

    setIsLoading(true)
    try {
      setSearchLoading(true)
      const response = await fetch('/api/hotels/search/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hotelSearch)
      })

      if (!response.ok) {
        error("خطا در دریافت اطلاعات")
      }

      const data = await response.json()
      setHotelsData(data.data)
      setRequest(data.request)
      router.push('/hotels/')
      setSearchLoading(false)
      
    } catch (error) {
      console.error("Error searching hotels:", error)
    } finally {
      setIsLoading(false)
    }
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
            key={`${suggestion.id}-${suggestion.type}`}
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
                  <span className="font-bold text-lg text-gray-800">
                    {suggestion.nameFa || suggestion.name}
                  </span>
                  {suggestion.nameFa && (
                    <span className="text-base text-gray-500">({suggestion.name})</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-2 justify-end">
                  <span className={`text-sm px-3 py-1.5 rounded-full font-medium ${
                    suggestion.type === 'domestic' 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {suggestion.type === 'domestic' ? 'داخلی' : 'بین‌المللی'}
                  </span>
                  {suggestion.isPopular && (
                    <span className="text-sm bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full font-medium border border-yellow-200">
                      💫 محبوب
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
        className="absolute top-full right-0 left-0 bg-white border-2 border-blue-300 rounded-2xl shadow-2xl z-50 p-6 mt-2 transition-all duration-300 transform origin-top"
        style={{
          animation: 'slideDown 0.3s ease-out'
        }}
      >
        <div className="space-y-6">
          {/* Guests Selector */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="font-bold text-lg text-gray-800">تعداد مهمان</div>
              <div className="text-sm text-gray-600 mt-1">حداکثر 10 مهمان</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleGuestsRoomsChange('guests', 'decrement')}
                disabled={hotelSearch.guests <= 1}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-2xl font-bold text-gray-800 min-w-8 text-center">
                {hotelSearch.guests}
              </span>
              <button
                onClick={() => handleGuestsRoomsChange('guests', 'increment')}
                disabled={hotelSearch.guests >= 10}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Rooms Selector */}
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="font-bold text-lg text-gray-800">تعداد اتاق</div>
              <div className="text-sm text-gray-600 mt-1">حداکثر 5 اتاق</div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleGuestsRoomsChange('rooms', 'decrement')}
                disabled={hotelSearch.rooms <= 1}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              >
                <Minus className="h-5 w-5" />
              </button>
              <span className="text-2xl font-bold text-gray-800 min-w-8 text-center">
                {hotelSearch.rooms}
              </span>
              <button
                onClick={() => handleGuestsRoomsChange('rooms', 'increment')}
                disabled={hotelSearch.rooms >= 5}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-3xl ">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* City Input - Enhanced with animations */}
        <div className="space-y-3 relative">
          <Label htmlFor="hotel-city" className="text-lg font-bold text-white text-right block">شهر مقصد</Label>
          <div className="relative">
            <MapPin className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
            {suggestionLoading && (
              <Loader2 className="absolute left-4 top-4 h-5 w-5 animate-spin text-blue-600" />
            )}
            <Input 
              ref={inputRef}
              id="hotel-city" 
              placeholder="تهران، استانبول، دبی..." 
              className={`pr-12 h-14 rounded-2xl border-2 bg-white text-gray-800 placeholder-gray-500 text-lg font-medium transition-all duration-300 ${
                isCityFocused 
                  ? 'border-blue-500 scale-105 shadow-lg' 
                  : 'border-gray-300 hover:border-blue-400'
              } ${showSuggestions ? 'rounded-b-none border-b-2 border-b-blue-300' : ''}`}
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
          </div>
        </div>
        
        {/* Check-in Date */}
        <div className="space-y-3">
          <Label htmlFor="hotel-checkin" className="text-lg font-bold text-white text-right block">تاریخ ورود</Label>
          <div className="relative">
            <Calendar className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
            <Input 
              id="hotel-checkin" 
              type="date" 
              min={new Date().toISOString().split('T')[0]}
              className="pr-12 h-14 rounded-2xl border-2 border-gray-300 bg-white text-gray-800 text-lg font-medium transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:scale-105 focus:shadow-lg"
              value={hotelSearch.checkIn}
              onChange={(e) => setHotelSearch(prev => ({ ...prev, checkIn: e.target.value }))}
            />
          </div>
        </div>
        
        {/* Check-out Date */}
        <div className="space-y-3">
          <Label htmlFor="hotel-checkout" className="text-lg font-bold text-white text-right block">تاریخ خروج</Label>
          <div className="relative">
            <Calendar className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
            <Input 
              id="hotel-checkout" 
              type="date" 
              min={hotelSearch.checkIn || new Date().toISOString().split('T')[0]}
              className="pr-12 h-14 rounded-2xl border-2 border-gray-300 bg-white text-gray-800 text-lg font-medium transition-all duration-300 hover:border-blue-400 focus:border-blue-500 focus:scale-105 focus:shadow-lg"
              value={hotelSearch.checkOut}
              onChange={(e) => setHotelSearch(prev => ({ ...prev, checkOut: e.target.value }))}
            />
          </div>
        </div>
        
        {/* Guests & Rooms Selector */}
        <div className="space-y-3 relative">
          <Label className="text-lg font-bold text-white text-right block">مهمان و اتاق</Label>
          <div 
            className="guests-rooms-trigger cursor-pointer"
            onClick={() => setShowGuestsRooms(!showGuestsRooms)}
          >
            <div className="relative h-14 rounded-2xl border-2 border-gray-300 bg-white hover:border-blue-400 transition-all duration-300 flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                <Users className="h-5 w-5 text-gray-400" />
                <Bed className="h-5 w-5 text-gray-400" />
              </div>
              <div className="text-right">
                <div className="text-gray-800 text-lg font-medium">
                  {hotelSearch.guests} مهمان
                </div>
                <div className="text-gray-500 text-sm">
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
        className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-to-r from-white to-blue-100 text-blue-600 hover:from-blue-100 hover:to-white transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 mt-8"
        onClick={handleHotelSearch}
        disabled={isLoading}
      >
        <Search className="ml-3 h-6 w-6" />
        {isLoading ? "در حال جستجو..." : "جستجوی هتل"}
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
        
        /* Style the date input for better appearance */
        input[type="date"] {
          color-scheme: light;
        }
      `}</style>
    </div>
  )
}

export default HotelSearch