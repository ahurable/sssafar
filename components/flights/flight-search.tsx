"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSearch } from "@/hooks/use-search"
import { Search, Calendar, MapPin, ChevronDown, Loader2 } from "lucide-react"
import { useEffect, useState } from "react"

interface Suggestion {
  id: string
  name: string
  country: string
  code?: string
  city?: string
  type: 'city' | 'airport'
}

const FlightSearch = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [flightSearch, setFlightSearch] = useState({
        from: "",
        to: "",
        departureDate: "",
        returnDate: "",
        adults: 1,
        children: 0,
        infants: 0,
        tripType: "oneway",
        cabinClass: "economy"
    })
    
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
    const [suggestionLoading, setSuggestionLoading] = useState(false)
    const [currentInput, setCurrentInput] = useState("")
    const [currentField, setCurrentField] = useState("")

    const { searchHotels, searchFlights, searchTrains, getCitySuggestions } = useSearch()

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (currentInput.length < 2) {
                setSuggestions([])
                setShowSuggestions(false)
                return
            }

            setSuggestionLoading(true)
            try {
                const data = await getCitySuggestions(currentInput, 'flight')
                setSuggestions(data)
                setShowSuggestions(true)
                setActiveSuggestionIndex(0)
            } catch (error) {
                console.error("Error fetching suggestions:", error)
                setSuggestions([])
            } finally {
                setSuggestionLoading(false)
            }
        }

        const timer = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(timer)
    }, [currentInput, getCitySuggestions])

    // Extract airport code from the selected value (e.g., "تهران (IKA)" -> "IKA")
    const extractAirportCode = (value: string): string => {
        const match = value.match(/\(([A-Z]{3})\)/)
        return match ? match[1] : value
    }

    const handleSuggestionClick = (suggestion: Suggestion, field: string) => {
        let value = ""
        
        if (suggestion.type === 'airport') {
            value = `${suggestion.city} (${suggestion.code}) - ${suggestion.name}`
        } else {
            value = suggestion.name
        }
        
        setFlightSearch(prev => ({ ...prev, [field]: value }))
        setShowSuggestions(false)
        setCurrentInput("")
    }

    const handleInputChange = (value: string, field: string) => {
        setCurrentInput(value)
        setCurrentField(field)
        setFlightSearch(prev => ({ ...prev, [field]: value }))
    }

    const handleKeyDown = (e: React.KeyboardEvent, field: string) => {
        if (!showSuggestions) return

        if (e.key === "ArrowDown") {
            e.preventDefault()
            setActiveSuggestionIndex(prev => 
                prev < suggestions.length - 1 ? prev + 1 : prev
            )
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setActiveSuggestionIndex(prev => prev > 0 ? prev - 1 : prev)
        } else if (e.key === "Enter") {
            e.preventDefault()
            if (suggestions[activeSuggestionIndex]) {
                handleSuggestionClick(suggestions[activeSuggestionIndex], field)
            }
        } else if (e.key === "Escape") {
            setShowSuggestions(false)
        }
    }

    // Map cabin class to API cabin type
    const getCabinType = (cabinClass: string): string => {
        const cabinMap: { [key: string]: string } = {
            economy: "Y",
            business: "C",
            first: "F"
        }
        return cabinMap[cabinClass] || "Y"
    }

    // Map trip type to API air trip type
    const getAirTripType = (tripType: string): string => {
        const tripTypeMap: { [key: string]: string } = {
            oneway: "OneWay",
            roundtrip: "Return"
        }
        return tripTypeMap[tripType] || "OneWay"
    }

    const handleFlightSearch = async () => {
        if (!flightSearch.from || !flightSearch.to || !flightSearch.departureDate) {
            alert("لطفا تمام فیلدهای ضروری را پر کنید")
            return
        }

        if (flightSearch.tripType === "roundtrip" && !flightSearch.returnDate) {
            alert("لطفا تاریخ برگشت را نیز انتخاب کنید")
            return
        }

        setIsLoading(true)
        try {
            // Extract airport codes
            const originCode = extractAirportCode(flightSearch.from)
            const destinationCode = extractAirportCode(flightSearch.to)

            // Prepare request body for PartoCRS API
            const requestBody = {
                PricingSourceType: "All",
                RequestOption: "All",
                AdultCount: flightSearch.adults,
                ChildCount: flightSearch.children,
                InfantCount: flightSearch.infants,
                TravelPreference: {
                    CabinType: getCabinType(flightSearch.cabinClass),
                    MaxStopsQuantity: "All",
                    AirTripType: getAirTripType(flightSearch.tripType),
                    VendorExcludeCodes: [],
                    VendorPreferenceCodes: []
                },
                OriginDestinationInformations: [
                    {
                        DepartureDateTime: `${flightSearch.departureDate}T00:00:00.0000000+03:30`,
                        DestinationLocationCode: destinationCode,
                        DestinationType: "None",
                        OriginLocationCode: originCode,
                        OriginType: "None"
                    }
                ],
                IsGenuine: false
            }

            // Add return flight for round trips
            if (flightSearch.tripType === "roundtrip" && flightSearch.returnDate) {
                requestBody.OriginDestinationInformations.push({
                    DepartureDateTime: `${flightSearch.returnDate}T00:00:00.0000000+03:30`,
                    DestinationLocationCode: originCode,
                    DestinationType: "None",
                    OriginLocationCode: destinationCode,
                    OriginType: "None"
                })
            }

            // Call the flight search API
            const response = await searchFlights(requestBody)
            
            // Handle the response - you might want to pass this to a parent component or context
            console.log("Flight search results:", response)
            
            // Show success message or redirect to results page
            alert(`پروازهای یافت شده: ${response.length || 0} مورد`)

        } catch (error) {
            console.error("Flight search error:", error)
            alert("خطا در جستجوی پرواز")
        } finally {
            setIsLoading(false)
        }
    }

    const renderSuggestions = (field: string) => {
        if (!showSuggestions || suggestions.length === 0 || currentField !== field) return null

        return (
            <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto mt-1">
                {suggestions.map((suggestion, index) => (
                    <div
                        key={`${suggestion.id}-${index}`}
                        className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                            index === activeSuggestionIndex ? "bg-blue-50 dark:bg-blue-900/20" : ""
                        } ${index !== suggestions.length - 1 ? "border-b border-gray-100 dark:border-gray-600" : ""}`}
                        onClick={() => handleSuggestionClick(suggestion, field)}
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex-1">
                                {suggestion.type === 'airport' ? (
                                    <>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {suggestion.city} <span className="text-blue-600">({suggestion.code})</span>
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            {suggestion.name}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                            {suggestion.country}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-medium text-gray-900 dark:text-white">
                                            {suggestion.name}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">
                                            {suggestion.country}
                                        </div>
                                    </>
                                )}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full ml-2 ${
                                suggestion.type === 'airport' 
                                ? 'bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200'
                                : 'bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200'
                            }`}>
                                {suggestion.type === 'airport' ? 'فرودگاه' : 'شهر'}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    return (
        <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-3 relative">
                    <Label htmlFor="flight-from" className="text-sm font-semibold">مبدا (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        {suggestionLoading && currentField === "from" && (
                            <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        <Input 
                            id="flight-from" 
                            placeholder="تهران (IKA), دبی (DXB)..." 
                            className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                            value={flightSearch.from}
                            onChange={(e) => handleInputChange(e.target.value, "from")}
                            onKeyDown={(e) => handleKeyDown(e, "from")}
                            onFocus={() => setCurrentField("from")}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                        {renderSuggestions("from")}
                    </div>
                </div>
                
                <div className="space-y-3 relative">
                    <Label htmlFor="flight-to" className="text-sm font-semibold">مقصد (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        {suggestionLoading && currentField === "to" && (
                            <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />
                        )}
                        <Input 
                            id="flight-to" 
                            placeholder="استانبول (IST), لندن (LHR)..." 
                            className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                            value={flightSearch.to}
                            onChange={(e) => handleInputChange(e.target.value, "to")}
                            onKeyDown={(e) => handleKeyDown(e, "to")}
                            onFocus={() => setCurrentField("to")}
                            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        />
                        {renderSuggestions("to")}
                    </div>
                </div>

                <div className="space-y-3">
                    <Label htmlFor="flight-trip-type" className="text-sm font-semibold">نوع سفر</Label>
                    <div className="relative">
                        <select 
                            id="flight-trip-type"
                            className="w-full h-12 rounded-lg border-2 border-input bg-background px-3 pr-10 focus:border-blue-500 transition-colors appearance-none"
                            value={flightSearch.tripType}
                            onChange={(e) => setFlightSearch(prev => ({ ...prev, tripType: e.target.value }))}
                        >
                            <option value="oneway">یک طرفه</option>
                            <option value="roundtrip">رفت و برگشت</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <div className="space-y-3">
                    <Label htmlFor="flight-departure-date" className="text-sm font-semibold">تاریخ رفت</Label>
                    <div className="relative">
                        <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input 
                            id="flight-departure-date" 
                            type="date" 
                            min={new Date().toISOString().split('T')[0]}
                            className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                            value={flightSearch.departureDate}
                            onChange={(e) => setFlightSearch(prev => ({ ...prev, departureDate: e.target.value }))}
                        />
                    </div>
                </div>

                {flightSearch.tripType === "roundtrip" && (
                    <div className="space-y-3">
                        <Label htmlFor="flight-return-date" className="text-sm font-semibold">تاریخ برگشت</Label>
                        <div className="relative">
                            <Calendar className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input 
                                id="flight-return-date" 
                                type="date" 
                                min={flightSearch.departureDate || new Date().toISOString().split('T')[0]}
                                className="pr-10 h-12 rounded-lg border-2 focus:border-blue-500 transition-colors"
                                value={flightSearch.returnDate}
                                onChange={(e) => setFlightSearch(prev => ({ ...prev, returnDate: e.target.value }))}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-3">
                    <Label htmlFor="flight-cabin-class" className="text-sm font-semibold">کلاس پرواز</Label>
                    <div className="relative">
                        <select 
                            id="flight-cabin-class"
                            className="w-full h-12 rounded-lg border-2 border-input bg-background px-3 pr-10 focus:border-blue-500 transition-colors appearance-none"
                            value={flightSearch.cabinClass}
                            onChange={(e) => setFlightSearch(prev => ({ ...prev, cabinClass: e.target.value }))}
                        >
                            <option value="economy">اکونومی</option>
                            <option value="business">بیزینس</option>
                            <option value="first">فرست کلاس</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-3">
                        <Label htmlFor="flight-adults" className="text-sm font-semibold">بزرگسال</Label>
                        <Input 
                            id="flight-adults" 
                            type="number" 
                            min="1"
                            max="9"
                            className="h-12 rounded-lg border-2 focus:border-blue-500 transition-colors text-center"
                            value={flightSearch.adults}
                            onChange={(e) => setFlightSearch(prev => ({ ...prev, adults: parseInt(e.target.value) || 1 }))}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="flight-children" className="text-sm font-semibold">کودک</Label>
                        <Input 
                            id="flight-children" 
                            type="number" 
                            min="0"
                            max="8"
                            className="h-12 rounded-lg border-2 focus:border-blue-500 transition-colors text-center"
                            value={flightSearch.children}
                            onChange={(e) => setFlightSearch(prev => ({ ...prev, children: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
                    <div className="space-y-3">
                        <Label htmlFor="flight-infants" className="text-sm font-semibold">نوزاد</Label>
                        <Input 
                            id="flight-infants" 
                            type="number" 
                            min="0"
                            max="4"
                            className="h-12 rounded-lg border-2 focus:border-blue-500 transition-colors text-center"
                            value={flightSearch.infants}
                            onChange={(e) => setFlightSearch(prev => ({ ...prev, infants: parseInt(e.target.value) || 0 }))}
                        />
                    </div>
                </div>
            </div>
            
            <Button 
                className="w-full h-14 text-lg rounded-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                onClick={handleFlightSearch}
                disabled={isLoading}
            >
                <Search className="ml-2 h-5 w-5" />
                {isLoading ? "در حال جستجو..." : "جستجوی پرواز"}
            </Button>
        </>
    )
}

export default FlightSearch