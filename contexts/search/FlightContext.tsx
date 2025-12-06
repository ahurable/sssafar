// contexts/flight-context.tsx
"use client"

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react'
import { read, utils } from 'xlsx'

export interface TravelPreference {
  CabinType: string;
  MaxStopsQuantity: string;
  AirTripType: string;
  VendorExcludeCodes: string[];
  VendorPreferenceCodes: string[];
}

export interface OriginDestinationInformation {
  DepartureDateTime: string;
  DestinationLocationCode: string;
  DestinationType: number;
  OriginLocationCode: string;
  OriginType: number;
}

export interface FlightSearchRequest {
  PricingSourceType: string;
  RequestOption: string;
  AdultCount: number;
  ChildCount: number;
  InfantCount: number;
  TravelPreference: TravelPreference;
  OriginDestinationInformations: OriginDestinationInformation[];
  IsGenuine: boolean;
}

export interface DomesticFlightSearchRequest {
  airline: string
  origin: string
  destination: string
  departureDate: string // Format: YYYY-MM-DD
  adults: number
  children?: number
  infants?: number
}

interface FilterState {
  priceRange: [number, number]
  airlines: string[]
  flightClasses: string[]
  flightTimes: {
    origin: string[]
    destination: string[]
  }
  stops: {
    origin: string[]
    destination: string[]
  }
  baggage: {
    origin: string[]
    destination: string[]
  }
  airports: {
    origin: string[]
    destination: string[]
  }
  duration: {
    origin: [number, number]
    destination: [number, number]
  }
}

interface FlightContextType {
  flightData: any[]
  setFlightsData: (flights: any, area: string, from?: string, to?: string) => void
  loading: boolean
  origin: string
  destination: string
  searchFlights: (params: any) => any
  clearResults: () => void
  airlineNames: { [iata: string]: string }
  getAirlineName: (iataCode: string) => string
  applyFilters: (filters: FilterState) => void
  filteredFlights: any[]
  flightRequest: FlightSearchRequest
  setFlightRequest: (request: FlightSearchRequest) => void
  domesticFlightRequest: DomesticFlightSearchRequest
  setDomesticFlightRequest: (request: DomesticFlightSearchRequest) => void
  searchDomesticFlights: (params: any) => void
  area: string
  isRoundtrip: boolean
}

// Helper functions
export const getCabinType = (cabinClass: string): string => {
  const cabinMap: { [key: string]: string } = {
    "economy": "Economy",
    "business": "Business",
    "first": "First",
    "premium": "PremiumEconomy"
  };
  return cabinMap[cabinClass] || "Economy";
}

export const getAirTripType = (tripType: string): string => {
  const tripMap: { [key: string]: string } = {
    "oneway": "OneWay",
    "roundtrip": "RoundTrip",
    "multicity": "MultiCity"
  };
  return tripMap[tripType] || "OneWay";
}

