"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFlight } from "@/contexts/search/FlightContext"
import { useSearch } from "@/hooks/use-search"
import { Search, Calendar, MapPin, ChevronDown, Loader2, Users, Baby, User, Plus, Minus, CalendarIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import ShamsiDateModal from "./ShamsiCalendar"
import { formatShamsiDate } from "./utils"

interface DomesticSuggestion {
  id: string
  name: string
  code: string
  city: string
  type: 'city' | 'airport'
}

const DomesticFlightSearch = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [domesticFlightSearch, setDomesticFlightSearch] = useState({
        airline: 'ZV',
        origin: '',
        destination: '',
        adults: 0,
        children: 0,
        departureDate: '',
        returnDate: '',
        tripType: 'oneway',
        infrants: 0
    })
    
    const [suggestions, setSuggestions] = useState<DomesticSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
    const [suggestionLoading, setSuggestionLoading] = useState(false)
    const [currentInput, setCurrentInput] = useState("")
    const [currentField, setCurrentField] = useState("")
    const [isFieldFocused, setIsFieldFocused] = useState("")

    // Passengers popover state
    const [showPassengers, setShowPassengers] = useState(false)

    const { getCitySuggestions } = useSearch()
    const { searchDomesticFlights, setDomesticFlightRequest } = useFlight()
    // searchDomesticFlights, 
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const passengersRef = useRef<HTMLDivElement>(null)
    const fromInputRef = useRef<HTMLInputElement>(null)
    const toInputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (currentInput.length < 2) {
                setSuggestions([])
                setShowSuggestions(false)
                return
            }

            setSuggestionLoading(true)
            try {
                const data = await getCitySuggestions(currentInput, 'domesticFlights')
                setSuggestions(data)
                setShowSuggestions(true)
                setActiveSuggestionIndex(0)
            } catch (error) {
                console.error("Error fetching domestic suggestions:", error)
                setSuggestions([])
            } finally {
                setSuggestionLoading(false)
            }
        }

        const timer = setTimeout(fetchSuggestions, 300)
        return () => clearTimeout(timer)
    }, [currentInput, getCitySuggestions])

    // Handle click outside for suggestions and passengers popover
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Close suggestions
            if (
                suggestionsRef.current && 
                !suggestionsRef.current.contains(event.target as Node) &&
                fromInputRef.current &&
                !fromInputRef.current.contains(event.target as Node) &&
                toInputRef.current &&
                !toInputRef.current.contains(event.target as Node)
            ) {
                setShowSuggestions(false)
            }

            // Close passengers popover
            if (
                passengersRef.current && 
                !passengersRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('.passengers-trigger')
            ) {
                setShowPassengers(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    // Extract airport code from the selected value
    const extractAirportCode = (value: string): string => {
        const match = value.match(/\(([A-Z]{3})\)/)
        return match ? match[1] : value
    }

    const handleSuggestionClick = (suggestion: DomesticSuggestion, field: string) => {
        const value = `${suggestion.city} (${suggestion.code}) - ${suggestion.name}`
        
        setDomesticFlightSearch(prev => ({ ...prev, [field]: value }))
        setShowSuggestions(false)
        setCurrentInput("")
        setIsFieldFocused("")
    }

    const handleInputChange = (value: string, field: string) => {
        setCurrentInput(value)
        setCurrentField(field)
        setDomesticFlightSearch(prev => ({ ...prev, [field]: value }))
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

    const handlePassengerChange = (type: 'adults' | 'children' | 'infants', operation: 'increment' | 'decrement') => {
        setDomesticFlightSearch(prev => {
            const currentValue = prev[type]
            let newValue = currentValue

            if (operation === 'increment') {
                const maxValues = { adults: 9, children: 8, infants: 4 }
                newValue = Math.min(currentValue + 1, maxValues[type])
            } else {
                const minValues = { adults: 1, children: 0, infants: 0 }
                newValue = Math.max(currentValue - 1, minValues[type])
            }

            return { ...prev, [type]: newValue }
        })
    }

    // Map cabin class origin API cabin type
    const getCabinType = (cabinClass: string): string => {
        const cabinMap: { [key: string]: string } = {
            economy: "Y",
            business: "C",
            first: "F"
        }
        return cabinMap[cabinClass] || "Y"
    }

    // Map trip type origin API air trip type
    const getAirTripType = (tripType: string): string => {
        const tripTypeMap: { [key: string]: string } = {
            oneway: "OneWay",
            roundtrip: "Return"
        }
        return tripTypeMap[tripType] || "OneWay"
    }

    const router = useRouter()

    const handleDomesticFlightSearch = async () => {
        if (!domesticFlightSearch.origin || !domesticFlightSearch.destination || !domesticFlightSearch.departureDate) {
            alert("لطفا تمام فیلدهای ضروری را پر کنید")
            return
        }

        // if (domesticFlightSearch.tripType === "roundtrip" && !domesticFlightSearch.returnDate) {
        //     alert("لطفا تاریخ برگشت را نیز انتخاب کنید")
        //     return
        // }

        setIsLoading(true)
        try {
            // Extract airport codes
            const originCode = extractAirportCode(domesticFlightSearch.origin)
            const destinationCode = extractAirportCode(domesticFlightSearch.destination)
           
            // Prepare request body for Domestic API
            const requestBody = {
                airline: 'ZV',
                origin: originCode,
                destination: destinationCode,
                departureDate: domesticFlightSearch.departureDate,
                adults: domesticFlightSearch.adults,
                children: domesticFlightSearch.children
            }

            // Add return flight for round trips
            // if (domesticFlightSearch.tripType === "roundtrip" && domesticFlightSearch.returnDate) {
            //     requestBody.OriginDestinationInformations.push({
            //         DepartureDateTime: `${domesticFlightSearch.returnDate}T00:00:00.0000000+03:30`,
            //         DestinationLocationCode: originCode,
            //         DestinationType: "None",
            //         OriginLocationCode: destinationCode,
            //         OriginType: "None"
            //     })
            // }
            setDomesticFlightRequest(requestBody)
            // Call the domestic flight search API
            const response = await searchDomesticFlights(requestBody)
            console.log(response)
        
            // setFlightsData(response.PricedItineraries)
            // router.push('/domestic-flights')

        } catch (error) {
            console.error("Domestic flight search error:", error)
            alert("خطا در جستجوی پرواز داخلی")
        } finally {
            setIsLoading(false)
        }
    }

    const renderSuggestions = (field: string) => {
        if (!showSuggestions || suggestions.length === 0 || currentField !== field) return null

        return (
            <div 
                ref={suggestionsRef}
                className="absolute top-full right-0 left-0 bg-white border-2 border-blue-300 rounded-2xl shadow-2xl z-50 max-h-80 overflow-y-auto mt-2 transition-all duration-300 transform origin-top"
                style={{
                    animation: 'slideDown 0.3s ease-out'
                }}
            >
                {suggestions.map((suggestion, index) => (
                    <div
                        key={`${suggestion.id}-${index}`}
                        className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-all duration-200 ${
                            index === activeSuggestionIndex 
                                ? 'bg-blue-50 border-r-4 border-r-blue-500 scale-[1.02]' 
                                : 'hover:bg-gray-50 hover:scale-[1.01]'
                        }`}
                        onMouseDown={(e) => {
                            e.preventDefault()
                            handleSuggestionClick(suggestion, field)
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 text-right">
                                <div className="flex items-center gap-3 justify-end">
                                    <span className="font-bold text-lg text-gray-800">
                                        {suggestion.city}
                                    </span>
                                    <span className="text-blue-600 font-bold text-lg">({suggestion.code})</span>
                                </div>
                                <div className="text-base text-gray-600 mt-1">
                                    {suggestion.name}
                                </div>
                                <div className="flex items-center gap-3 mt-2 justify-end">
                                    <span className="text-sm text-gray-500">
                                        ایران
                                    </span>
                                    <span className="text-sm bg-green-100 text-green-800 px-3 py-1.5 rounded-full font-medium border border-green-200">
                                        {suggestion.type === 'airport' ? 'فرودگاه' : 'شهر'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        )
    }

    const renderPassengersSelector = () => {
        if (!showPassengers) return null

        return (
            <div 
                ref={passengersRef}
                className="absolute top-full right-0 left-0 bg-white border-2 border-blue-300 rounded-2xl shadow-2xl z-50 p-6 mt-2 transition-all duration-300 transform origin-top"
                style={{
                    animation: 'slideDown 0.3s ease-out'
                }}
            >
                <div className="space-y-6">
                    {/* Adults Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-lg text-gray-800">بزرگسالان</div>
                            <div className="text-sm text-gray-600 mt-1">(12 سال به بالا)</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handlePassengerChange('adults', 'decrement')}
                                disabled={domesticFlightSearch.adults <= 1}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <span className="text-2xl font-bold text-gray-800 min-w-8 text-center">
                                {domesticFlightSearch.adults}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('adults', 'increment')}
                                disabled={domesticFlightSearch.adults >= 9}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Children Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-lg text-gray-800">کودکان</div>
                            <div className="text-sm text-gray-600 mt-1">(2 تا 12 سال)</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handlePassengerChange('children', 'decrement')}
                                disabled={domesticFlightSearch.children <= 0}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <span className="text-2xl font-bold text-gray-800 min-w-8 text-center">
                                {domesticFlightSearch.children}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('children', 'increment')}
                                disabled={domesticFlightSearch.children >= 8}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>

                    {/* Infants Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-lg text-gray-800">نوزادان</div>
                            <div className="text-sm text-gray-600 mt-1">(زیر 2 سال)</div>
                        </div>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => handlePassengerChange('infants', 'decrement')}
                                disabled={domesticFlightSearch.infants <= 0}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
                            >
                                <Minus className="h-5 w-5" />
                            </button>
                            <span className="text-2xl font-bold text-gray-800 min-w-8 text-center">
                                {domesticFlightSearch.infants}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('infants', 'increment')}
                                disabled={domesticFlightSearch.infants >= 4}
                                className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 disabled:bg-gray-100 disabled:text-gray-400 transition-all duration-200"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const totalPassengers = domesticFlightSearch.adults + domesticFlightSearch.children + domesticFlightSearch.infants

    return (
        <div className="rounded-3xl"  style={{direction:'rtl'}}>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* From Input */}
                <div className="space-y-3 relative">
                    <Label htmlFor="domestic-flight-origin" className="text-lg font-bold text-white text-right block">مبدا (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                        {suggestionLoading && currentField === "origin" && (
                            <Loader2 className="absolute left-4 top-4 h-5 w-5 animate-spin text-blue-600" />
                        )}
                        <Input 
                            ref={fromInputRef}
                            id="domestic-flight-from" 
                            placeholder="تهران (IKA), مشهد (MHD)..." 
                            className={`pr-12 h-14 rounded-2xl border-2 bg-white text-gray-800 placeholder-gray-500 text-lg font-medium transition-all duration-300 ${
                                isFieldFocused === "origin"
                                    ? 'border-blue-500 scale-105 shadow-lg' 
                                    : 'border-gray-300 hover:border-blue-400'
                            } ${showSuggestions && currentField === "origin" ? 'rounded-b-none border-b-2 border-b-blue-300' : ''}`}
                            value={domesticFlightSearch.origin}
                            onChange={(e) => handleInputChange(e.target.value, "origin")}
                            onKeyDown={(e) => handleKeyDown(e, "origin")}
                            onFocus={() => {
                                setCurrentField("origin")
                                setIsFieldFocused("origin")
                                setShowSuggestions(suggestions.length > 0)
                            }}
                            onBlur={() => {
                                setIsFieldFocused("")
                                setTimeout(() => setShowSuggestions(false), 200)
                            }}
                        />
                        {renderSuggestions("origin")}
                    </div>
                </div>
                
                {/* To Input */}
                <div className="space-y-3 relative">
                    <Label htmlFor="domestic-flight-origin" className="text-lg font-bold text-white text-right block">مقصد (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                        {suggestionLoading && currentField === "origin" && (
                            <Loader2 className="absolute left-4 top-4 h-5 w-5 animate-spin text-blue-600" />
                        )}
                        <Input 
                            ref={toInputRef}
                            id="domestic-flight-destination" 
                            placeholder="مشهد (MHD), شیراز (SYZ)..." 
                            className={`pr-12 h-14 rounded-2xl border-2 bg-white text-gray-800 placeholder-gray-500 text-lg font-medium transition-all duration-300 ${
                                isFieldFocused === "destination"
                                    ? 'border-blue-500 scale-105 shadow-lg' 
                                    : 'border-gray-300 hover:border-blue-400'
                            } ${showSuggestions && currentField === "destination" ? 'rounded-b-none border-b-2 border-b-blue-300' : ''}`}
                            value={domesticFlightSearch.destination}
                            onChange={(e) => handleInputChange(e.target.value, "destination")}
                            onKeyDown={(e) => handleKeyDown(e, "destination")}
                            onFocus={() => {
                                setCurrentField("destination")
                                setIsFieldFocused("destination")
                                setShowSuggestions(suggestions.length > 0)
                            }}
                            onBlur={() => {
                                setIsFieldFocused("")
                                setTimeout(() => setShowSuggestions(false), 200)
                            }}
                        />
                        {renderSuggestions("destination")}
                    </div>
                </div>

                {/* Trip Type */}
                <div className="space-y-3">
                    <Label htmlFor="domestic-flight-trip-type" className="text-lg font-bold text-white text-right block">نوع سفر</Label>
                    <div className="relative">
                        <select 
                            id="domestic-flight-trip-type"
                            className="w-full h-14 rounded-2xl border-2 border-gray-300 bg-white text-gray-800 text-lg font-medium px-4 pr-12 focus:border-blue-500 focus:scale-105 focus:shadow-lg transition-all duration-300 appearance-none"
                            value={domesticFlightSearch.tripType}
                            onChange={(e) => setDomesticFlightSearch(prev => ({ ...prev, tripType: e.target.value }))}
                        >
                            <option value="oneway">یک طرفه</option>
                            <option value="roundtrip">رفت و برگشت</option>
                        </select>
                        <ChevronDown className="absolute left-4 top-4 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mt-6">
                {/* Departure Date */}
                <div className="space-y-3">
                    <ShamsiDateModal
                        departureDate={domesticFlightSearch.departureDate}
                        returnDate={domesticFlightSearch.returnDate || ""}
                        tripType={domesticFlightSearch.tripType}
                        onDepartureDateChange={(date) => setDomesticFlightSearch(prev => ({ ...prev, departureDate: date }))}
                        onReturnDateChange={(date) => setDomesticFlightSearch(prev => ({ ...prev, returnDate: date }))}
                        onTripTypeChange={(type) => setDomesticFlightSearch(prev => ({ ...prev, tripType: type }))}
                    />
                </div>

                {/* Return Date */}
                {domesticFlightSearch.tripType === "roundtrip" && (
                    <div className="space-y-3">
                        <Label className="text-lg font-bold text-white text-right block">تاریخ برگشت</Label>
                        <div className="relative">
                        <CalendarIcon className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
                        <div className="w-full h-14 rounded-2xl border-2 border-gray-300 bg-white text-gray-800 text-lg font-medium flex items-center px-4 pr-12">
                            <span className="text-gray-800">
                            {formatShamsiDate(domesticFlightSearch.returnDate)}
                            </span>
                        </div>
                        </div>
                    </div>
                )}

                {/* Cabin Class */}
                <div className="space-y-3">
                    <Label htmlFor="domestic-flight-cabin-class" className="text-lg font-bold text-white text-right block">کلاس پرواز</Label>
                    <div className="relative">
                        <select 
                            id="domestic-flight-cabin-class"
                            className="w-full h-14 rounded-2xl border-2 border-gray-300 bg-white text-gray-800 text-lg font-medium px-4 pr-12 focus:border-blue-500 focus:scale-105 focus:shadow-lg transition-all duration-300 appearance-none"
                            value={domesticFlightSearch.cabinClass}
                            onChange={(e) => setDomesticFlightSearch(prev => ({ ...prev, cabinClass: e.target.value }))}
                        >
                            <option value="economy">اکونومی</option>
                            <option value="business">بیزینس</option>
                        </select>
                        <ChevronDown className="absolute left-4 top-4 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                </div>

                {/* Passengers Selector */}
                <div className="space-y-3 relative">
                    <Label className="text-lg font-bold text-white text-right block">مسافران</Label>
                    <div 
                        className="passengers-trigger cursor-pointer"
                        onClick={() => setShowPassengers(!showPassengers)}
                    >
                        <div className="relative h-14 rounded-2xl border-2 border-gray-300 bg-white hover:border-blue-400 transition-all duration-300 flex items-center justify-between px-4">
                            <div className="flex items-center gap-3">
                                <Users className="h-5 w-5 text-gray-400" />
                                <User className="h-5 w-5 text-gray-400" />
                                <Baby className="h-5 w-5 text-gray-400" />
                            </div>
                            <div className="text-right">
                                <div className="text-gray-800 text-lg font-medium">
                                    {totalPassengers} مسافر
                                </div>
                                <div className="text-gray-500 text-sm">
                                    {domesticFlightSearch.adults} بزرگسال, {domesticFlightSearch.children} کودک, {domesticFlightSearch.infants} نوزاد
                                </div>
                            </div>
                        </div>
                    </div>
                    {renderPassengersSelector()}
                </div>
            </div>
            
            {/* Search Button */}
            <Button 
                className="w-full h-16 text-xl font-bold rounded-2xl bg-gradient-origin-r bg-white from-white origin-blue-100 text-red-600 hover:from-blue-100 hover:bg-white transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 mt-8"
                onClick={handleDomesticFlightSearch}
                disabled={isLoading}
            >
                <Search className="ml-3 h-6 w-6" />
                {isLoading ? "در حال جستجو..." : "جستجوی پرواز داخلی"}
            </Button>

            <style jsx>{`
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px) scale(0.95);
                    }
                    origin {
                        opacity: 1;
                        transform: translateY(0) scale(1);
                    }
                }
                
                /* Style the date input for better appearance */
                input[type="date"] {
                    color-scheme: light;
                }
            `}</style>
        </div>
    )
}

export default DomesticFlightSearch