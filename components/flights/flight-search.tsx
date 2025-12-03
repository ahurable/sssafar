"use client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useFlight } from "@/contexts/search/FlightContext"
import { useSearch } from "@/hooks/use-search"
import { Search, Calendar, MapPin, ChevronDown, Loader2, Users, Baby, User, Plus, Minus, CalendarIcon, AlertCircle, RotateCcw, Heart, ArrowDownNarrowWide } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState, useRef } from "react"
import ShamsiDateModal from "./ShamsiCalendar"
import { formatShamsiDate } from "./utils"
import { shamsiToGregorianString } from "@/lib/jalaalil"
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExchange } from "@fortawesome/free-solid-svg-icons"

interface Suggestion {
    id: string
    name: string
    country: string
    code?: string
    city?: string
    showName?: string
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

// Favorite destinations data
const FAVORITE_DESTINATIONS: Suggestion[] = [
    {
        id: "IST",
        name: "فرودگاه بین‌المللی استانبول",
        country: "ترکیه",
        code: "IST",
        city: "استانبول",
        type: 'airport'
    },
    {
        id: "DXB",
        name: "فرودگاه بین‌المللی دبی",
        country: "امارات",
        code: "DXB",
        city: "دبی",
        type: 'airport'
    },
    {
        id: "IKA",
        name: "فرودگاه بین‌المللی امام خمینی",
        country: "ایران",
        code: "IKA",
        city: "تهران",
        type: 'airport'
    },
    {
        id: "THR",
        name: "فرودگاه بین‌المللی مهرآباد",
        country: "ایران",
        code: "THR",
        city: "تهران",
        type: 'airport'
    },
    {
        id: "MHD",
        name: "فرودگاه بین‌المللی شهید هاشمی نژاد",
        country: "ایران",
        code: "MHD",
        city: "مشهد",
        type: 'airport'
    },
    {
        id: "SYZ",
        name: "فرودگاه بین‌المللی شهید دستغیب",
        country: "ایران",
        code: "SYZ",
        city: "شیراز",
        type: 'airport'
    }
]

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
    const [showPassengers, setShowPassengers] = useState(false)
    const [showFavorites, setShowFavorites] = useState(false)
    const [favoriteField, setFavoriteField] = useState<"from" | "to" | null>(null)

    const { getCitySuggestions } = useSearch()
    const { searchFlights, setFlightsData, setFlightRequest, loading, origin, destination } = useFlight()

    const suggestionsRef = useRef<HTMLDivElement>(null)
    const passengersRef = useRef<HTMLDivElement>(null)
    const favoritesRef = useRef<HTMLDivElement>(null)
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

    // Handle click outside for suggestions, passengers popover, and favorites
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

