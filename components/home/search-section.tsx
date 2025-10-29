// components/search-section.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Hotel, Plane, } from "lucide-react"
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
  const [activeTab, setActiveTab] = useState<"hotel" | "flight" | "domesticFlights">("domesticFlights")
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

  
  const cardBackgrounds = {
    hotel: 'bg-emerald-400',
    flight: 'bg-blue-400',
    domesticFlights: 'bg-red-400'
  }

  return (
    <section ref={sectionRef} className={`py-16 md:py-24 relative  dark:from-gray-900 dark:to-blue-900 ${cardBackgrounds[activeTab]}`}>
      <div className="w-full h-full absolute top-0 right-0 bg-[url('/pattern.png')] bg-[length:180px_180px] z-10 opacity-10"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 relative z-30">
          <h2 className="text-4xl font-bold text-white dark:text-white mb-4">
            سفر بعدی خود را پیدا کنید
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            بهترین هتل ها، پروازها و قطارها را با بهترین قیمت ها کشف کنید
          </p>
        </div>

        <Card ref={cardRef} className={`mx-auto relative z-30 shadow-none w-full border-0 dark:bg-gray-800/95`}>
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

            
          </Tabs>
        </Card>
      </div>
    </section>
  )
}