"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFlight } from "@/contexts/search/FlightContext"
import { useSearch } from "@/hooks/use-search"
import { Search, Calendar, MapPin, ChevronDown, Loader2, Users, Baby, User, Plus, Minus, CalendarIcon, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import ShamsiDateModal from "./ShamsiCalendar"
import { formatShamsiDate } from "./utils"
import { shamsiToGregorianString } from "@/lib/jalaalil"

interface Suggestion {
  id: string
  name: string
  country: string
  code?: string
  city?: string
  type: 'city' | 'airport'
}

interface FormErrors {
  from?: string
  to?: string
  departureDate?: string
  returnDate?: string
  general?: string
}

interface FlightSearchState {
  from: Suggestion | null
  to: Suggestion | null
  displayFrom: string
  displayTo: string
  departureDate: string
  returnDate: string
  adults: number
  children: number
  infants: number
  tripType: string
  cabinClass: string
}

const FlightSearch = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [flightSearch, setFlightSearch] = useState<FlightSearchState>({
        from: null,
        to: null,
        displayFrom: "",
        displayTo: "",
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
    const [currentField, setCurrentField] = useState<"from" | "to" | "">("")
    const [isFieldFocused, setIsFieldFocused] = useState("")
    const [errors, setErrors] = useState<FormErrors>({})
    const [openCalendarId, setOpenCalendarId] = useState<string | null>(null)

    // Passengers popover state
    const [showPassengers, setShowPassengers] = useState(false)

    const { getCitySuggestions } = useSearch()
    const { searchFlights, setFlightsData, setFlightRequest } = useFlight()
    
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const passengersRef = useRef<HTMLDivElement>(null)
    const fromInputRef = useRef<HTMLInputElement>(null)
    const toInputRef = useRef<HTMLInputElement>(null)

    // Clear errors when user starts typing
    useEffect(() => {
        if (errors.from && flightSearch.from) {
            setErrors(prev => ({ ...prev, from: undefined }))
        }
        if (errors.to && flightSearch.to) {
            setErrors(prev => ({ ...prev, to: undefined }))
        }
        if (errors.departureDate && flightSearch.departureDate) {
            setErrors(prev => ({ ...prev, departureDate: undefined }))
        }
        if (errors.returnDate && flightSearch.returnDate) {
            setErrors(prev => ({ ...prev, returnDate: undefined }))
        }
    }, [flightSearch.from, flightSearch.to, flightSearch.departureDate, flightSearch.returnDate, errors])

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
                console.log("Suggestions for:", currentInput, data)
                setSuggestions(data)
                setShowSuggestions(true)
                setActiveSuggestionIndex(0)
            } catch (error) {
                console.error("Error fetching suggestions:", error)
                setSuggestions([])
                setErrors(prev => ({ ...prev, general: "خطا در دریافت پیشنهادات شهرها" }))
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

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!flightSearch.from) {
            newErrors.from = "لطفا شهر مبداء را انتخاب کنید"
        }

        if (!flightSearch.to) {
            newErrors.to = "لطفا شهر مقصد را انتخاب کنید"
        }

        if (flightSearch.from && flightSearch.to) {
            const originCode = flightSearch.from.code
            const destinationCode = flightSearch.to.code
            if (originCode === destinationCode) {
                newErrors.to = "شهر مبدا و مقصد نمی‌توانند یکسان باشند"
            }
        }

        if (!flightSearch.departureDate) {
            newErrors.departureDate = "لطفا تاریخ رفت را انتخاب کنید"
        }

        if (flightSearch.tripType === "roundtrip" && !flightSearch.returnDate) {
            newErrors.returnDate = "لطفا تاریخ برگشت را انتخاب کنید"
        }

        if (flightSearch.departureDate && flightSearch.returnDate) {
            const departure = new Date(flightSearch.departureDate)
            const returnDate = new Date(flightSearch.returnDate)
            if (returnDate < departure) {
                newErrors.returnDate = "تاریخ برگشت نمی‌تواند قبل از تاریخ رفت باشد"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSuggestionClick = (suggestion: Suggestion, field: "from" | "to") => {
        let displayValue = ""
        
        if (suggestion.type === 'airport') {
            displayValue = `${suggestion.city} (${suggestion.code}) - ${suggestion.name}`
        } else {
            displayValue = suggestion.name
        }
        
        // Validate country match for "to" field
        if (field === "to" && flightSearch.from?.country === suggestion.country) {
            setErrors(prev => ({ 
                ...prev, 
                to: "شهر مبدا و مقصد نمی‌توانند از یک کشور باشند" 
            }))
            return
        }

        setFlightSearch(prev => ({ 
            ...prev, 
            [field]: suggestion,
            [`display${field.charAt(0).toUpperCase() + field.slice(1)}`]: displayValue
        }))
        setShowSuggestions(false)
        setCurrentInput("")
        setCurrentField("")
        
        // Clear error for this field
        setErrors(prev => ({ ...prev, [field]: undefined }))
        
        // If there was a country match error, clear it
        if (errors.to && field === "to") {
            setErrors(prev => ({ ...prev, to: undefined }))
        }
    }

    const handleInputChange = (value: string, field: "from" | "to") => {
        setCurrentInput(value)
        setCurrentField(field)
        setFlightSearch(prev => ({ 
            ...prev, 
            [`display${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
            [field]: null // Clear the selected suggestion when user types
        }))
        
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, field: "from" | "to") => {
        if (!showSuggestions || currentField !== field) return

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
            setCurrentField("")
        }
    }

    const handleFocus = (field: "from" | "to") => {
        setCurrentField(field)
        setIsFieldFocused(field)
        // Only show suggestions if there's text in the input
        if (flightSearch[`display${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Pick<FlightSearchState, 'displayFrom' | 'displayTo'>]) {
            setShowSuggestions(suggestions.length > 0)
        }
    }

    const handleBlur = () => {
        setIsFieldFocused("")
        // Use timeout to allow click events to register
        setTimeout(() => {
            setShowSuggestions(false)
            setCurrentField("")
        }, 200)
    }

    const handlePassengerChange = (type: 'adults' | 'children' | 'infants', operation: 'increment' | 'decrement') => {
        setFlightSearch(prev => {
            const currentValue = prev[type];
            let newValue = currentValue;

            if (operation === 'increment') {
                const maxValues = { adults: 9, children: 8, infants: 4 };
                
                // Calculate current total using all passenger types from prev state
                const currentTotal = prev.adults + prev.children + prev.infants;
                
                // Check if adding one would exceed maximum total of 9
                if (currentTotal >= 9) {
                    return prev; // Don't allow increment - return previous state unchanged
                }
                
                // Special validation for children and infants
                if (type === 'children') {
                    // Children cannot be equal to or greater than adults
                    if (prev.children >= prev.adults) {
                        return prev;
                    }
                } else if (type === 'infants') {
                    // Infants cannot be equal to or greater than adults
                    if (prev.infants >= prev.adults) {
                        return prev;
                    }
                }

                newValue = Math.min(currentValue + 1, maxValues[type]);
            } else {
                const minValues = { adults: 1, children: 0, infants: 0 };
                newValue = Math.max(currentValue - 1, minValues[type]);
            }

            return { ...prev, [type]: newValue };
        });
    };

    // Map cabin class to API cabin type
    const getCabinType = (cabinClass: string): string => {
        const cabinMap: { [key: string]: string } = {
            economy: "Y",
            business: "C",
            first: "F",        
            premiumEconomy: "S",             // Premium Economy            
            premiumBussiness: "J",           // Premium Business              
            premiumFirst: "P"             // Premium First    
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

    const router = useRouter()

    const handleFlightSearch = async () => {
        // Clear previous errors
        setErrors({})
        
        // Validate form
        if (!validateForm()) {
            // Focus on first error field
            if (errors.from) {
                fromInputRef.current?.focus()
            } else if (errors.to) {
                toInputRef.current?.focus()
            }
            return
        }

        setIsLoading(true)
        try {
            // Extract airport codes
            const originCode = flightSearch.from?.code || ""
            const destinationCode = flightSearch.to?.code || ""
            const gregorianDepartureDate = shamsiToGregorianString(flightSearch.departureDate)
            
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
                        DepartureDateTime: `${gregorianDepartureDate}T00:00:00.0000000+03:30`,
                        DestinationLocationCode: destinationCode,
                        DestinationType: 0,
                        OriginLocationCode: originCode,
                        OriginType: 0
                    }
                ],
                IsGenuine: false
            }

            // Add return flight for round trips
            if (flightSearch.tripType === "roundtrip" && flightSearch.returnDate) {
                const gregorianReturnDate = shamsiToGregorianString(flightSearch.returnDate)
                requestBody.OriginDestinationInformations.push({
                    DepartureDateTime: `${gregorianReturnDate}T00:00:00.0000000+03:30`,
                    DestinationLocationCode: originCode,
                    DestinationType: 0,
                    OriginLocationCode: destinationCode,
                    OriginType: 0
                })
            }
            
            setFlightRequest(requestBody)
            const response = await searchFlights(requestBody)
            
            setFlightsData(response.PricedItineraries, "intl", flightSearch.from?.city, flightSearch.to?.city)
            router.push('/flights')

        } catch (error) {
            console.error("Flight search error:", error)
            setErrors(prev => ({ 
                ...prev, 
                general: "خطا در جستجوی پرواز. لطفا دوباره تلاش کنید." 
            }))
        } finally {
            setIsLoading(false)
        }
    }

    const renderError = (field: keyof FormErrors) => {
        if (!errors[field]) return null
        
        return (
            <div className="flex items-center gap-2 mt-2 text-black text-sm">
                <AlertCircle className="h-4 w-4" />
                <span>{errors[field]}</span>
            </div>
        )
    }

    const renderSuggestions = (field: "from" | "to") => {
        if (!showSuggestions || suggestions.length === 0 || currentField !== field) return null

        return (
            <div 
                ref={suggestionsRef}
                className="absolute top-full right-0 left-0 bg-[#fffefe] border border-gray-300 shadow-lg z-50 max-h-80 overflow-y-auto mt-1 rounded-md"
            >
                {suggestions.map((suggestion, index) => (
                    <div
                        key={`${suggestion.id}-${index}`}
                        className={`p-3 cursor-pointer border-b border-gray-200 last:border-b-0 ${
                            index === activeSuggestionIndex 
                                ? 'bg-blue-50 border-blue-200' 
                                : 'hover:bg-gray-50'
                        }`}
                        onMouseDown={(e) => {
                            e.preventDefault() // Prevent input blur
                            handleSuggestionClick(suggestion, field)
                        }}
                        onMouseEnter={() => setActiveSuggestionIndex(index)}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 text-right">
                                {suggestion.type === 'airport' ? (
                                    <>
                                        <div className="flex items-center gap-2 justify-end">
                                            <span className="font-bold text-black">
                                                {suggestion.city}
                                            </span>
                                            <span className="text-blue-500 font-bold">({suggestion.code})</span>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {suggestion.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 justify-end">
                                            <span className="text-xs text-gray-500">
                                                {suggestion.country}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300">
                                                فرودگاه
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-bold text-black">
                                            {suggestion.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 justify-end">
                                            <span className="text-xs text-gray-500">
                                                {suggestion.country}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-gray-300">
                                                شهر
                                            </span>
                                        </div>
                                    </>
                                )}
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
                className="absolute top-full right-0 left-0 bg-[#fffefe] border border-gray-300 shadow-lg z-50 p-4 mt-1 rounded-md"
            >
                <div className="space-y-4">
                    {/* Adults Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-black">بزرگسالان</div>
                            <div className="text-xs text-gray-600 mt-1">(12 سال به بالا)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePassengerChange('adults', 'decrement')}
                                disabled={flightSearch.adults <= 1}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-bold text-black min-w-6 text-center">
                                {flightSearch.adults}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('adults', 'increment')}
                                disabled={flightSearch.adults >= 9}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Children Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-black">کودکان</div>
                            <div className="text-xs text-gray-600 mt-1">(2 تا 12 سال)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePassengerChange('children', 'decrement')}
                                disabled={flightSearch.children <= 0}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-bold text-black min-w-6 text-center">
                                {flightSearch.children}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('children', 'increment')}
                                disabled={flightSearch.children >= 8}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Infants Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-black">نوزادان</div>
                            <div className="text-xs text-gray-600 mt-1">(زیر 2 سال)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePassengerChange('infants', 'decrement')}
                                disabled={flightSearch.infants <= 0}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-bold text-black min-w-6 text-center">
                                {flightSearch.infants}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('infants', 'increment')}
                                disabled={flightSearch.infants >= 4}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const totalPassengers = flightSearch.adults + flightSearch.children + flightSearch.infants

    return (
        <div style={{direction:'rtl'}}>
            {/* General Error Display */}
            {errors.general && (
                <div className="mb-4 p-3 bg-red-500 border border-red-700 flex items-center gap-3 rounded">
                    <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
                    <p className="text-white text-sm font-medium">{errors.general}</p>
                </div>
            )}
            
            <div className="w-full flex gap-2">
                {/* Trip Type */}
                <div className="w-[150px]">
                    <Label htmlFor="flight-trip-type" className="text-black text-right block mb-2">نوع سفر</Label>
                    <div className="relative">
                        <select 
                            id="flight-trip-type"
                            className="w-full h-12 border rounded-full border-gray-300 bg-[#fffefe] text-black px-3 pr-10 appearance-none focus:outline-none focus:border-blue-500"
                            value={flightSearch.tripType}
                            onChange={(e) => setFlightSearch(prev => ({ ...prev, tripType: e.target.value }))}
                        >
                            <option value="oneway">یک طرفه</option>
                            <option value="roundtrip">رفت و برگشت</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                {/* Cabin Class */}
                <div className="w-[150px]">
                    <Label htmlFor="flight-cabin-class" className="text-black text-right block mb-2">کلاس پرواز</Label>
                    <div className="relative">
                        <select 
                            id="flight-cabin-class"
                            className="w-full rounded-full h-12 border border-gray-300 bg-[#fffefe] text-black px-3 pr-10 appearance-none focus:outline-none focus:border-blue-500"
                            value={flightSearch.cabinClass}
                            onChange={(e) => setFlightSearch(prev => ({ ...prev, cabinClass: e.target.value }))}
                        >
                            <option value="economy">اکونومی</option>
                            <option value="business">بیزینس</option>
                            <option value="first">فرست کلاس</option>
                            <option value="premiumEconomy">پرمیوم اکونومی</option>
                            <option value="premiumBussiness">پرمیوم بیزینس</option>
                            <option value="premiumFirst">پرمیوم فرست کلاس</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            <div className={`grid gap-4 md:grid-cols-2 relative pt-10 ${flightSearch.tripType === "oneway" ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
                {/* From Input */}
                <div className="space-y-2 col-span-1 relative">
                    <Label htmlFor="flight-from" className="text-black text-right block">مبدا (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        {suggestionLoading && currentField === "from" && (
                            <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-blue-500" />
                        )}
                        <Input 
                            ref={fromInputRef}
                            id="flight-from" 
                            placeholder="نام فرودگاه، مثال: تهران (IKA)" 
                            className={`pr-10 h-12 border bg-[#fffefe] text-black placeholder-gray-500 focus:outline-none ${
                                errors.from 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-blue-500'
                            }`}
                            value={flightSearch.displayFrom}
                            onChange={(e) => handleInputChange(e.target.value, "from")}
                            onKeyDown={(e) => handleKeyDown(e, "from")}
                            onFocus={() => handleFocus("from")}
                            onBlur={handleBlur}
                            autoComplete="off"
                        />
                        {renderSuggestions("from")}
                        {renderError("from")}
                    </div>
                </div>
                
                {/* To Input */}
                <div className="space-y-2 col-span-1 relative">
                    <Label htmlFor="flight-to" className="text-black text-right block">مقصد (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        {suggestionLoading && currentField === "to" && (
                            <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-blue-500" />
                        )}
                        <Input 
                            ref={toInputRef}
                            id="flight-to" 
                            placeholder="نام فرودگاه مقصد مثال: استانبول (IST)" 
                            className={`pr-10 h-12 border bg-[#fffefe] text-black placeholder-gray-500 focus:outline-none ${
                                errors.to 
                                    ? 'border-red-500 focus:border-red-500' 
                                    : 'border-gray-300 focus:border-blue-500'
                            }`}
                            value={flightSearch.displayTo}
                            onChange={(e) => handleInputChange(e.target.value, "to")}
                            onKeyDown={(e) => handleKeyDown(e, "to")}
                            onFocus={() => handleFocus("to")}
                            onBlur={handleBlur}
                            autoComplete="off"
                        />
                        {renderSuggestions("to")}
                        {renderError("to")}
                    </div>
                </div>

                {/* Departure Date */}
                <div className="space-y-2 col-span-1 relative">
                    <Label className="text-black text-right block">تاریخ رفت</Label>
                    <ShamsiDateModal
                        calendarId="calendar1"
                        onOpenChange={setOpenCalendarId}
                        isOpen={openCalendarId === "calendar1"}
                        departureDate={flightSearch.departureDate}
                        returnDate={flightSearch.returnDate || ""}
                        tripType={flightSearch.tripType}
                        onDepartureDateChange={(date) => setFlightSearch(prev => ({ ...prev, departureDate: date }))}
                        onReturnDateChange={(date) => setFlightSearch(prev => ({ ...prev, returnDate: date }))}
                        onTripTypeChange={(type) => setFlightSearch(prev => ({ ...prev, tripType: type }))}
                        error={errors.departureDate}
                        errorColor="black"
                    />
                </div>

                {/* Return Date */}
                {flightSearch.tripType === "roundtrip" && (
                    <div className="space-y-2 col-span-1 relative">
                        <Label className="text-black text-right block">تاریخ برگشت</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                            <ShamsiDateModal
                                calendarId="calendar2"
                                onOpenChange={setOpenCalendarId}
                                isOpen={openCalendarId === "calendar2"}
                                departureDate={flightSearch.departureDate}
                                returnDate={flightSearch.returnDate || ""}
                                tripType={flightSearch.tripType}
                                onDepartureDateChange={(date) => setFlightSearch(prev => ({ ...prev, departureDate: date }))}
                                onReturnDateChange={(date) => setFlightSearch(prev => ({ ...prev, returnDate: date }))}
                                onTripTypeChange={(type) => setFlightSearch(prev => ({ ...prev, tripType: type }))}
                                error={errors.returnDate}
                                errorColor="black"
                                returnCal={true}
                            />
                        </div>
                        {renderError("returnDate")}
                    </div>
                )}

                {/* Passengers Selector */}
                <div className="space-y-2 col-span-1 relative">
                    <Label className="text-black text-right block">مسافران</Label>
                    <div 
                        className="passengers-trigger cursor-pointer"
                        onClick={() => setShowPassengers(!showPassengers)}
                    >
                        <div className={`relative h-12 border bg-[#fffefe] hover:border-gray-400 flex items-center justify-between px-3 rounded ${
                            showPassengers ? 'border-blue-500' : 'border-gray-300'
                        }`}>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <User className="h-4 w-4 text-gray-400" />
                                <Baby className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-right">
                                <div className="text-black text-sm font-medium">
                                    {totalPassengers} مسافر
                                </div>
                                <div className="text-gray-500 text-xs">
                                    {flightSearch.adults} بزرگسال, {flightSearch.children} کودک, {flightSearch.infants} نوزاد
                                </div>
                            </div>
                        </div>
                    </div>
                    {renderPassengersSelector()}
                </div>
            </div>
            
            {/* Search Button */}
            <Button 
                className="w-full h-12 bg-blue-500 text-white hover:bg-blue-900 mt-6"
                onClick={handleFlightSearch}
                disabled={isLoading}
            >
                <Search className="ml-2 h-4 w-4" />
                {isLoading ? "در حال جستجو..." : "جستجوی پرواز"}
            </Button>
        </div>
    )
}

export default FlightSearch