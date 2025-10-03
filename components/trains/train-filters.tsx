"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

export function TrainFilters() {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>فیلترها</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>محدوده قیمت (تومان)</Label>
          <Slider defaultValue={[400000, 1000000]} max={1500000} step={50000} className="mt-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>۴۰۰,۰۰۰</span>
            <span>۱,۵۰۰,۰۰۰</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>نوع کوپه</Label>
          <div className="space-y-2">
            {["کوپه (خواب)", "بیزینس", "اکونومی"].map((trainClass) => (
              <div key={trainClass} className="flex items-center gap-2">
                <Checkbox id={trainClass} />
                <label htmlFor={trainClass} className="text-sm cursor-pointer">
                  {trainClass}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>زمان حرکت</Label>
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