async function loadAirlinesFromXLSX(): Promise<{ [iata: string]: string }> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const fileUrl = `${baseUrl}/data/Airline.xlsx`

    const response = await fetch(fileUrl, {
      cache: 'force-cache',
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch Airlines XLSX file from ${fileUrl}`)
    }

    const arrayBuffer = await response.arrayBuffer()

    if (arrayBuffer.byteLength === 0) {
      throw new Error('Airlines file is empty (0 bytes)')
    }

    const workbook = read(arrayBuffer, { type: 'array' })

    if (workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Airlines XLSX file')
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = utils.sheet_to_json(worksheet)

    const columnNames = Object.keys(data[0] || {})

    const iataColumn = columnNames.find(col =>
      col.toLowerCase().includes('iata') ||
      col.toLowerCase().includes('code') ||
      col.toLowerCase().includes('airline code')
    )
    const nameColumn = columnNames.find(col =>
      col.toLowerCase().includes('name') ||
      col.toLowerCase().includes('airline') ||
      col.toLowerCase().includes('airline name')
    )

    const airlineMap: { [iata: string]: string } = {}

    data.forEach((row: any) => {
      const iata = iataColumn ? row[iataColumn] : row[columnNames[0]]
      const name = nameColumn ? row[nameColumn] : row[columnNames[1]]

      if (iata && name) {
        const iataCode = iata.toString().trim().toUpperCase()
        const airlineName = name.toString().trim()

        if (iataCode && airlineName && iataCode.length === 2) {
          airlineMap[iataCode] = airlineName
        }
      }
    })

    return airlineMap

  } catch (error) {
    console.error('❌ Error loading airlines XLSX file:', error)
    const fallbackAirlines: { [iata: string]: string } = {
      "EK": "امارات",
      "QR": "قطر ایرویز",
      "EY": "اتیهاد ایرویز",
      "TK": "ترکیش ایرلاینز",
      "LH": "لوفت هانزا",
      "BA": "بریتیش ایرویز",
      "AF": "ایر فرانس",
      "KL": "کی ال ام",
      "LX": "سوئیس اینترنشنال",
      "OS": "آسترین ایرلاینز",
      "OV": "سلام ایر",
      "W5": "ماهان ایر",
      "IR": "ایران ایر",
      "ZV": "قشم ایر",
      "I3": "آتا ایر",
      "JB": "آسمان ایر",
      "FZ": "فلای دبی",
      "PC": "پگاسوس ایرلاینز",
      "WY": "عمان ایر",
      "SV": "سعودیا",
      "HH": "هواپیمایی هما"
    }
    return fallbackAirlines
  }
}

const FlightContext = createContext<FlightContextType | undefined>(undefined)

export function FlightProvider({ children }: { children: ReactNode }) {
  const [flightData, setFlightData] = useState<any[]>([])
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [area, setArea] = useState("")
  const [loading, setLoading] = useState(false)
  const [airlineNames, setAirlineNames] = useState<{ [iata: string]: string }>({})
  const [filteredFlights, setFilteredFlights] = useState<any[]>([])
  const [flightRequest, setFlightRequest] = useState<FlightSearchRequest>({
    PricingSourceType: "All",
    RequestOption: "All",
    AdultCount: 1,
    ChildCount: 0,
    InfantCount: 0,
    TravelPreference: {
      CabinType: getCabinType("economy"),
      MaxStopsQuantity: "All",
      AirTripType: getAirTripType("oneway"),
      VendorExcludeCodes: [],
      VendorPreferenceCodes: []
    },
    OriginDestinationInformations: [
      {
        DepartureDateTime: "2024-01-15T00:00:00.0000000+03:30",
        DestinationLocationCode: "THR",
        DestinationType: 0,
        OriginLocationCode: "IKA",
        OriginType: 0
      }
    ],
    IsGenuine: false
  })
  const [domesticFlightRequest, setDomesticFlightRequest] = useState<DomesticFlightSearchRequest>({
    airline: 'ZV',
    origin: '',
    destination: '',
    adults: 1,
    departureDate: ''
  })

  // Load airlines on component mount
  useEffect(() => {
    const loadAirlines = async () => {
      try {
        const airlines = await loadAirlinesFromXLSX()
        setAirlineNames(airlines)
      } catch (error) {
        console.error('Failed to load airlines:', error)
      }
    }

    loadAirlines()
  }, [])

  const getAirlineName = useCallback((iataCode: string): string => {
    if (!iataCode) return 'نامشخص'

    const normalizedCode = iataCode.trim().toUpperCase()
    return airlineNames[normalizedCode] || normalizedCode
  }, [airlineNames])

  // Check if flight data is roundtrip
  const isRoundtrip = flightData.some(flight =>
    flight.OriginDestinationOptions?.length > 1
  )

  // Helper function to get time range
  const getTimeRange = useCallback((timeString: string) => {
    if (!timeString) return ""
    try {
      const time = new Date(timeString).getHours()
      if (time >= 6 && time < 12) return "صبح (۶-۱۲)"
      if (time >= 12 && time < 18) return "ظهر (۱۲-۱۸)"
      if (time >= 18 && time < 24) return "عصر (۱۸-۲۴)"
      return "شب (۰-۶)"
    } catch {
      return ""
    }
  }, [])

  // Helper function to get cabin class name from code
  const getCabinClassName = useCallback((cabinCode: number) => {
    switch (cabinCode) {
      case 1: return "economy"
      case 2: return "business"
      case 3: return "first"
      case 4: return "premium"
      case 5: return "economy"
      default: return "economy"
    }
  }, [])

  // Apply filters function
  const applyFilters = useCallback((filters: FilterState) => {
    const filtered = flightData.filter(flight => {
      // Price filter
      const price = flight.AirItineraryPricingInfo.ItinTotalFare.TotalFare / 10
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
        return false
      }

      // Airline filter
      if (filters.airlines.length > 0) {
        const airlineName = getAirlineName(flight.ValidatingAirlineCode)
        if (!filters.airlines.includes(airlineName)) {
          return false
        }
      }

      // Flight class filter
      if (filters.flightClasses.length > 0) {
        const hasMatchingClass = flight.OriginDestinationOptions?.some((option: any) =>
          option.FlightSegments?.some((segment: any) => {
            const className = getCabinClassName(segment.CabinClassCode)
            return filters.flightClasses.includes(className)
          })
        )
        if (!hasMatchingClass) {
          return false
        }
      }

      // Flight time filters
      let flightTimeValid = true
      flight.OriginDestinationOptions?.forEach((option: any, index: number) => {
        const segmentType = index === 0 ? 'origin' : 'destination'
        if (option.FlightSegments?.length > 0) {
          const departureTime = option.FlightSegments[0].DepartureDateTime
          const timeRange = getTimeRange(departureTime)
          if (filters.flightTimes[segmentType].length > 0 && !filters.flightTimes[segmentType].includes(timeRange)) {
            flightTimeValid = false
          }
        }
      })
      if (!flightTimeValid) return false

      // Stops filters
      let stopsValid = true
      flight.OriginDestinationOptions?.forEach((option: any, index: number) => {
        const segmentType = index === 0 ? 'origin' : 'destination'
        if (option.FlightSegments) {
          const stopCount = option.FlightSegments.length - 1
          const stopKey = stopCount === 0 ? "direct" :
            stopCount === 1 ? "1-stop" : "2-stops+"
          if (filters.stops[segmentType].length > 0 && !filters.stops[segmentType].includes(stopKey)) {
            stopsValid = false
          }
        }
      })
      if (!stopsValid) return false

      // Baggage filters
      let baggageValid = true
      flight.OriginDestinationOptions?.forEach((option: any, index: number) => {
        const segmentType = index === 0 ? 'origin' : 'destination'
        if (option.FlightSegments) {
          const hasMatchingBaggage = option.FlightSegments.some((segment: any) => {
            if (!segment.Baggage) return false
            return filters.baggage[segmentType].includes(segment.Baggage)
          })
          if (filters.baggage[segmentType].length > 0 && !hasMatchingBaggage) {
            baggageValid = false
          }
        }
      })
      if (!baggageValid) return false

      // Airport filters
      let airportValid = true
      flight.OriginDestinationOptions?.forEach((option: any, index: number) => {
        const segmentType = index === 0 ? 'origin' : 'destination'
        if (option.FlightSegments) {
          const hasMatchingAirport = option.FlightSegments.some((segment: any) => {
            return filters.airports[segmentType].includes(segment.DepartureAirportLocationCode) ||
              filters.airports[segmentType].includes(segment.ArrivalAirportLocationCode)
          })
          if (filters.airports[segmentType].length > 0 && !hasMatchingAirport) {
            airportValid = false
          }
        }
      })
      if (!airportValid) return false

      // Duration filters
      let durationValid = true
      flight.OriginDestinationOptions?.forEach((option: any, index: number) => {
        const segmentType = index === 0 ? 'origin' : 'destination'
        const totalDuration = option.JourneyDurationPerMinute ||
          option.FlightSegments?.reduce((sum: number, seg: any) => sum + (seg.JourneyDurationPerMinute || 0), 0) || 0

        if (totalDuration < filters.duration[segmentType][0] || totalDuration > filters.duration[segmentType][1]) {
          durationValid = false
        }
      })
      if (!durationValid) return false

      return true
    })

    setFilteredFlights(filtered)
  }, [flightData, getAirlineName, getCabinClassName, getTimeRange])

  // Update filtered flights when flight data changes
  useEffect(() => {
    setFilteredFlights(flightData)
  }, [flightData])

  const clearResults = () => {
    setFlightData([])
    setFilteredFlights([])
  }

  const searchFlights = async (params: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!response.ok) throw new Error('Flight search failed')
      return await response.json()
    } finally {
      setLoading(false)
    }
  }

  const searchDomesticFlights = async (params: any) => {
    try {
      setLoading(true)
      const response = await fetch('/api/flights/search/nira',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(params)
        }
      )
      const data = await response.json()
      if (!response.ok)
        return data
      return data
    } finally {
      setLoading(false)
    }
  }

  const setFlightsData = (flights: any, area: string, from?: string, to?: string) => {
    setFlightData(flights)
    setFilteredFlights(flights)
    setArea(area)
    if (from)
      setOrigin(from)
    if (to)
      setDestination(to)
    setLoading(false)
  }

  return (
    <FlightContext.Provider value={{
      flightData,
      setFlightsData,
      filteredFlights,
      searchFlights,
      origin,
      destination,
      loading,
      clearResults,
      airlineNames,
      getAirlineName,
      applyFilters,
      flightRequest,
      setFlightRequest,
      setDomesticFlightRequest,
      domesticFlightRequest,
      searchDomesticFlights,
      area,
      isRoundtrip
    }}>
      {children}
    </FlightContext.Provider>
  )
}

export function useFlight() {
  const context = useContext(FlightContext)
  if (context === undefined) {
    throw new Error('useFlight must be used within a FlightProvider')
  }
  return context
}