"use client"

import { useState, useEffect, useRef } from "react"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Hotel, Plane, Train, Search, Calendar, MapPin, Users } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function SearchSection() {
  const [activeTab, setActiveTab] = useState("hotel")
  const sectionRef = useRef<HTMLElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

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

  return (
    <section ref={sectionRef} className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <Card ref={cardRef} className="mx-auto max-w-5xl p-6 shadow-xl md:p-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="hotel" className="flex items-center gap-2">
                <Hotel className="h-4 w-4" />
                <span className="hidden sm:inline">هتل</span>
              </TabsTrigger>
              <TabsTrigger value="flight" className="flex items-center gap-2">
                <Plane className="h-4 w-4" />
                <span className="hidden sm:inline">پرواز</span>
              </TabsTrigger>
              <TabsTrigger value="train" className="flex items-center gap-2">
                <Train className="h-4 w-4" />
                <span className="hidden sm:inline">قطار</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hotel" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="hotel-city">شهر مقصد</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="hotel-city" placeholder="تهران، مشهد، اصفهان..." className="pr-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hotel-date">تاریخ ورود و خروج</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="hotel-date" type="text" placeholder="انتخاب تاریخ" className="pr-10" />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="hotel-guests">تعداد مهمان</Label>
                <div className="relative">
                  <Users className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="hotel-guests" type="number" placeholder="2 نفر" className="pr-10" defaultValue="2" />
                </div>
              </div>
              <Button className="w-full" size="lg">
                <Search className="ml-2 h-5 w-5" />
                جستجوی هتل
              </Button>
            </TabsContent>

            <TabsContent value="flight" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="flight-from">مبدا</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="flight-from" placeholder="تهران" className="pr-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flight-to">مقصد</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="flight-to" placeholder="مشهد" className="pr-10" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="flight-date">تاریخ پرواز</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="flight-date" type="text" placeholder="انتخاب تاریخ" className="pr-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flight-passengers">تعداد مسافر</Label>
                  <div className="relative">
                    <Users className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="flight-passengers"
                      type="number"
                      placeholder="1 نفر"
                      className="pr-10"
                      defaultValue="1"
                    />
                  </div>
                </div>
              </div>
              <Button className="w-full" size="lg">
                <Search className="ml-2 h-5 w-5" />
                جستجوی پرواز
              </Button>
            </TabsContent>

            <TabsContent value="train" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="train-from">مبدا</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="train-from" placeholder="تهران" className="pr-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="train-to">مقصد</Label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="train-to" placeholder="مشهد" className="pr-10" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="train-date">تاریخ حرکت</Label>
                  <div className="relative">
                    <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="train-date" type="text" placeholder="انتخاب تاریخ" className="pr-10" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="train-passengers">تعداد مسافر</Label>
                  <div className="relative">
                    <Users className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="train-passengers" type="number" placeholder="1 نفر" className="pr-10" defaultValue="1" />
                  </div>
                </div>
              </div>
              <Button className="w-full" size="lg">
                <Search className="ml-2 h-5 w-5" />
                جستجوی قطار
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </section>
  )
}