            // Close favorites popover
            if (
                favoritesRef.current &&
                !favoritesRef.current.contains(event.target as Node) &&
                !(event.target as Element).closest('.favorites-trigger')
            ) {
                setShowFavorites(false)
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

    // Reverse from and to values
    const handleReverseLocations = () => {
        setFlightSearch(prev => ({
            ...prev,
            from: prev.to,
            to: prev.from,
            displayFrom: prev.displayTo,
            displayTo: prev.displayFrom
        }))

        // Clear any existing errors
        setErrors(prev => ({
            ...prev,
            from: undefined,
            to: undefined
        }))
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
        setShowFavorites(false)
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

        // Hide favorites when user starts typing
        if (showFavorites) {
            setShowFavorites(false)
        }

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
        if (field === "from") {
            setFlightSearch((prev: any) => ({ ...prev, displayFrom: "" }))
            setShowFavorites(true)
            setFavoriteField("from")
        }
        else {
            setFlightSearch((prev: any) => ({ ...prev, displayTo: "" }))
            setShowFavorites(true)
            setFavoriteField("to")
        }
        // Show favorites only if the field is empty and it's the first focus
        if (!flightSearch[`display${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Pick<FlightSearchState, 'displayFrom' | 'displayTo'>]) {
            setShowFavorites(true)
            setFavoriteField(field)
        }

        // Only show suggestions if there's text in the input
        if (flightSearch[`display${field.charAt(0).toUpperCase() + field.slice(1)}` as keyof Pick<FlightSearchState, 'displayFrom' | 'displayTo'>]) {
            setShowSuggestions(suggestions.length > 0)
        }
    }

    const handleBlur = () => {
        // Only blur if we're not clicking on suggestions
        setTimeout(() => {
            if (!showSuggestions && !showFavorites) {
                setIsFieldFocused("")
                setCurrentField("")
            }
        }, 100)
    }

    const handleFavoriteClick = (favorite: Suggestion, field: "from" | "to") => {
        handleSuggestionClick(favorite, field)
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
            <div className="flex items-center gap-2 mt-2 text-blue-950 text-sm">
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
                className="absolute top-full right-0 left-0 bg-[#fffefe] shadow-lg z-50 max-h-80 overflow-y-auto mt-1 rounded-md"
            >
                {suggestions.map((suggestion, index) => (
                    <div
                        key={`${suggestion.id}-${index}`}
                        className={`p-3 cursor-pointer last:border-b-0 ${index === activeSuggestionIndex
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
                                        <div className="flex items-center gap-2 justify-start">
                                            <span className="font-bold text-blue-950">
                                                {suggestion.showName || suggestion.city}
                                            </span>
                                            <span className="text-blue-500 font-bold">({suggestion.code})</span>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {suggestion.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 justify-start">
                                            <span className="text-xs text-gray-500">
                                                {suggestion.country}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-blue-900">
                                                فرودگاه
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-bold text-blue-950">
                                            {suggestion.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 justify-start">
                                            <span className="text-xs text-gray-500">
                                                {suggestion.country}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-blue-900">
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

    const renderFavorites = (field: "from" | "to") => {
        if (!showFavorites || favoriteField !== field || currentInput.length > 0) return null

        return (
            <div
                ref={favoritesRef}
                className="absolute top-full right-0 left-0 bg-[#fffefe] shadow-lg z-50 max-h-80 overflow-y-auto mt-1 rounded-md"
            >
                <div className="p-3 bg-gray-50">
                    <div className="flex items-center gap-2 justify-start">
                        <Heart className="h-4 w-4 text-red-500" />
                        <span className="font-bold text-blue-950">مقاصد محبوب</span>
                    </div>
                </div>
                {FAVORITE_DESTINATIONS.map((favorite, index) => (
                    <div
                        key={`${favorite.id}-${index}`}
                        className="p-3 cursor-pointer last:border-b-0 hover:bg-gray-50"
                        onMouseDown={(e) => {
                            e.preventDefault() // Prevent input blur
                            handleFavoriteClick(favorite, field)
                        }}
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1 text-right">
                                {favorite.type === 'airport' ? (
                                    <>
                                        <div className="flex items-center gap-2 justify-start">
                                            <span className="font-bold text-blue-950">
                                                {favorite.city}
                                            </span>
                                            <span className="text-blue-500 font-bold">({favorite.code})</span>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            {favorite.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 justify-start">
                                            <span className="text-xs text-gray-500">
                                                {favorite.country}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-blue-900">
                                                فرودگاه
                                            </span>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="font-bold text-blue-950">
                                            {favorite.name}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 justify-end">
                                            <span className="text-xs text-gray-500">
                                                {favorite.country}
                                            </span>
                                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded border border-blue-900">
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
                className="absolute top-full right-0 left-0 bg-[#fffefe] border border-blue-900 shadow-lg z-50 p-4 mt-1 rounded-md"
            >
                {loading &&
                    <div className="w-full h-full absolute top-0 right-0">
                        <div className="w-full h-full bg-black opacity-40 absolute z-[100000]"></div>
                        <div className="w-full flex items-center justify-center h-screen z-[100000] py-8 px-4 text-center my-auto top-0 bottom-0 absolute">
                            <span className="font-black text-2xl block bg-white p-10">
                                در حال جستجو
                            </span>
                            <span className="font-black text-sm block bg-white p-10">
                                پرواز ${origin} به مقصد ${destination}
                            </span>
                        </div>
                    </div>
                }
                <div className="space-y-4">
                    {/* Adults Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-blue-950">بزرگسالان</div>
                            <div className="text-xs text-gray-600 mt-1">(12 سال به بالا)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePassengerChange('adults', 'decrement')}
                                disabled={flightSearch.adults <= 1}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-bold text-blue-950 min-w-6 text-center">
                                {flightSearch.adults}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('adults', 'increment')}
                                disabled={flightSearch.adults >= 9}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Children Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-blue-950">کودکان</div>
                            <div className="text-xs text-gray-600 mt-1">(2 تا 12 سال)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePassengerChange('children', 'decrement')}
                                disabled={flightSearch.children <= 0}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-bold text-blue-950 min-w-6 text-center">
                                {flightSearch.children}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('children', 'increment')}
                                disabled={flightSearch.children >= 8}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Infants Selector */}
                    <div className="flex items-center justify-between">
                        <div className="text-right">
                            <div className="font-bold text-blue-950">نوزادان</div>
                            <div className="text-xs text-gray-600 mt-1">(زیر 2 سال)</div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => handlePassengerChange('infants', 'decrement')}
                                disabled={flightSearch.infants <= 0}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-lg font-bold text-blue-950 min-w-6 text-center">
                                {flightSearch.infants}
                            </span>
                            <button
                                onClick={() => handlePassengerChange('infants', 'increment')}
                                disabled={flightSearch.infants >= 4}
                                className="flex items-center justify-center w-8 h-8 bg-gray-200 text-blue-950 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 rounded"
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
        <div style={{ direction: 'rtl' }}>
            {loading &&
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full fixed top-0 z-[9999999] right-0"
                    >
                        <div className="w-full h-full bg-black opacity-40 absolute z-[9999999]"></div>
                        <div className="w-full flex items-center justify-center h-screen z-[9999999] py-8 px-4 text-center my-auto top-0 bottom-0 absolute">
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", duration: 0.5 }}
                                className="p-8 bg-white rounded-2xl shadow-2xl max-w-md mx-auto"
                            >
                                {/* Airplane Animation */}
                                <motion.div
                                    animate={{
                                        x: [-20, 20, -20],
                                        y: [0, -10, 0],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        ease: "easeInOut"
                                    }}
                                    className="text-4xl mb-6"
                                >
                                    ✈️
                                </motion.div>

                                {/* Pulsing dots */}
                                <div className="flex justify-center space-x-1 mb-6">
                                    {[0, 1, 2].map((index) => (
                                        <motion.div
                                            key={index}
                                            className="w-2 h-2 bg-blue-500 rounded-full"
                                            animate={{
                                                scale: [1, 1.5, 1],
                                                opacity: [0.5, 1, 0.5],
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                delay: index * 0.2,
                                            }}
                                        />
                                    ))}
                                </div>

                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                    className="font-black text-2xl block text-gray-800 mb-2"
                                >
                                    در حال جستجو
                                </motion.span>
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                    className="font-medium text-sm block text-gray-600"
                                >
                                    پرواز {flightSearch.from?.city} به مقصد {flightSearch.to?.city}
                                </motion.span>
                            </motion.div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            }
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
                    <Label htmlFor="flight-trip-type" className="text-blue-950 text-right block mb-2">نوع سفر</Label>
                    <div className="relative">
                        <select
                            id="flight-trip-type"
                            className="w-full h-12 border rounded-full border-blue-900 bg-[#fffefe] text-blue-950 px-3 pr-10 appearance-none focus:outline-none focus:border-blue-500"
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
                    <Label htmlFor="flight-cabin-class" className="text-blue-950 text-right block mb-2">کلاس پرواز</Label>
                    <div className="relative">
                        <select
                            id="flight-cabin-class"
                            className="w-full rounded-full h-12 border border-blue-900 bg-[#fffefe] text-blue-950 px-3 pr-10 appearance-none focus:outline-none focus:border-blue-500"
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

            {/* Responsive Grid Layout - UPDATED WITH DOMESTIC FLIGHT SEARCH GRID FUNCTIONALITY */}
            <div className={`grid gap-4 md:grid-cols-2 relative pt-10 ${flightSearch.tripType === "oneway" ? "lg:grid-cols-4" : "lg:grid-cols-5"}`}>
                {/* From Input */}
                <div className="space-y-2 col-span-1 relative">
                    <Label htmlFor="flight-from" className="text-blue-950 text-right block">مبدا (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        {suggestionLoading && currentField === "from" && (
                            <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-blue-500" />
                        )}
                        <Input
                            ref={fromInputRef}
                            id="flight-from"
                            placeholder="نام فرودگاه، مثال: تهران (IKA)"
                            className={`pr-10 h-12 border bg-[#fffefe] text-blue-950 placeholder-gray-500 focus:outline-none ${errors.from
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-blue-900 focus:border-blue-500'
                                }`}
                            value={flightSearch.displayFrom}
                            onChange={(e) => handleInputChange(e.target.value, "from")}
                            onKeyDown={(e) => handleKeyDown(e, "from")}
                            onFocus={() => handleFocus("from")}
                            onBlur={handleBlur}
                            autoComplete="off"
                        />
                        {renderSuggestions("from")}
                        {renderFavorites("from")}
                        {renderError("from")}
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="h-12 w-12 rounded-full border-2 
                            border-blue-900 bg-white hover:border-blue-500 
                            hover:bg-blue-50 hover:text-blue-600 transition-all 
                            duration-200 transform md:top-0 md:left-[-31px] md:scale-75 top-[43px] left-0
                            scale-100
                            absolute z-10"
                            onClick={handleReverseLocations}
                            title="جابجایی مبدا و مقصد"
                        >
                            <FontAwesomeIcon icon={faExchange} className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                {/* To Input */}
                <div className="space-y-2 col-span-1 relative">
                    <Label htmlFor="flight-to" className="text-blue-950 text-right block">مقصد (فرودگاه)</Label>
                    <div className="relative">
                        <MapPin className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        {suggestionLoading && currentField === "to" && (
                            <Loader2 className="absolute left-3 top-3 h-4 w-4 animate-spin text-blue-500" />
                        )}
                        <Input
                            ref={toInputRef}
                            id="flight-to"
                            placeholder="نام فرودگاه مقصد مثال: استانبول (IST)"
                            className={`pr-10 h-12 border bg-[#fffefe] text-blue-950 placeholder-gray-500 focus:outline-none ${errors.to
                                ? 'border-red-500 focus:border-red-500'
                                : 'border-blue-900 focus:border-blue-500'
                                }`}
                            value={flightSearch.displayTo}
                            onChange={(e) => handleInputChange(e.target.value, "to")}
                            onKeyDown={(e) => handleKeyDown(e, "to")}
                            onFocus={() => handleFocus("to")}
                            onBlur={handleBlur}
                            autoComplete="off"
                        />
                        {renderSuggestions("to")}
                        {renderFavorites("to")}
                        {renderError("to")}
                    </div>
                </div>

                {/* Departure Date */}
                <div className="space-y-2 col-span-1 relative">
                    <Label className="text-blue-950 text-right block">تاریخ رفت</Label>
                    <div className="relative">
                        <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                        <ShamsiDateModal
                            calendarId="calendar1"
                            onOpenChange={setOpenCalendarId}
                            isOpen={openCalendarId === "calendar1"}
                            departureDate={flightSearch.departureDate}
                            returnDate={flightSearch.returnDate || ""}
                            tripType={flightSearch.tripType}
                            origin={flightSearch.from?.code}
                            destination={flightSearch.to?.code}
                            onDepartureDateChange={(date) => setFlightSearch(prev => ({ ...prev, departureDate: date }))}
                            onReturnDateChange={(date) => setFlightSearch(prev => ({ ...prev, returnDate: date }))}
                            onTripTypeChange={(type) => setFlightSearch(prev => ({ ...prev, tripType: type }))}
                            error={errors.departureDate}
                            errorColor="black"
                        />
                    </div>
                </div>

                {/* Return Date */}
                {flightSearch.tripType === "roundtrip" && (
                    <div className="space-y-2 col-span-1 relative">
                        <Label className="text-blue-950 text-right block">تاریخ برگشت</Label>
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
                    <Label className="text-blue-950 text-right block">مسافران</Label>
                    <div
                        className="passengers-trigger cursor-pointer"
                        onClick={() => setShowPassengers(!showPassengers)}
                    >
                        <div className={`relative h-12 border rounded-lg bg-[#fffefe] hover:border-gray-400 flex items-center justify-between px-3 ${showPassengers ? 'border-blue-500' : 'border-blue-900'
                            }`}>
                            <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-gray-400" />
                                <User className="h-4 w-4 text-gray-400" />
                                <Baby className="h-4 w-4 text-gray-400" />
                            </div>
                            <div className="text-right">
                                <div className="text-blue-950 text-sm font-medium">
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