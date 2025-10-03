"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

export function FlightFilters() {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>فیلترها</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>محدوده قیمت (تومان)</Label>
          <Slider defaultValue={[500000, 2000000]} max={3000000} step={50000} className="mt-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>۵۰۰,۰۰۰</span>
            <span>۳,۰۰۰,۰۰۰</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>ایرلاین</Label>
          <div className="space-y-2">
            {["ایران ایر", "ماهان", "قشم ایر", "آسمان"].map((airline) => (
              <div key={airline} className="flex items-center gap-2">
                <Checkbox id={airline} />
                <label htmlFor={airline} className="text-sm cursor-pointer">
                  {airline}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>کلاس پرواز</Label>
          <div className="space-y-2">
            {["اکونومی", "بیزینس", "فرست کلاس"].map((flightClass) => (
              <div key={flightClass} className="flex items-center gap-2">
                <Checkbox id={flightClass} />
                <label htmlFor={flightClass} className="text-sm cursor-pointer">
                  {flightClass}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>زمان پرواز</Label>
          <div className="space-y-2">
            {["صبح (۶-۱۲)", "ظهر (۱۲-۱۸)", "عصر (۱۸-۲۴)", "شب (۰-۶)"].map((time) => (
              <div key={time} className="flex items-center gap-2">
                <Checkbox id={time} />
                <label htmlFor={time} className="text-sm cursor-pointer">
                  {time}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
