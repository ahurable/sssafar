"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Search, Calendar, MapPin, Users, Loader2, Bed } from "lucide-react"
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

  // Suggestions state
  const [suggestions, setSuggestions] = useState<CitySuggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [currentInput, setCurrentInput] = useState("")

  const { error, success } = useSnack()
  const { setHotelsData, setRequest } = useHotel()

  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)


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

  const handleSuggestionClick = (suggestion: CitySuggestion) => {
    console.log('clicked on suggestion')
    const displayValue = suggestion.nameFa 
      ? `${suggestion.nameFa} (${suggestion.name})`
      : suggestion.name;
    console.log(displayValue)
    
    setHotelSearch(prev => ({
      ...prev,
      city: displayValue,
      cityId: suggestion.id,
      cityType: suggestion.type,
      propertyDestinationId: suggestion.propertyDestinationId
    }))
    
    setShowSuggestions(false)
    setCurrentInput("")
  }

  // Add this useEffect to handle clicks outside
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

  const handleInputChange = (value: string) => {
    setCurrentInput(value)
    // Only update the display value, clear the IDs when user is typing
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

  const handleHotelSearch = async () => {
    // Validate form data
    if (!hotelSearch.city || !hotelSearch.cityId) {
      alert("لطفاً یک شهر معتبر انتخاب کنید")
      return
    }

    if (!hotelSearch.checkIn || !hotelSearch.checkOut) {
      alert("لطفاً تاریخ ورود و خروج را انتخاب کنید")
      return
    }

    if (!hotelSearch.guests) {
      alert("لطفاً تاریخ تعداد مهمانان را انتخاب کنید")
      return
    }

    setIsLoading(true)
    try {
      // Here you would make your actual hotel search API call
      console.log("Searching with data:", hotelSearch)
      
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
      console.log(data)
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
        className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-1"
      >
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.id}-${suggestion.type}`}
            className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors ${
              index === activeSuggestionIndex ? 'bg-blue-50 border-blue-200' : ''
            }`}
            onMouseDown={(e) => {
              e.preventDefault() // Prevent input blur
              handleSuggestionClick(suggestion)
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">
                    {suggestion.nameFa || suggestion.name}
                  </span>
                  {suggestion.nameFa && (
                    <span className="text-xs text-gray-500">({suggestion.name})</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    suggestion.type === 'domestic' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {suggestion.type === 'domestic' ? 'داخلی' : 'بین‌المللی'}
                  </span>
                  {suggestion.isPopular && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
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


  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3 relative">
          <Label htmlFor="hotel-city" className="text-sm font-semibold">شهر مقصد</Label>
          <div className="relative">
            <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            {suggestionLoading && (
              <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            <Input 
              id="hotel-city" 
              placeholder="تهران، استانبول، دبی..." 
              className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
              value={hotelSearch.city}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
            {renderSuggestions()}
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="hotel-checkin" className="text-sm font-semibold">تاریخ ورود</Label>
          <div className="relative">
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="hotel-checkin" 
              type="date" 
              min={new Date().toISOString().split('T')[0]}
              className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
              value={hotelSearch.checkIn}
              onChange={(e) => setHotelSearch(prev => ({ ...prev, checkIn: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="space-y-3">
          <Label htmlFor="hotel-checkout" className="text-sm font-semibold">تاریخ خروج</Label>
          <div className="relative">
            <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              id="hotel-checkout" 
              type="date" 
              min={hotelSearch.checkIn || new Date().toISOString().split('T')[0]}
              className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
              value={hotelSearch.checkOut}
              onChange={(e) => setHotelSearch(prev => ({ ...prev, checkOut: e.target.value }))}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="hotel-guests" className="text-sm font-semibold">تعداد مهمان</Label>
            <div className="relative">
              <Users className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="hotel-guests" 
                type="number" 
                min="1"
                max="10"
                className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                value={hotelSearch.guests}
                onChange={(e) => setHotelSearch(prev => ({ ...prev, guests: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="hotel-rooms" className="text-sm font-semibold">تعداد اتاق</Label>
            <div className="relative">
              <Bed className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                id="hotel-rooms" 
                type="number" 
                min="1"
                max="5"
                className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                value={hotelSearch.rooms}
                onChange={(e) => setHotelSearch(prev => ({ ...prev, rooms: parseInt(e.target.value) || 1 }))}
              />
            </div>
          </div>
        </div>
      </div>
      
      <Button 
        className="w-full h-14 text-lg rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        onClick={handleHotelSearch}
        disabled={isLoading}
      >
        <Search className="ml-2 h-5 w-5" />
        {isLoading ? "در حال جستجو..." : "جستجوی هتل"}
      </Button>
    </>
  )
}

export default HotelSearch