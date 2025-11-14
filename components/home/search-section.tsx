"use client"

import { useState, useRef, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Hotel, Plane, Crown, Map, X, ArrowRight } from "lucide-react"
import FlightSearch from "../flights/flight-search"
import HotelSearch from "../hotels/hotel-search"
import DomesticFlightSearch from "../flights/domestic-flight-search"
import CipSearch from "../cip/cip-search"
import TourSearch from "../tours/tour-search"
import DomesticHotelSearch from "../hotels/domestic-hotel-search"

interface SearchSectionProps {
  onSearchResults: (results: any, type: string) => void
}

export function SearchSection({ onSearchResults }: SearchSectionProps) {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<"hotel" | "flight" | "domesticFlights" | "cip" | "tour" | "domesticHotel">("domesticFlights")
  const [mobileSearchModalOpen, setMobileSearchModalOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)

  // Read URL parameter on component mount and when searchParams change
  useEffect(() => {
    const searchParam = searchParams.get('search')
    if (searchParam && ['hotel', 'flight', 'domesticFlights', 'cip', 'tour', 'domesticHotel'].includes(searchParam)) {
      setActiveTab(searchParam as any)
      
      // Auto-open modal on mobile if coming from header navigation
      if (window.innerWidth < 1024) { // lg breakpoint
        setMobileSearchModalOpen(true)
      }
    }
  }, [searchParams])

  // Listen for custom events from header
  useEffect(() => {
    const handleOpenSearchModal = (event: CustomEvent) => {
      const menuType = event.detail
      if (['hotel', 'flight', 'domesticFlights', 'cip', 'tour', 'domesticHotel'].includes(menuType)) {
        setActiveTab(menuType as any)
        setMobileSearchModalOpen(true)
      }
    }

    window.addEventListener('openSearchModal', handleOpenSearchModal as EventListener)
    
    return () => {
      window.removeEventListener('openSearchModal', handleOpenSearchModal as EventListener)
    }
  }, [])

  const tabConfig = {
    cip: { icon: Crown, label: "CIP فرودگاهی" },
    tour: { icon: Map, label: "گشت شهری" },
    domesticHotel: { icon: Hotel, label: "هتل داخلی" },
    hotel: { icon: Hotel, label: "هتل خارجی" },
    flight: { icon: Plane, label: "پرواز خارجی" },
    domesticFlights: { icon: Plane, label: "پرواز داخلی" },
  }

  const handleTabSelect = (tab: string) => {
    setActiveTab(tab as any)
    setMobileSearchModalOpen(true)
  }

  const handleCloseModal = () => {
    setMobileSearchModalOpen(false)
    // Clear URL parameter when closing modal
    const url = new URL(window.location.href)
    url.searchParams.delete('search')
    window.history.replaceState({}, '', url.toString())
  }

  // Mobile Main Modal - Tab Selection
  const MobileMainModal = () => (
    <div className="grid grid-cols-2 w-full">
      {Object.entries(tabConfig).map(([key, config]) => {
        const Icon = config.icon
        return (
          <button
            key={key}
            onClick={() => handleTabSelect(key)}
            className="flex flex-col items-center justify-center gap-3 h-32 bg-white border border-gray-300 hover:bg-gray-50 transition-colors p-4 group"
          >
            <div className="p-3 bg-blue-500 group-hover:bg-blue-900 transition-colors">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-medium text-black text-center">
              {config.label}
            </span>
            <ArrowRight className="h-4 w-4 text-blue-500" />
          </button>
        )
      })}
    </div>
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
      <div className="fixed inset-0 z-50 bg-white">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-white">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCloseModal}
              className="p-2 border border-gray-300 hover:bg-gray-50"
            >
              <X className="h-5 w-5 text-black" />
            </button>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500">
                <currentConfig.icon className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-black">{currentConfig.label}</h2>
            </div>
          </div>
        </div>

        {/* Search Component */}
        <div className="p-4 h-[calc(100vh-80px)] overflow-y-auto">
          {renderSearchComponent()}
        </div>
      </div>
    )
  }

  // Desktop Tabs
  const DesktopTabs = () => (
    <Tabs value={activeTab} onValueChange={(value) => {
      setActiveTab(value as any)
      localStorage.setItem('activeSearchTab', value)
    }} className="w-full">
      <TabsList className="flex w-full h-max bg-white border-b border-gray-300 p-0">
        {Object.entries(tabConfig).map(([key, config]) => {
          const Icon = config.icon
          const isSelected = activeTab === key
          return (
            <TabsTrigger 
              key={key}
              value={key} 
              className={`flex-1 flex items-center justify-center gap-3 py-4 border-b-2 transition-colors ${
                isSelected 
                  ? 'border-b-2 border-blue-900 text-blue-900' 
                  : 'border-b-2 border-transparent text-black hover:text-gray-600'
              }`}
            >
              <Icon className={`h-5 w-5 ${isSelected ? 'text-blue-900' : 'text-black'}`} />
              <span className=" font-black">{config.label}</span>
            </TabsTrigger>
          )
        })}
      </TabsList>

      {/* Tab Contents */}
      <TabsContent value="hotel" className="p-6 bg-white">
        <HotelSearch />
      </TabsContent>

      <TabsContent value="flight" className="p-6 bg-white">
        <FlightSearch />
      </TabsContent>

      <TabsContent value="domesticFlights" className="p-6 bg-white">
        <DomesticFlightSearch />
      </TabsContent>

      <TabsContent value="cip" className="p-6 bg-white">
        <CipSearch />
      </TabsContent>

      <TabsContent value="tour" className="p-6 bg-white">
        <TourSearch />
      </TabsContent>

      <TabsContent value="domesticHotel" className="p-6 bg-white">
        <DomesticHotelSearch />
      </TabsContent>
    </Tabs>
  )

  return (
    <section ref={cardRef} className=" bg-white">
      <div className="mx-auto">
        <div className="text-center bg-blue-900 pt-8 pb-20">
          <h2 className="text-3xl font-bold text-white mb-4">
            سفر بعدی خود را پیدا کنید
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto">
            بهترین هتل ها، پروازها، CIP، تورها و قطارها را با بهترین قیمت ها کشف کنید
          </p>
        </div>

        {/* Desktop Version - Tabs */}
        <div className="hidden lg:block mt-[-50px]">
          <div className="bg-white border rounded-lg px-8 border-gray-300">
            <DesktopTabs />
          </div>
        </div>

        {/* Mobile Version - Grid Buttons */}
        <div className="block lg:hidden">
          <div className="bg-white border border-gray-300">
            <MobileMainModal />
          </div>
        </div>

        {/* Mobile Search Modal */}
        {mobileSearchModalOpen && <MobileSearchModal />}
      </div>
    </section>
  )
}