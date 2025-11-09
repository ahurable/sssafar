// components/search-section.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Hotel, Plane, Crown, Map, Building, X, Search } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useSearch } from "@/hooks/use-search"
import FlightSearch from "../flights/flight-search"
import HotelSearch from "../hotels/hotel-search"
import DomesticFlightSearch from "../flights/domestic-flight-search"
import CipSearch from "../cip/cip-search"
import TourSearch from "../tours/tour-search"
import DomesticHotelSearch from "../hotels/domestic-hotel-search"

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
  const [activeTab, setActiveTab] = useState<"hotel" | "flight" | "domesticFlights" | "cip" | "tour" | "domesticHotel">("domesticFlights")
  const [isLoading, setIsLoading] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const cardBackgrounds = {
    hotel: 'bg-emerald-400',
    flight: 'bg-blue-400',
    domesticFlights: 'bg-red-400',
    cip: 'bg-purple-400',
    tour: 'bg-orange-400',
    domesticHotel: 'bg-cyan-400'
  }

  const tabConfig = {
    cip: { icon: Crown, label: "CIP فرودگاهی", color: "purple" },
    tour: { icon: Map, label: "گشت شهری", color: "orange" },
    domesticHotel: { icon: Building, label: "هتل داخلی", color: "cyan" },
    hotel: { icon: Hotel, label: "هتل خارجی", color: "emerald" },
    flight: { icon: Plane, label: "پرواز خارجی", color: "blue" },
    domesticFlights: { icon: Plane, label: "پرواز داخلی", color: "red" },
  }

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

  const handleTabClick = (tab: string) => {
    setActiveTab(tab as any)
    setMobileOpen(false)
  }

  // Mobile Tab Buttons
  const MobileTabButtons = () => (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {Object.entries(tabConfig).map(([key, config]) => {
        const Icon = config.icon
        return (
          <Button
            key={key}
            variant={activeTab === key ? "default" : "outline"}
            className={`flex flex-col items-center gap-2 h-20 ${
              activeTab === key 
                ? `bg-${config.color}-500 text-white border-${config.color}-500` 
                : 'bg-white text-gray-700'
            }`}
            onClick={() => handleTabClick(key)}
          >
            <Icon className="h-6 w-6" />
            <span className="text-sm font-medium">{config.label}</span>
          </Button>
        )
      })}
    </div>
  )

  // Desktop Tabs
  const DesktopTabs = () => (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-8 p-1 gap-2">
        {Object.entries(tabConfig).map(([key, config]) => {
          const Icon = config.icon
          return (
            <TabsTrigger 
              key={key}
              value={key} 
              className="flex items-center gap-3 data-[state=active]:text-white text-white data-[state=active]:bg-white/20 py-3 transition-all duration-300 border-2 border-transparent data-[state=active]:border-white/30"
            >
              <Icon className="h-6 w-6 lg:h-8 lg:w-8" />
              <span className="font-black text-sm lg:text-lg">{config.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      {/* Hotel Search */}
      <TabsContent value="hotel" className="space-y-6 p-4">
        <HotelSearch />
      </TabsContent>

      {/* Flight Search */}
      <TabsContent value="flight" className="space-y-6 p-4">
        <FlightSearch />
      </TabsContent>

      {/* Domestic Flight Search */}
      <TabsContent value="domesticFlights" className="space-y-6 p-4">
        <DomesticFlightSearch />
      </TabsContent>

      {/* CIP Search */}
      <TabsContent value="cip" className="space-y-6 p-4">
        <CipSearch />
      </TabsContent>

      {/* Tour Search */}
      <TabsContent value="tour" className="space-y-6 p-4">
        <TourSearch />
      </TabsContent>

      {/* Domestic Hotel Search */}
      <TabsContent value="domesticHotel" className="space-y-6 p-4">
        <DomesticHotelSearch />
      </TabsContent>
    </Tabs>
  )

  // Mobile Modal Content
  const MobileModalContent = () => (
    <div className="w-full h-full p-2">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">نوع جستجو</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(false)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      
      <MobileTabButtons />
      
      <div className="mt-6">
        {activeTab === "hotel" && <HotelSearch />}
        {activeTab === "flight" && <FlightSearch />}
        {activeTab === "domesticFlights" && <DomesticFlightSearch />}
        {activeTab === "cip" && <CipSearch />}
        {activeTab === "tour" && <TourSearch />}
        {activeTab === "domesticHotel" && <DomesticHotelSearch />}
      </div>
    </div>
  )

  return (
    <section ref={sectionRef} className={`py-16 md:py-24 relative dark:from-gray-900 dark:to-blue-900 ${cardBackgrounds[activeTab]}`}>
      <div className="w-full h-full absolute top-0 right-0 bg-[url('/pattern.png')] bg-[length:180px_180px] z-10 opacity-10"></div>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 relative z-30">
          <h2 className="text-4xl font-bold text-white dark:text-white mb-4">
            سفر بعدی خود را پیدا کنید
          </h2>
          <p className="text-xl text-white max-w-2xl mx-auto">
            بهترین هتل ها، پروازها، CIP، تورها و قطارها را با بهترین قیمت ها کشف کنید
          </p>
        </div>

        {/* Desktop Version */}
        <div className="hidden lg:block">
          <Card ref={cardRef} className="mx-auto relative z-30 shadow-none w-full border-0 dark:bg-gray-800/95">
            <DesktopTabs />
          </Card>
        </div>

        {/* Mobile Version */}
        <div className="block lg:hidden">
          <Card ref={cardRef} className="relative z-30 shadow-none w-full border-0 dark:bg-gray-800/95">
            <Dialog open={mobileOpen} onOpenChange={setMobileOpen}>
              <DialogTrigger asChild>
                <Button className="w-full h-16 text-lg font-bold rounded-2xl bg-white/20 text-white hover:bg-white/30 transition-all duration-300">
                  <Search className="ml-2 h-5 w-5" />
                  جستجو در خدمات سفر
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:w-full w-[100vh] h-full overflow-y-auto">
                <MobileModalContent />
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </div>
    </section>
  )
}