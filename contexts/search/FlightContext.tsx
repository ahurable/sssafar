// contexts/flight-context.tsx
"use client"

import { StdioNull } from 'node:child_process'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { read, utils } from 'xlsx'

interface FlightSearchParams {
  OriginDestinationInformations: Array<{
    DepartureDateTime: string
    OriginLocationCode: string
    DestinationLocationCode: string
  }>
  AdultCount: number
  ChildCount: number
  InfantCount: number
  TravelPreference?: {
    CabinType: string
    MaxStopsQuantity: string
    AirTripType: string
  }
}

interface FilterState {
  priceRange: [number, number]
  airlines: string[]
  flightClasses: string[]
  flightTimes: string[]
  stops: string[]
}

interface FlightContextType {
  flightData: any[]
  setFlightsData: (flights:any) => void
  loading: boolean
  searchFlights: (params: any) => any
  clearResults: () => void
  airlineNames: { [iata: string]: string }
  getAirlineName: (iataCode: string) => string 
  applyFilters: (filters: FilterState) => void
  filteredFlights: any[]
}


async function loadAirlinesFromXLSX(): Promise<{ [iata: string]: string }> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const fileUrl = `${baseUrl}/data/Airline.xlsx`
    
    console.log('🔍 Attempting to fetch airlines file from:', fileUrl)
    
    const response = await fetch(fileUrl, {
      cache: 'force-cache',
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    })
    
    console.log('📄 Airlines response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch Airlines XLSX file from ${fileUrl}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('📦 Airlines file size (bytes):', arrayBuffer.byteLength)
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('Airlines file is empty (0 bytes)')
    }

    // Parse the XLSX file
    const workbook = read(arrayBuffer, { type: 'array' })
    console.log('📋 Airlines sheet names:', workbook.SheetNames)
    
    if (workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Airlines XLSX file')
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = utils.sheet_to_json(worksheet)
    
    console.log('📊 Total rows in airlines sheet:', data.length)
    
    if (data.length === 0) {
      throw new Error('No data found in airlines sheet')
    }

    // Log the first row to see column names
    console.log('🔍 Airlines first row sample:', data[0])
    const columnNames = Object.keys(data[0] || {})
    console.log('🔍 Airlines column names:', columnNames)
    
    // Find the correct column names for IATA code and airline name
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

    console.log('🔍 Detected airlines columns:', {
      iata: iataColumn,
      name: nameColumn
    })

    const airlineMap: { [iata: string]: string } = {}

    data.forEach((row: any, index: number) => {
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

    console.log(`✅ Successfully loaded ${Object.keys(airlineMap).length} airlines from XLSX`)
    console.log('📝 Sample airlines:', Object.entries(airlineMap).slice(0, 5))
    
    return airlineMap

  } catch (error) {
    console.error('❌ Error loading airlines XLSX file:', error)
    // Return a fallback map with common airlines
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
      "SV": "سعودیا"
    }
    console.log('🔄 Using fallback airlines data')
    return fallbackAirlines
  }
}


const FlightContext = createContext<FlightContextType | undefined>(undefined)

export function FlightProvider({ children }: { children: ReactNode }) {
  const [flightData, setFlightData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [airlineNames, setAirlineNames] = useState<{ [iata: string]: string }>({}) // Add this
  const [filteredFlights, setFilteredFlights] = useState<any[]>([])
  
  const getTimeRange = (timeString: string) => {
    const time = new Date(timeString).getHours()
    if (time >= 6 && time < 12) return "صبح (۶-۱۲)"
    if (time >= 12 && time < 18) return "ظهر (۱۲-۱۸)"
    if (time >= 18 && time < 24) return "عصر (۱۸-۲۴)"
    return "شب (۰-۶)"
  }

  const applyFilters = (filters: FilterState) => {

    const filtered = flightData.filter(flight => {
        // Price filter
            const price = flight.AirItineraryPricingInfo.ItinTotalFare.TotalFare / 10 // Convert to Toman
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

            // Flight time filter
            if (filters.flightTimes.length > 0) {
            const departureTime = flight.OriginDestinationOptions[0]?.FlightSegments[0]?.DepartureDateTime
            const timeRange = getTimeRange(departureTime)
            if (!filters.flightTimes.includes(timeRange)) {
                return false
            }
            }

            // Stops filter
            if (filters.stops.length > 0) {
            const stopsCount = flight.OriginDestinationOptions[0]?.FlightSegments?.length - 1
            const stopType = stopsCount === 0 ? "direct" : 
                            stopsCount === 1 ? "1-stop" : "2-stops"
            if (!filters.stops.includes(stopType)) {
                return false
            }
            }

            return true
        })
        console.log(filtered)

      setFilteredFlights(filtered)
    }

    // Update when new flight data arrives
    useEffect(() => {
        setFilteredFlights(flightData)
    }, [flightData])

  // Load airlines on component mount
  useEffect(() => {
    const loadAirlines = async () => {
      try {
        const airlines = await loadAirlinesFromXLSX()
        console.log(airlines)
        setAirlineNames(airlines)
      } catch (error) {
        console.error('Failed to load airlines:', error)
      }
    }
    
    loadAirlines()
  }, [])

  const getAirlineName = (iataCode: string): string => {
    if (!iataCode) return 'نامشخص'
    
    const normalizedCode = iataCode.trim().toUpperCase()
    console.log(normalizedCode)
    return airlineNames[normalizedCode] || normalizedCode
  }

  const clearResults = () => {
    setFlightData([])
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

  const setFlightsData = (flights:any) => {
    setFlightData(flights)
    setLoading(false)
  }

  return (
    <FlightContext.Provider value={{
      flightData,
      setFlightsData,
      filteredFlights,
      searchFlights,
      loading,
      clearResults,
      airlineNames,
      getAirlineName,
      applyFilters
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