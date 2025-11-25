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

interface DomesticSuggestion {
  id: string
  name: string
  code: string
  city: string
  type: 'city' | 'airport'
}

interface FormErrors {
  from?: string
  to?: string
  departureDate?: string
  returnDate?: string
  general?: string
}

interface Suggestion {
  id: string
  name: string
  country: string
  code?: string
  city?: string
  type: 'city' | 'airport'
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


const DomesticFlightSearch = () => {
    const [isLoading, setIsLoading] = useState(false)
    const [domesticFlightSearch, setDomesticFlightSearch] = useState<FlightSearchState>({
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
    
    const [suggestions, setSuggestions] = useState<DomesticSuggestion[]>([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0)
    const [suggestionLoading, setSuggestionLoading] = useState(false)
    const [currentInput, setCurrentInput] = useState("")
    const [currentField, setCurrentField] = useState("")
    const [isFieldFocused, setIsFieldFocused] = useState("")
    const [errors, setErrors] = useState<FormErrors>({})
    const [openCalendarId, setOpenCalendarId] = useState<string | null>(null)

    // Passengers popover state
    const [showPassengers, setShowPassengers] = useState(false)

    const { getCitySuggestions } = useSearch()
    const { searchDomesticFlights, setDomesticFlightRequest, setFlightRequest, searchFlights, setFlightsData, loading, origin, destination } = useFlight()
    
    const suggestionsRef = useRef<HTMLDivElement>(null)
    const passengersRef = useRef<HTMLDivElement>(null)
    const fromInputRef = useRef<HTMLInputElement>(null)
    const toInputRef = useRef<HTMLInputElement>(null)

    // Clear errors when user starts typing
    useEffect(() => {
        if (errors.from && domesticFlightSearch.from) {
            setErrors(prev => ({ ...prev, from: undefined }))
        }
        if (errors.to && domesticFlightSearch.to) {
            setErrors(prev => ({ ...prev, to: undefined }))
        }
        if (errors.departureDate && domesticFlightSearch.departureDate) {
            setErrors(prev => ({ ...prev, departureDate: undefined }))
        }
        if (errors.returnDate && domesticFlightSearch.returnDate) {
            setErrors(prev => ({ ...prev, returnDate: undefined }))
        }
    }, [domesticFlightSearch.from, domesticFlightSearch.to, domesticFlightSearch.departureDate, domesticFlightSearch.returnDate, errors])

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

    // Extract airport code from the selected value
    const extractAirportCode = (value: string): string => {
        const match = value.match(/\(([A-Z]{3})\)/)
        return match ? match[1] : value
    }

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {}

        if (!domesticFlightSearch.from) {
            newErrors.from = "لطفا شهر مبداء را انتخاب کنید"
        }

        if (!domesticFlightSearch.to) {
            newErrors.to = "لطفا شهر مقصد را انتخاب کنید"
        }
        if (domesticFlightSearch.from && domesticFlightSearch.to) {
            const originCode = domesticFlightSearch.from.code
            const destinationCode = domesticFlightSearch.to.code
            if (originCode === destinationCode) {
                newErrors.to = "شهر مبدا و مقصد نمی‌توانند یکسان باشند"
            }
        }

        if (!domesticFlightSearch.departureDate) {
            newErrors.departureDate = "لطفا تاریخ رفت را انتخاب کنید"
        }

        if (domesticFlightSearch.tripType === "roundtrip" && !domesticFlightSearch.returnDate) {
            newErrors.returnDate = "لطفا تاریخ برگشت را انتخاب کنید"
        }

        if (domesticFlightSearch.departureDate && domesticFlightSearch.returnDate) {
            const departure = new Date(domesticFlightSearch.departureDate)
            const returnDate = new Date(domesticFlightSearch.returnDate)
            if (returnDate < departure) {
                newErrors.returnDate = "تاریخ برگشت نمی‌تواند قبل از تاریخ رفت باشد"
            }
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSuggestionClick = (suggestion: DomesticSuggestion, field: "from" | "to") => {
        let displayValue = ""
        
        if (suggestion.type === 'airport') {
            displayValue = `${suggestion.city} (${suggestion.code}) - ${suggestion.name}`
        } else {
            displayValue = suggestion.name
        }
        
        
        setDomesticFlightSearch(prev => ({ 
            ...prev, 
            [field]: suggestion,
            [`display${field.charAt(0).toUpperCase() + field.slice(1)}`]: displayValue
        }))
        setShowSuggestions(false)
        setCurrentInput("")
        setIsFieldFocused("")
        
        // Clear error for this field
        setErrors(prev => ({ ...prev, [field]: undefined }))
    }

    const handleInputChange = (value: string, field: string) => {
        setCurrentInput(value)
        setCurrentField(field)
        setDomesticFlightSearch(prev => ({ 
            ...prev, 
            [`display${field.charAt(0).toUpperCase() + field.slice(1)}`]: value,
            [field]: null // Clear the selected suggestion when user types
        }))
        
        // Clear error when user starts typing
        if (errors[field as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [field]: undefined }))
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, field: "from" | "to") => {
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
                
                // Special validation for children - they must be less than adults
                if (type === 'children') {
                    // Children cannot be equal to or greater than adults
                    if (prev.children >= prev.adults) {
                        return prev; // Don't allow increment
                    }
                } else if (type === 'infants') {
                    // infants cannot be equal to or greater than adults
                    if (prev.infants >= prev.adults) {
                        return prev; // Don't allow increment
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

    // Map cabin class origin API cabin type
    const getCabinType = (cabinClass: string): string => {
        const cabinMap: { [key: string]: string } = {
            economy: "Y",
            business: "C",
            first: "F",
            premiumEconomy: "S",             // Premium Economy            
            premiumBussiness: "J",           // Premium Business              
            premiumFirst: "P"  
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
            const originCode = domesticFlightSearch.from?.code || ""
            const destinationCode = domesticFlightSearch.to?.code || ""
            const gregorianDepartureDate = shamsiToGregorianString(domesticFlightSearch.departureDate)
            
            // Prepare request body for Domestic API
            const requestBody = {
                airline: 'ZV',
                origin: originCode,
                destination: destinationCode,
                departureDate: domesticFlightSearch.departureDate,
                adults: domesticFlightSearch.adults,
                children: domesticFlightSearch.children
            }
            const partoRequestBody = {
                PricingSourceType: "All",
                RequestOption: "All",
                AdultCount: domesticFlightSearch.adults,
                ChildCount: domesticFlightSearch.children,
                InfantCount: domesticFlightSearch.infants,
                TravelPreference: {
                    CabinType: getCabinType(domesticFlightSearch.cabinClass),
                    MaxStopsQuantity: "All",
                    AirTripType: getAirTripType(domesticFlightSearch.tripType),
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

            if (domesticFlightSearch.tripType === "roundtrip" && domesticFlightSearch.returnDate) {
                const gregorianReturnDate = shamsiToGregorianString(domesticFlightSearch.returnDate)
                partoRequestBody.OriginDestinationInformations.push({
                    DepartureDateTime: `${gregorianReturnDate}T00:00:00.0000000+03:30`,
                    DestinationLocationCode: originCode,
                    DestinationType: 0,
                    OriginLocationCode: destinationCode,
                    OriginType: 0
                })
            }

            setFlightRequest(partoRequestBody)
            const partoResponse = await searchFlights(partoRequestBody)

            setFlightsData(partoResponse.PricedItineraries, "domestic", domesticFlightSearch.from?.city, domesticFlightSearch.to?.city)
            router.push('/flights')

        } catch (error) {
            console.error("Domestic flight search error:", error)
            setErrors(prev => ({ 
                ...prev, 
                general: "خطا در جستجوی پرواز داخلی. لطفا دوباره تلاش کنید." 
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
                className="absolute top-full right-0 left-0 bg-[#fffefe] border border-gray-300 shadow-lg z-50 max-h-80 overflow-y-auto mt-1"
            >
                {suggestions.map((suggestion, index) => (
                    <div
                        key={`${suggestion.id}-${index}`}
                        className={`p-3 cursor-pointer border-b border-gray-300 last:border-b-0 ${
                            index === activeSuggestionIndex 
                                ? 'bg-gray-100' 
                                : 'hover:bg-gray-50'
                        }`}
                        onMouseDown={(e) => {
                            e.preventDefault()
                            handleSuggestionClick(suggestion, field)
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    <span className="font-bold text-black">
                                        {suggestion.city}
                                    </span>
                                    <span className="text-blue-500 font-bold">({suggestion.code})</span>
                                </div>
                                <div className="text-sm text-black mt-1">
                                    {suggestion.name}
                                </div>
                                <div className="flex items-center gap-2 mt-1 justify-end">
                                    <span className="text-xs text-black">
                                        ایران
                                    </span>
                                    <span className="text-xs bg-gray-200 text-black px-2 py-1 font-medium border border-gray-300">
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
                className="absolute top-full right-0 left-0 bg-[#fffefe] border border-gray-300 shadow-lg z-50 p-4 mt-1"
            >
                <div className="space-y-4">
                    {/* Adults Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-black">بزرگسالان</div>
                            <div className="text-xs text-black mt-1">(12 سال به بالا)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePassengerChange('adults', 'decrement')}
                                disabled={domesticFlightSearch.adults <= 1}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-bold text-black min-w-6 text-center">
                                {domesticFlightSearch.adults}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('adults', 'increment')}
                                disabled={domesticFlightSearch.adults >= 9}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Children Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-black">کودکان</div>
                            <div className="text-xs text-black mt-1">(2 تا 12 سال)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePassengerChange('children', 'decrement')}
                                disabled={domesticFlightSearch.children <= 0}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-bold text-black min-w-6 text-center">
                                {domesticFlightSearch.children}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('children', 'increment')}
                                disabled={domesticFlightSearch.children >= 8}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Infants Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-black">نوزادان</div>
                            <div className="text-xs text-black mt-1">(زیر 2 سال)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePassengerChange('infants', 'decrement')}
                                disabled={domesticFlightSearch.infants <= 0}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-bold text-black min-w-6 text-center">
                                {domesticFlightSearch.infants}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('infants', 'increment')}
                                disabled={domesticFlightSearch.infants >= 4}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-black hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    const totalPassengers = domesticFlightSearch.adults + domesticFlightSearch.children + domesticFlightSearch.infants

    return (
        <div style={{direction:'rtl'}}>
            { loading && 
                <div className="w-full h-full fixed top-0 z-[9999999] right-0">
                    <div className="w-full h-full bg-black opacity-40 absolute z-[9999999]"></div>
                    <div className="w-full flex items-center justify-center h-screen z-[9999999] py-8 px-4 text-center my-auto top-0 bottom-0 absolute">
                        <div className="p-10 bg-white">
                            <span className="font-black text-2xl block bg-white p-10">
                                 در حال جستجو
                            </span>
                            <span className="font-black text-sm block bg-white p-10">
                                پرواز {domesticFlightSearch.from?.city} به مقصد {domesticFlightSearch.to?.city} 
                            </span>
                        </div>
                    </div>
                </div>
            }
            {/* General Error Display */}
            {errors.general && (
                <div className="mb-4 p-3 bg-red-500 border border-red-700 flex items-center gap-3">
                    <AlertCircle className="h-4 w-4 text-white flex-shrink-0" />
                    <p className="text-white text-sm font-medium">{errors.general}</p>
                </div>
            )}
            <div className="w-full flex gap-2">
                {/* Trip Type */}
                <div className="w-[150px]">
                    <Label htmlFor="domestic-flight-trip-type" className="text-black text-right block mb-2">نوع سفر</Label>
                    <div className="relative">
                        <select 
                            id="domestic-flight-trip-type"
                            className="w-full h-12 border rounded-full border-gray-300 bg-[#fffefe] text-black px-3 pr-10 appearance-none"
                            value={domesticFlightSearch.tripType}
                            onChange={(e) => setDomesticFlightSearch(prev => ({ ...prev, tripType: e.target.value }))}
                        >
                            <option value="oneway">یک طرفه</option>
                            <option value="roundtrip">رفت و برگشت</option>
                        </select>
                        <ChevronDown className="absolute left-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                </div>
                {/* Cabin Class */}
                <div className="w-[150px]">
                    <Label htmlFor="domestic-flight-cabin-class" className="text-black text-right block mb-2">کلاس پرواز</Label>
                    <div className="relative">
                        <select 
                            id="domestic-flight-cabin-class"
                            className="w-full rounded-full h-12 border border-gray-300 bg-[#fffefe] text-black px-3 pr-10 appearance-none"
                            value={domesticFlightSearch.cabinClass}
                            onChange={(e) => setDomesticFlightSearch(prev => ({ ...prev, cabinClass: e.target.value }))}
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
            <div className={`grid gap-4 md:grid-cols-2 relative pt-10 ${ domesticFlightSearch.tripType == "oneway" ? "lg:grid-cols-4" : " lg:grid-cols-5"}`}>
                {/* From Input */}
                <div className="space-y-2 col-span-1 relative">
                    <Label htmlFor="domestic-flight-origin" className="text-black text-right block">مبدا (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        {suggestionLoading && currentField === "from" && (
                            <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-blue-500" />
                        )}
                        <Input 
                            ref={fromInputRef}
                            id="domestic-flight-from" 
                            placeholder="نام فرودگاه، مثال: تهران (IKA)" 
                            className={`pr-10 h-12 border border-gray-300 bg-[#fffefe] text-black placeholder-gray-500 ${
                                errors.from 
                                    ? 'border-red-500 bg-red-500' 
                                    : 'border-gray-300'
                            }`}
                            value={domesticFlightSearch.displayFrom}
                            onChange={(e) => handleInputChange(e.target.value, "from")}
                            onKeyDown={(e) => handleKeyDown(e, "from")}
                            onFocus={() => {
                                setCurrentField("from")
                                setIsFieldFocused("from")
                                setShowSuggestions(suggestions.length > 0)
                            }}
                            onBlur={() => {
                                setIsFieldFocused("")
                                setTimeout(() => setShowSuggestions(false), 200)
                            }}
                            autoComplete="off"
                        />
                        {renderSuggestions("from")}
                        {renderError("from")}
                    </div>
                </div>
                
                {/* To Input */}
                <div className="space-y-2 col-span-1 relative">
                    <Label htmlFor="domestic-flight-destination" className="text-black text-right block">مقصد (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        {suggestionLoading && currentField === "to" && (
                            <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-blue-500" />
                        )}
                        <Input 
                            ref={toInputRef}
                            id="domestic-flight-destination" 
                            placeholder="نام فرودگاه مقصد مثال: مشهد (MHD)" 
                            className={`pr-10 h-12 border border-gray-300 bg-[#fffefe] text-black placeholder-gray-500 ${
                                errors.to 
                                    ? 'border-red-500 bg-red-500' 
                                    : 'border-gray-300'
                            }`}
                            value={domesticFlightSearch.displayTo}
                            onChange={(e) => handleInputChange(e.target.value, "to")}
                            onKeyDown={(e) => handleKeyDown(e, "to")}
                            onFocus={() => {
                                setCurrentField("to")
                                setIsFieldFocused("to")
                                setShowSuggestions(suggestions.length > 0)
                            }}
                            onBlur={() => {
                                setIsFieldFocused("")
                                setTimeout(() => setShowSuggestions(false), 200)
                            }}
                            autoComplete="off"
                        />
                        {renderSuggestions("to")}
                        {renderError("to")}
                    </div>
                </div>

                {/* Departure Date */}
                <div className="space-y-2 col-span-1 relative">
                    <Label htmlFor="domestic-flight-trip-type" className="text-black text-right block">تاریخ رفت</Label>
                    <ShamsiDateModal
                        calendarId="calendar1"
                        onOpenChange={setOpenCalendarId}
                        isOpen={openCalendarId === "calendar1"}
                        departureDate={domesticFlightSearch.departureDate}
                        calendarFor="FLIGHT"
                        origin={domesticFlightSearch.from?.code}
                        destination={domesticFlightSearch.to?.code}
                        returnDate={domesticFlightSearch.returnDate || ""}
                        tripType={domesticFlightSearch.tripType}
                        onDepartureDateChange={(date) => setDomesticFlightSearch(prev => ({ ...prev, departureDate: date }))}
                        onReturnDateChange={(date) => setDomesticFlightSearch(prev => ({ ...prev, returnDate: date }))}
                        onTripTypeChange={(type) => setDomesticFlightSearch(prev => ({ ...prev, tripType: type }))}
                        error={errors.departureDate}
                        errorColor="black"
                    />
                </div>

                {/* Return Date */}
                {domesticFlightSearch.tripType === "roundtrip" && (
                    <div className="space-y-2 col-span-1 relative">
                        <Label className="text-black text-right block">تاریخ برگشت</Label>
                        <div className="relative">
                            <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                            <ShamsiDateModal
                                calendarId="calendar2"
                                onOpenChange={setOpenCalendarId}
                                isOpen={openCalendarId === "calendar2"}
                                calendarFor="FLIGHT"
                                origin={domesticFlightSearch.from?.code}
                                destination={domesticFlightSearch.to?.code}
                                departureDate={domesticFlightSearch.departureDate}
                                returnDate={domesticFlightSearch.returnDate || ""}
                                tripType={domesticFlightSearch.tripType}
                                onDepartureDateChange={(date) => setDomesticFlightSearch(prev => ({ ...prev, departureDate: date }))}
                                onReturnDateChange={(date) => setDomesticFlightSearch(prev => ({ ...prev, returnDate: date }))}
                                onTripTypeChange={(type) => setDomesticFlightSearch(prev => ({ ...prev, tripType: type }))}
                                error={errors.departureDate}
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
                        <div className="relative h-12 border border-gray-300 bg-[#fffefe] hover:border-gray-400 flex items-center justify-between px-3">
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
                className="w-full h-12 bg-blue-500 text-white hover:bg-blue-900 mt-6"
                onClick={handleDomesticFlightSearch}
                disabled={isLoading}
            >
                <Search className="ml-2 h-4 w-4" />
                {isLoading ? "در حال جستجو..." : "جستجوی پرواز داخلی"}
            </Button>
        </div>
    )
}

export default DomesticFlightSearch