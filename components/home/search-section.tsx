// components/search-section.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hotel, Plane, Train, Search, Calendar, MapPin, Users, ChevronDown, Loader2, Bed, User } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useSearch } from "@/hooks/use-search"
import FlightSearch from "../flights/flight-search"
import HotelSearch from "../hotels/hotel-search"
import DomesticFlightSearch from "../flights/domestic-flight-search"
gsap.registerPlugin(ScrollTrigger)

interface SearchSectionProps {
  onSearchResults: (results: any, type: string) => void
}

interface Suggestion {
  id: string
  name: string
  country: string
  code?: string
  city?: string
  type: 'city' | 'airport'
}

export function SearchSection({ onSearchResults }: SearchSectionProps) {
  const [activeTab, setActiveTab] = useState<"hotel" | "flight">("hotel")
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

  const { searchHotels, searchFlights, searchTrains, getCitySuggestions } = useSearch()

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
        const data = await getCitySuggestions(currentInput, activeTab)
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
  }, [currentInput, activeTab, getCitySuggestions])

  const handleSuggestionClick = (suggestion: Suggestion, field: string) => {
    let value = ""
    
    if (suggestion.type === 'airport') {
      value = `${suggestion.city} (${suggestion.code}) - ${suggestion.name}`
    } else {
      value = suggestion.name
    }
    
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
    } else if (activeTab === "flight") {
      setFlightSearch(prev => ({ ...prev, [field]: value }))
    } else if (activeTab === "train") {
      setTrainSearch(prev => ({ ...prev, [field]: value }))
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

  const renderSuggestions = (field: string) => {
    if (!showSuggestions || suggestions.length === 0 || currentField !== field) return null

    return (
      <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
        {suggestions.map((suggestion, index) => (
          <div
            key={`${suggestion.id}-${index}`}
            className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
              index === activeSuggestionIndex ? "bg-blue-50 dark:bg-blue-900/20" : ""
            } ${index !== suggestions.length - 1 ? "border-b border-gray-100 dark:border-gray-600" : ""}`}
            onClick={() => handleSuggestionClick(suggestion, field)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {suggestion.type === 'airport' ? (
                  <>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {suggestion.city} <span className="text-blue-600">({suggestion.code})</span>
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                      {suggestion.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {suggestion.country}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {suggestion.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {suggestion.country}
                    </div>
                  </>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                suggestion.type === 'airport' 
                  ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                  : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
              }`}>
                {suggestion.type === 'airport' ? 'فرودگاه' : 'شهر'}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const handleHotelSearch = async () => {
    if (!hotelSearch.city || !hotelSearch.checkIn || !hotelSearch.checkOut) {
      alert("لطفا تمام فیلدهای ضروری را پر کنید")
      return
    }

    setIsLoading(true)
    try {
      const results = await searchHotels(hotelSearch)
      onSearchResults(results, "hotel")
    } catch (error) {
      console.error("Hotel search error:", error)
      alert("خطا در جستجوی هتل")
    } finally {
      setIsLoading(false)
    }
  }

  

  const handleTrainSearch = async () => {
    if (!trainSearch.from || !trainSearch.to || !trainSearch.departureDate) {
      alert("لطفا تمام فیلدهای ضروری را پر کنید")
      return
    }

    if (trainSearch.tripType === "roundtrip" && !trainSearch.returnDate) {
      alert("لطفا تاریخ برگشت را نیز انتخاب کنید")
      return
    }

    setIsLoading(true)
    try {
      const results = await searchTrains(trainSearch)
      onSearchResults(results, "train")
    } catch (error) {
      console.error("Train search error:", error)
      alert("خطا در جستجوی قطار")
    } finally {
      setIsLoading(false)
    }
  }

  const getTomorrowDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split('T')[0]
  }

  const getNextWeekDate = () => {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    return nextWeek.toISOString().split('T')[0]
  }
  const cardBackgrounds = {
    hotel: 'bg-emerald-400',
    flight: 'bg-blue-400',
    domesticFlights: 'bg-red-400'
  }

  return (
    <section ref={sectionRef} className={`py-16 md:py-24  dark:from-gray-900 dark:to-blue-900 ${cardBackgrounds[activeTab]}`}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white dark:text-white mb-4">
            سفر بعدی خود را پیدا کنید
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            بهترین هتل ها، پروازها و قطارها را با بهترین قیمت ها کشف کنید
          </p>
        </div>

        <Card ref={cardRef} className={`mx-auto shadow-none ${cardBackgrounds[activeTab]} w-full border-0 dark:bg-gray-800/95 backdrop-blur-sm`}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 p-1">
              <TabsTrigger 
                value="hotel" 
                className="flex items-center gap-3 data-[state=active]:text-emerald-400 text-white data-[state=active]:bg-white py-3 transition-all duration-300"
              >
                <Hotel className="h-12 w-12" />
                <span className=" data-[state=active]:text-black font-black lg:text-2xl">هتل</span>
              </TabsTrigger>
              <TabsTrigger 
                value="flight" 
                className="flex items-center gap-3 data-[state=active]:bg-white text-white data-[state=active]:text-blue-400 py-3 transition-all duration-300"
              >
                <Plane className="h-12 w-12" />
                <span className=" font-black lg:text-2xl">پرواز خارجی</span>
              </TabsTrigger>
              <TabsTrigger 
                value="domesticFlights" 
                className="flex items-center gap-3 data-[state=active]:bg-white text-white data-[state=active]:text-red-400 py-3 transition-all duration-300"
              >
                <Plane className="h-12 w-12" />
                <span className=" font-black lg:text-2xl">پرواز داخلی</span>
              </TabsTrigger>
            </TabsList>

            {/* Hotel Search */}
            <TabsContent value="hotel" className="space-y-6 p-4">
              <HotelSearch />
            </TabsContent>

            {/* Flight Search */}
            <TabsContent value="flight" className="space-y-6 p-4">
                  <FlightSearch />
            </TabsContent>

            <TabsContent value="domesticFlights" className="space-y-6 p-4">
                  <DomesticFlightSearch />
            </TabsContent>

            {/* Train Search */}
            <TabsContent value="train" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-3 relative">
                  <Label htmlFor="train-from" className="text-sm font-semibold">مبدا</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    {suggestionLoading && currentField === "from" && (
                      <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <Input 
                      id="train-from" 
                      placeholder="تهران, اصفهان..." 
                      className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                      value={trainSearch.from}
                      onChange={(e) => handleInputChange(e.target.value, "from")}
                      onKeyDown={(e) => handleKeyDown(e, "from")}
                      onFocus={() => setCurrentField("from")}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    {renderSuggestions("from")}
                  </div>
                </div>
                
                <div className="space-y-3 relative">
                  <Label htmlFor="train-to" className="text-sm font-semibold">مقصد</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    {suggestionLoading && currentField === "to" && (
                      <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                    )}
                    <Input 
                      id="train-to" 
                      placeholder="مشهد, شیراز..." 
                      className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                      value={trainSearch.to}
                      onChange={(e) => handleInputChange(e.target.value, "to")}
                      onKeyDown={(e) => handleKeyDown(e, "to")}
                      onFocus={() => setCurrentField("to")}
                      onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                    />
                    {renderSuggestions("to")}
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="train-trip-type" className="text-sm font-semibold">نوع سفر</Label>
                  <div className="relative">
                    <select 
                      id="train-trip-type"
                      className="w-full h-12 rounded-lg border-2 border-input bg-background px-3 pr-10 focus:border-blue-500 transition-colors appearance-none"
                      value={trainSearch.tripType}
                      onChange={(e) => setTrainSearch(prev => ({ ...prev, tripType: e.target.value }))}
                    >
                      <option value="oneway">یک طرفه</option>
                      <option value="roundtrip">رفت و برگشت</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-3">
                  <Label htmlFor="train-departure-date" className="text-sm font-semibold">تاریخ رفت</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="train-departure-date" 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                      value={trainSearch.departureDate}
                      onChange={(e) => setTrainSearch(prev => ({ ...prev, departureDate: e.target.value }))}
                    />
                  </div>
                </div>

                {trainSearch.tripType === "roundtrip" && (
                  <div className="space-y-3">
                    <Label htmlFor="train-return-date" className="text-sm font-semibold">تاریخ برگشت</Label>
                    <div className="relative">
                      <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input 
                        id="train-return-date" 
                        type="date" 
                        min={trainSearch.departureDate || new Date().toISOString().split('T')[0]}
                        className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                        value={trainSearch.returnDate}
                        onChange={(e) => setTrainSearch(prev => ({ ...prev, returnDate: e.target.value }))}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label htmlFor="train-class" className="text-sm font-semibold">کلاس قطار</Label>
                  <div className="relative">
                    <select 
                      id="train-class"
                      className="w-full h-12 rounded-lg border-2 border-input bg-background px-3 pr-10 focus:border-blue-500 transition-colors appearance-none"
                      value={trainSearch.class}
                      onChange={(e) => setTrainSearch(prev => ({ ...prev, class: e.target.value }))}
                    >
                      <option value="standard">استاندارد</option>
                      <option value="first">درجه یک</option>
                      <option value="sleeper">کوپه خواب</option>
                    </select>
                    <ChevronDown className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="train-passengers" className="text-sm font-semibold">تعداد مسافر</Label>
                  <div className="relative">
                    <Users className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="train-passengers" 
                      type="number" 
                      min="1"
                      max="10"
                      className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                      value={trainSearch.passengers}
                      onChange={(e) => setTrainSearch(prev => ({ ...prev, passengers: parseInt(e.target.value) || 1 }))}
                    />
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full h-14 text-lg rounded-lg bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handleTrainSearch}
                disabled={isLoading}
              >
                <Search className="ml-2 h-5 w-5" />
                {isLoading ? "در حال جستجو..." : "جستجوی قطار"}
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  )
}