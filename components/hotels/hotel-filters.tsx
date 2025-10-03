"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"

export function HotelFilters() {
  return (
    <Card className="sticky top-20">
      <CardHeader>
        <CardTitle>فیلترها</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>محدوده قیمت (تومان)</Label>
          <Slider defaultValue={[500000, 3000000]} max={5000000} step={100000} className="mt-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>۵۰۰,۰۰۰</span>
            <span>۵,۰۰۰,۰۰۰</span>
          </div>
        </div>

        <div className="space-y-3">
          <Label>امتیاز هتل</Label>
          <div className="space-y-2">
            {["5 ستاره", "4 ستاره", "3 ستاره", "2 ستاره"].map((rating) => (
              <div key={rating} className="flex items-center gap-2">
                <Checkbox id={rating} />
                <label htmlFor={rating} className="text-sm cursor-pointer">
                  {rating}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Label>امکانات</Label>
          <div className="space-y-2">
            {["وای‌فای رایگان", "استخر", "رستوران", "پارکینگ", "سالن ورزشی"].map((amenity) => (
              <div key={amenity} className="flex items-center gap-2">
                <Checkbox id={amenity} />
                <label htmlFor={amenity} className="text-sm cursor-pointer">
                  {amenity}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
