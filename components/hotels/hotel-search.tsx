"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearch } from "@/hooks/use-search"
import { Search, Calendar, MapPin, Users, Loader2, Bed } from "lucide-react"
import { useHotel } from '@/contexts/search/HotelContext'
import gsap from "gsap"

interface SearchSectionProps {
  onSearchResults: (results: any, type: string) => void
}

interface Suggestion {
  iata: string
  name: string
  city: string
}

const HotelSearch = () => {
    
const [activeTab, setActiveTab] = useState("hotel")
  const [isLoading, setIsLoading] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // Hotel search state
  const [hotelSearch, setHotelSearch] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: 2,
    rooms: 1
  })


  // Train search state
  const [trainSearch, setTrainSearch] = useState({
    from: "",
    to: "",
    departureDate: "",
    returnDate: "",
    passengers: 1,
    tripType: "oneway",
    class: "standard"
  })

  // Suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
  const [suggestionLoading, setSuggestionLoading] = useState(false)
  const [currentInput, setCurrentInput] = useState("")
  const [currentField, setCurrentField] = useState("")
  const { handleSuggestions } = useHotel()
//   const { getCitySuggestions } = useSearch()


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
        const data = await handleSuggestions(currentInput)
        if (data)
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
  }, [currentInput, activeTab, handleSuggestions])

    const handleSuggestionClick = (suggestion: Suggestion, field: string) => {
        let value = ""
        
        value = `${suggestion.city} (${suggestion.iata}) - ${suggestion.name}`
       
        
        if (activeTab === "hotel") {
        setHotelSearch(prev => ({ ...prev, [field]: value }))
        } else if (activeTab === "train") {
        setTrainSearch(prev => ({ ...prev, [field]: value }))
        }
        
        setShowSuggestions(false)
        setCurrentInput("")
    }

  const handleInputChange = (value: string, field: string) => {
    setCurrentInput(value)
    setCurrentField(field)
    
    if (activeTab === "hotel") {
      setHotelSearch(prev => ({ ...prev, [field]: value }))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
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
        handleSuggestionClick(suggestions[activeSuggestionIndex], field)
      }
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
    }
  }

  const handleHotelSearch = async () => {

  }

  const renderSuggestions = (field: string) => {
    if (!showSuggestions || suggestions.length === 0 || currentField !== field) return null
  }
    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-3 relative">
                  <Label htmlFor="hotel-city" className="text-sm font-semibold">شهر مقصد</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    {suggestionLoading && currentField === "city" && (
                      <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <Input 
                      id="hotel-city" 
                      placeholder="تهران، استانبول، دبی..." 
                      className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                      value={hotelSearch.city}
                      onChange={(e) => handleInputChange(e.target.value, "city")}
                      onKeyDown={(e) => handleKeyDown(e, "city")}
                      onFocus={() => setCurrentField("city")}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    {renderSuggestions("city")}
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