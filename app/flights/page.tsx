// app/flights/page.tsx
"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FlightList } from "@/components/flights/flight-list"
import { FlightFilters } from "@/components/flights/flight-filters"
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useFlight } from "@/contexts/search/FlightContext"

export default function FlightsPage() {
  const { flightData, filteredFlights, loading } = useFlight()
  const [ flights, setFlights ] = useState(flightData)

  useEffect(() => {
    if (filteredFlights.length == 0)
      setFlights(flightData)
    setFlights(filteredFlights)
  }, [filteredFlights])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">در حال دریافت اطلاعات پروازها...</p>
        </div>
      </div>
    )
  }

  if (!flightData || flightData.length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-8">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">پروازی یافت نشد</h1>
            <p className="text-muted-foreground">لطفاً مجدداً جستجو کنید</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">نتایج جستجو</h1>
            <p className="text-muted-foreground">{flights.length} پرواز یافت شد</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <FlightFilters />
            </aside>
            <div className="lg:col-span-3">
              <FlightList flights={flights} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}