"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HotelList } from "@/components/hotels/hotel-list"
import { HotelFilters } from "@/components/hotels/hotel-filters"
import { HotelSearchSection } from "@/components/home/search-section"
import { useHotel } from "@/contexts/search/HotelContext"
import { useEffect, useState } from "react"


export default function HotelsPage() {

  const { hotelData } = useHotel()
  const [hotels, setHotels] = useState<any>()
  
  
  useEffect(() => {
    if (hotelData)
      setHotels(hotelData)
  }, [])

  // Check if no hotels found based on your actual data structure
  if (!hotels) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="">
          <HotelSearchSection />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4 pt-10">
          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <HotelFilters />
            </aside>
            <div className="lg:col-span-3">
              <HotelList />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
