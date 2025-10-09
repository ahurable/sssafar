"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Clock, Calendar, ChevronDown, ArrowRight, ArrowLeft } from "lucide-react"
import { flights } from "@/lib/data/flights"
import { useRouter } from "next/navigation"

export function FlightList() {
  const [flightList] = useState(flights)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const router = useRouter()

  const handleBookFlight = (flightId: string, type: "oneway" | "twoway") => {
    setOpenDropdown(null)
    router.push(`/flights/${flightId}/book/${type}`)
  }

  const toggleDropdown = (flightId: string) => {
    setOpenDropdown(openDropdown === flightId ? null : flightId)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted-foreground">{flightList.length} پرواز یافت شد</p>
      </div>

      {flightList.map((flight) => (
        <Card key={flight.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <Plane className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold">{flight.airline}</h3>
                    <p className="text-sm text-muted-foreground">شماره پرواز: {flight.flightNumber}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{flight.departureTime}</p>
                    <p className="text-sm text-muted-foreground">{flight.from}</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div className="h-px flex-1 bg-border" />
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div className="h-px flex-1 bg-border" />
                    </div>
                    <p className="text-xs text-muted-foreground">{flight.duration}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{flight.arrivalTime}</p>
                    <p className="text-sm text-muted-foreground">{flight.to}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{flight.date}</span>
                  <Badge variant="outline">{flight.class === "economy" ? "اکونومی" : "بیزینس"}</Badge>
                  <Badge variant="secondary">{flight.availableSeats} صندلی خالی</Badge>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3 md:border-r md:pr-6">
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">قیمت هر نفر</p>
                  <p className="text-2xl font-bold text-primary">
                    {flight.price.toLocaleString("fa-IR")} <span className="text-sm font-normal">تومان</span>
                  </p>
                </div>
                
                {/* Booking Dropdown */}
                <div className="relative">
                  <Button 
                    onClick={() => toggleDropdown(flight.id)}
                    className="w-full md:w-auto flex items-center gap-2"
                  >
                    خرید بلیط
                    <ChevronDown className={`h-4 w-4 transition-transform ${openDropdown === flight.id ? 'rotate-180' : ''}`} />
                  </Button>

                  {openDropdown === flight.id && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      <div className="p-2">
                        <div className="mb-2 px-3 py-2 border-b">
                          <p className="font-medium text-sm text-gray-700">نوع بلیط را انتخاب کنید:</p>
                        </div>
                        
                        <button
                          onClick={() => handleBookFlight(flight.id, "oneway")}
                          className="w-full flex items-center justify-between p-3 text-right hover:bg-blue-50 rounded-md transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <ArrowRight className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="font-medium text-sm">پرواز یک‌طرفه</p>
                              <p className="text-xs text-muted-foreground">فقط پرواز رفت</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-blue-600">
                            {flight.price.toLocaleString("fa-IR")} تومان
                          </p>
                        </button>
                        
                        <button
                          onClick={() => handleBookFlight(flight.id, "twoway")}
                          className="w-full flex items-center justify-between p-3 text-right hover:bg-green-50 rounded-md transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center">
                              <ArrowRight className="h-4 w-4 text-green-600" />
                              <ArrowLeft className="h-4 w-4 text-green-600 -mr-1" />
                            </div>
                            <div>
                              <p className="font-medium text-sm">پرواز دوطرفه</p>
                              <p className="text-xs text-muted-foreground">پرواز رفت و برگشت</p>
                            </div>
                          </div>
                          <p className="text-sm font-bold text-green-600">
                            {(flight.price * 1.8).toLocaleString("fa-IR")} تومان
                          </p>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}