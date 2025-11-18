"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useHotel } from "@/contexts/search/HotelContext"
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetTrigger 
} from "@/components/ui/sheet"
import { 
  Filter, 
  X, 
  Star,
  Wifi,
  Utensils,
  Car,
  Dumbbell,
  Building,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Sparkles
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface FilterState {
  priceRange: [number, number]
  hotelRatings: string[]
  amenities: string[]
  hotelTypes: string[]
}

const defaultFilters: FilterState = {
  priceRange: [0, 5000000],
  hotelRatings: [],
  amenities: [],
  hotelTypes: []
}

export function HotelFilters() {
  const { applyFilters, clearFilters, filteredHotels, hotelData } = useHotel()
  const [filters, setFilters] = useState(defaultFilters)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    price: true,
    rating: true,
    amenities: true,
    type: true
  })
  const [isSheetOpen, setIsSheetOpen] = useState(false)
  const [activeFilterSection, setActiveFilterSection] = useState<string | null>(null)

  const availablePriceRange = hotelData && hotelData.PricedItineraries.length > 0 ? [
    Math.min(...hotelData.PricedItineraries.map(f => f.NetRate / 10).filter(rate => typeof rate === 'number' && !isNaN(rate))),
    Math.max(...hotelData.PricedItineraries.map(f => f.NetRate / 10).filter(rate => typeof rate === 'number' && !isNaN(rate)))
  ] : [0, 50000000];

  // Initialize price range when data loads
  useEffect(() => {
    if (hotelData && hotelData.PricedItineraries.length > 0) {
      setFilters(prev => ({
        ...prev,
        priceRange: [availablePriceRange[0], availablePriceRange[1]]
      }))
    }
  }, [hotelData])

  const handlePriceChange = (value: number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: value as [number, number]
    }))
  }

  const handleRatingChange = (rating: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      hotelRatings: checked 
        ? [...prev.hotelRatings, rating]
        : prev.hotelRatings.filter(r => r !== rating)
    }))
  }

  const handleAmenityChange = (amenity: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      amenities: checked 
        ? [...prev.amenities, amenity]
        : prev.amenities.filter(a => a !== amenity)
    }))
  }

  const handleHotelTypeChange = (type: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      hotelTypes: checked 
        ? [...prev.hotelTypes, type]
        : prev.hotelTypes.filter(t => t !== type)
    }))
  }

  const handleApplyFilters = () => {
    applyFilters(filters)
    setIsSheetOpen(false)
    setActiveFilterSection(null)
  }

  const handleClearFilters = () => {
    setFilters({
      priceRange: availablePriceRange as [number, number],
      hotelRatings: [],
      amenities: [],
      hotelTypes: []
    })
    clearFilters()
  }

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.priceRange[0] > availablePriceRange[0] || filters.priceRange[1] < availablePriceRange[1]) count++
    count += filters.hotelRatings.length
    count += filters.amenities.length
    count += filters.hotelTypes.length
    return count
  }

  const openFilterSection = (section: string) => {
    setActiveFilterSection(section)
    setIsSheetOpen(true)
  }

  const getFilterBadgeCount = (section: string) => {
    switch (section) {
      case 'price':
        return filters.priceRange[0] > availablePriceRange[0] || filters.priceRange[1] < availablePriceRange[1] ? 1 : 0
      case 'rating':
        return filters.hotelRatings.length
      case 'amenities':
        return filters.amenities.length
      case 'type':
        return filters.hotelTypes.length
      default:
        return 0
    }
  }

  const ratingOptions = [
    { value: "5 ستاره", label: "۵ ستاره", stars: 5 },
    { value: "4 ستاره", label: "۴ ستاره", stars: 4 },
    { value: "3 ستاره", label: "۳ ستاره", stars: 3 },
    { value: "2 ستاره", label: "۲ ستاره", stars: 2 }
  ]

  const amenityOptions = [
    { value: "وای‌فای رایگان", label: "وای‌فای رایگان", icon: Wifi },
    { value: "استخر", label: "استخر", icon: Sparkles },
    { value: "رستوران", label: "رستوران", icon: Utensils },
    { value: "پارکینگ", label: "پارکینگ", icon: Car },
    { value: "سالن ورزشی", label: "سالن ورزشی", icon: Dumbbell }
  ]

  const hotelTypeOptions = [
    { value: "هتل", label: "هتل", description: "اقامتگاه کامل" },
    { value: "مهمانپذیر", label: "مهمانپذیر", description: "اقامتگاه اقتصادی" },
    { value: "ویلا", label: "ویلا", description: "اقامتگاه مستقل" },
    { value: "اقامتگاه بومگردی", label: "اقامتگاه بومگردی", description: "تجربه محلی" }
  ]

  const totalHotels = hotelData?.PricedItineraries?.length || 0
  const showingHotels = filteredHotels.length

  const FilterSection = ({ 
    title, 
    sectionKey, 
    icon: Icon, 
    children 
  }: { 
    title: string
    sectionKey: string
    icon: any
    children: React.ReactNode
  }) => (
    <div className="border-b border-gray-100 pb-4 p-4 last:border-0">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="flex items-center justify-between w-full py-3 text-right"
      >
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">{title}</span>
        </div>
        {openSections[sectionKey] ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {openSections[sectionKey] && (
        <div className="mt-2 space-y-3">
          {children}
        </div>
      )}
    </div>
  )

  const FilterContent = ({ showAllSections = true }) => (
    <div className="space-y-6">
      {/* Results Count */}
      {showAllSections && (
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-blue-700 font-medium">نتایج جستجو:</span>
            <span className="text-blue-800 font-semibold">
              {showingHotels} از {totalHotels} هتل
            </span>
          </div>
        </div>
      )}

      {/* Active Filters Badge */}
      {showAllSections && getActiveFiltersCount() > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">فیلترهای فعال:</span>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            {getActiveFiltersCount()} فیلتر
          </Badge>
        </div>
      )}

      {/* Price Range Filter */}
      {(showAllSections || activeFilterSection === 'price') && (
        <FilterSection title="محدوده قیمت" sectionKey="price" icon={DollarSign}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-sm font-medium">قیمت هر شب (تومان)</Label>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full">
                {filters.priceRange[0].toLocaleString('fa-IR')} - {filters.priceRange[1].toLocaleString('fa-IR')}
              </span>
            </div>
            <Slider 
              value={filters.priceRange}
              onValueChange={handlePriceChange}
              min={availablePriceRange[0]}
              max={availablePriceRange[1]}
              step={100000}
              className="mt-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{availablePriceRange[0].toLocaleString('fa-IR')}</span>
              <span>{availablePriceRange[1].toLocaleString('fa-IR')}</span>
            </div>
          </div>
        </FilterSection>
      )}

      {/* Hotel Rating Filter */}
      {(showAllSections || activeFilterSection === 'rating') && (
        <FilterSection title="ستاره هتل" sectionKey="rating" icon={Star}>
          <div className="space-y-3">
            {ratingOptions.map((rating) => (
              <div key={rating.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Checkbox 
                  id={`rating-${rating.value}`}
                  checked={filters.hotelRatings.includes(rating.value)}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  onCheckedChange={(checked) => 
                    handleRatingChange(rating.value, checked as boolean)
                  }
                />
                <div className="flex-1 text-right">
                  <label 
                    htmlFor={`rating-${rating.value}`} 
                    className="text-sm font-medium cursor-pointer block"
                  >
                    {rating.label}
                  </label>
                  <div className="flex gap-1 mt-1 justify-end">
                    {Array.from({ length: rating.stars }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Amenities Filter */}
      {(showAllSections || activeFilterSection === 'amenities') && (
        <FilterSection title="امکانات هتل" sectionKey="amenities" icon={Sparkles}>
          <div className="space-y-3">
            {amenityOptions.map((amenity) => {
              const AmenityIcon = amenity.icon
              return (
                <div key={amenity.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                  <Checkbox 
                    id={`amenity-${amenity.value}`}
                    checked={filters.amenities.includes(amenity.value)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                    onCheckedChange={(checked) => 
                      handleAmenityChange(amenity.value, checked as boolean)
                    }
                  />
                  <div className="flex items-center gap-2 flex-1 text-right">
                    <AmenityIcon className="h-4 w-4 text-gray-500" />
                    <label 
                      htmlFor={`amenity-${amenity.value}`} 
                      className="text-sm font-medium cursor-pointer flex-1"
                    >
                      {amenity.label}
                    </label>
                  </div>
                </div>
              )
            })}
          </div>
        </FilterSection>
      )}

      {/* Hotel Type Filter */}
      {(showAllSections || activeFilterSection === 'type') && (
        <FilterSection title="نوع اقامتگاه" sectionKey="type" icon={Building}>
          <div className="space-y-3">
            {hotelTypeOptions.map((type) => (
              <div key={type.value} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Checkbox 
                  id={`type-${type.value}`}
                  checked={filters.hotelTypes.includes(type.value)}
                  className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  onCheckedChange={(checked) => 
                    handleHotelTypeChange(type.value, checked as boolean)
                  }
                />
                <div className="flex-1 text-right">
                  <label 
                    htmlFor={`type-${type.value}`} 
                    className="text-sm font-medium cursor-pointer block"
                  >
                    {type.label}
                  </label>
                  <span className="text-xs text-gray-500">{type.description}</span>
                </div>
              </div>
            ))}
          </div>
        </FilterSection>
      )}
    </div>
  )

  const FilterTriggerButton = ({ 
    section, 
    title, 
    icon: Icon 
  }: { 
    section: string
    title: string
    icon: any
  }) => (
    <Button
      variant="outline"
      className="flex items-center gap-2 py-2 px-3 rounded-full border-gray-300 shadow-sm"
      onClick={() => openFilterSection(section)}
    >
      <Icon className="h-4 w-4" />
      {title}
      {getFilterBadgeCount(section) > 0 && (
        <Badge variant="secondary" className="h-5 w-5 min-w-5 p-0 flex items-center justify-center text-xs bg-emerald-500 text-white">
          {getFilterBadgeCount(section)}
        </Badge>
      )}
    </Button>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Card className="sticky top-20 shadow-sm border-0">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-5 w-5" />
                فیلترهای هتل
              </CardTitle>
              {getActiveFiltersCount() > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleClearFilters}
                  className="text-xs text-gray-500 hover:text-gray-700 h-8"
                >
                  حذف همه
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <FilterContent showAllSections={true} />
            <div className="flex gap-2 pt-4">
              <Button 
                onClick={handleApplyFilters}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-12 text-base"
              >
                اعمال فیلترها
              </Button>
              <Button 
                onClick={handleClearFilters}
                variant="outline"
                className="h-12"
              >
                حذف
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Filter Buttons */}
      <div className="lg:hidden absolute top-16 left-6 right-6 z-40">
        <div className="flex items-center gap-2 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none'}}>
          {/* Main Filters Button */}
          <Sheet open={isSheetOpen && !activeFilterSection} onOpenChange={(open) => {
            setIsSheetOpen(open)
            if (!open) setActiveFilterSection(null)
          }}>
            <SheetTrigger asChild>
              <Button className="flex-1 shadow-lg bg-[#fffefe] rounded-full border text-black">
                <Filter className="h-5 w-5 ml-2" />
                فیلترها
                {getActiveFiltersCount() > 0 && (
                  <Badge className="mr-2 bg-[#fffefe] text-emerald-600 px-2 py-1 text-xs">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[90vh] rounded-t-3xl">
              <SheetHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <SheetTitle className="flex items-center gap-2 text-lg">
                    <Filter className="h-5 w-5" />
                    فیلترهای هتل
                  </SheetTitle>
                  <div className="flex items-center gap-2">
                    {getActiveFiltersCount() > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={handleClearFilters}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        حذف همه
                      </Button>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsSheetOpen(false)}
                      className="p-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>
              <div className="h-max overflow-y-auto py-4">
                <FilterContent showAllSections={true} />
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#fffefe] border-t">
                <div className="flex gap-2">
                  <Button 
                    onClick={handleApplyFilters}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-14 text-lg"
                    size="lg"
                  >
                    نمایش نتایج
                    <span className="text-emerald-100 mr-2">
                      ({showingHotels} هتل)
                    </span>
                  </Button>
                  <Button 
                    onClick={handleClearFilters}
                    variant="outline"
                    className="h-14 text-lg"
                    size="lg"
                  >
                    حذف
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Individual Filter Buttons */}
          <FilterTriggerButton section="price" title="قیمت" icon={DollarSign} />
          <FilterTriggerButton section="rating" title="ستاره" icon={Star} />
          <FilterTriggerButton section="amenities" title="امکانات" icon={Sparkles} />
          <FilterTriggerButton section="type" title="نوع" icon={Building} />
        </div>

        {/* Individual Filter Modals */}
        <Sheet open={isSheetOpen && !!activeFilterSection} onOpenChange={(open) => {
          setIsSheetOpen(open)
          if (!open) setActiveFilterSection(null)
        }}>
          <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl">
            <SheetHeader className="border-b pb-4">
              <div className="flex items-center justify-between">
                <SheetTitle className="flex items-center gap-2 text-lg">
                  {activeFilterSection === 'price' && <DollarSign className="h-5 w-5" />}
                  {activeFilterSection === 'rating' && <Star className="h-5 w-5" />}
                  {activeFilterSection === 'amenities' && <Sparkles className="h-5 w-5" />}
                  {activeFilterSection === 'type' && <Building className="h-5 w-5" />}
                  {activeFilterSection === 'price' && 'محدوده قیمت'}
                  {activeFilterSection === 'rating' && 'ستاره هتل'}
                  {activeFilterSection === 'amenities' && 'امکانات هتل'}
                  {activeFilterSection === 'type' && 'نوع اقامتگاه'}
                </SheetTitle>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setIsSheetOpen(false)
                    setActiveFilterSection(null)
                  }}
                  className="p-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SheetHeader>
            <div className="h-max overflow-y-auto p-4 pb-24">
              <FilterContent showAllSections={false} />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#fffefe] border-t">
              <Button 
                onClick={handleApplyFilters}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-14 text-lg"
                size="lg"
              >
                اعمال فیلتر
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}