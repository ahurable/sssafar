// components/tours/tour-filters.tsx
"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

export function TourFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [filters, setFilters] = useState({
    featured: searchParams.get('featured') === 'true',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    startDate: searchParams.get('startDate') || ''
  })

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value.toString())
      }
    })

    router.push(`/tours?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      featured: false,
      minPrice: '',
      maxPrice: '',
      startDate: ''
    })
    router.push('/tours')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>فیلترها</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Featured Filter */}
        <div className="flex items-center justify-between">
          <Label htmlFor="featured">تورهای ویژه</Label>
          <Switch
            id="featured"
            checked={filters.featured}
            onCheckedChange={(checked) => handleFilterChange('featured', checked)}
          />
        </div>

        {/* Price Range */}
        <div className="space-y-4">
          <Label>محدوده قیمت (تومان)</Label>
          <div className="flex gap-2">
            <Input
              placeholder="حداقل"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              type="number"
            />
            <Input
              placeholder="حداکثر"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              type="number"
            />
          </div>
        </div>

        {/* Start Date */}
        <div className="space-y-2">
          <Label htmlFor="startDate">تاریخ شروع</Label>
          <Input
            id="startDate"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4">
          <Button onClick={applyFilters} className="flex-1">
            اعمال فیلترها
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            پاک کردن
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}