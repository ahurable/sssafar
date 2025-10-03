"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Clock, Calendar } from "lucide-react"
import { flights } from "@/lib/data/flights"

export function FlightList() {
  const [flightList] = useState(flights)

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
                <Button className="w-full md:w-auto">خرید بلیط</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
