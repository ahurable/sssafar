// app/flights/page.tsx
"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FlightList } from "@/components/flights/flight-list"
import { FlightFilters } from "@/components/flights/flight-filters"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useFlight } from "@/contexts/search/FlightContext"
import { FlightSearchSection } from "@/components/home/search-section"
import { useRouter } from "next/navigation"

export default function FlightsPage() {
  const { flightData, filteredFlights, area, origin, destination } = useFlight()
  const [ flights, setFlights ] = useState(flightData)
  const router = useRouter()

  useEffect(() => {
    if (filteredFlights.length == 0)
      setFlights(flightData)
    setFlights(filteredFlights)
  }, [filteredFlights])


  if (!flightData || flightData.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="">
          <FlightSearchSection onSearchResults={() => router.refresh()} />
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-16 lg:py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-xl text-blue-900 font-bold mb-2">نتایج جستجو پرواز {origin} به {destination}</h1>
            <p className="text-muted-foreground">{flights.length} پرواز یافت شد</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-4 grid-cols-1">
            <aside className="lg:col-span-1 col-span-1">
              <FlightFilters />
            </aside>
            <div className="lg:col-span-3 col-span-1">
              <FlightList flights={flights} area={area} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}