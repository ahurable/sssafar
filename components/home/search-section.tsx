// components/search-section.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Hotel, Plane, Crown, Map, Building, X, Search, ArrowRight } from "lucide-react"
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
  const [mobileMainModalOpen, setMobileMainModalOpen] = useState(false)
  const [mobileSearchModalOpen, setMobileSearchModalOpen] = useState(false)
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
    cip: { icon: Crown, label: "CIP فرودگاهی", color: "purple", className: "rounded-tr-xl" },
    tour: { icon: Map, label: "گشت شهری", color: "orange", className: "rounded-tl-xl" },
    domesticHotel: { icon: Hotel, label: "هتل داخلی", color: "cyan" },
    hotel: { icon: Hotel, label: "هتل خارجی", color: "emerald" },
    flight: { icon: Plane, label: "پرواز خارجی", color: "blue", className: "rounded-br-xl" },
    domesticFlights: { icon: Plane, label: "پرواز داخلی", color: "red", className: "rounded-bl-xl" },
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

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab as any)
    setMobileMainModalOpen(false)
    setMobileSearchModalOpen(true)
  }

  const handleBackToMainModal = () => {
    setMobileSearchModalOpen(false)
    setMobileMainModalOpen(true)
  }

  const handleCloseAllModals = () => {
    setMobileMainModalOpen(false)
    setMobileSearchModalOpen(false)
  }

  // Mobile Main Modal - Tab Selection
  const MobileMainModal = () => (
      <>
      {/* Tab Buttons Grid */}
        <div className="grid grid-cols-2 rounded-2xl">
          {Object.entries(tabConfig).map(([key, config]) => {
            const Icon = config.icon
            const colorClass = `bg-${config.color}-500`
            return (
              <button
                key={key}
                onClick={() => handleTabSelect(key)}
                className={`
                  flex flex-col items-center justify-center gap-3 
                  ${config.className && config.className}
                  h-36 bg-white border border-gray-200 
                  hover:border-${config.color}-300 hover:shadow-lg 
                  transition-all duration-200 active:scale-95 py-4
                  group
                `}
              >
                <div className={`p-3 rounded-xl ${colorClass} group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-800 text-center px-2">
                  {config.label}
                </span>
                <ArrowRight className="h-4 w-4 text-cyan-500 group-hover:text-gray-600" />
              </button>
            )
          })}
        </div>
        </>
  )

  // Mobile Search Modal - Specific Search Component
  const MobileSearchModal = () => {
    const renderSearchComponent = () => {
      switch (activeTab) {
        case "hotel":
          return <HotelSearch />
        case "flight":
          return <FlightSearch />
        case "domesticFlights":
          return <DomesticFlightSearch />
        case "cip":
          return <CipSearch />
        case "tour":
          return <TourSearch />
        case "domesticHotel":
          return <DomesticHotelSearch />
        default:
          return <DomesticFlightSearch />
      }
    }

    const currentConfig = tabConfig[activeTab]

    return (
      <div className="fixed inset-0 z-50 bg-white overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBackToMainModal}
              className="h-8 w-8"
            >
              <X className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-lg bg-${currentConfig.color}-500`}>
                <currentConfig.icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{currentConfig.label}</h2>
            </div>
          </div>
        </div>

        {/* Search Component */}
        <div className="p-4 overflow-y-auto">
          {renderSearchComponent()}
        </div>
      </div>
    )
  }

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
            <MobileMainModal />
          </Card>
        </div>

        {/* Mobile Main Modal */}

        {/* Mobile Search Modal */}
        {mobileSearchModalOpen && <MobileSearchModal />}
      </div>
    </section>
  )
}