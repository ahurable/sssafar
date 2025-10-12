// contexts/hotel-context.tsx
"use client"

import { StdioNull } from 'node:child_process'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { read, utils } from 'xlsx'

interface HotelSearchParams {
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

interface City {
  iata: string
  name: string
  city: string
}

interface FilterState {
  priceRange: [number, number]
  cities: string[]
  hotelClasses: string[]
  hotelTimes: string[]
  stops: string[]
}

interface HotelContextType {
  hotelData: any[]
  setHotelsData: (hotels:any) => void
  loading: boolean
  searchHotels: (params: any) => any
  clearResults: () => void
  airlineNames: { [iata: string]: string }
//   getAirlineName: (iataCode: string) => string 
  applyFilters: (filters: FilterState) => void
  filteredHotels: any[]
  handleSuggestions: (query: string) => Promise<City[] | null>
}


async function loadAirlinesFromXLSX(): Promise<{ [iata: string]: string }> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const fileUrl = `${baseUrl}/data/City.xlsx`
    
    console.log('🔍 Attempting to fetch cities file from:', fileUrl)
    
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
    
    console.log('📊 Total rows in cities sheet:', data.length)
    
    if (data.length === 0) {
      throw new Error('No data found in cities sheet')
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

    console.log('🔍 Detected cities columns:', {
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

    console.log(`✅ Successfully loaded ${Object.keys(airlineMap).length} cities from XLSX`)
    console.log('📝 Sample cities:', Object.entries(airlineMap).slice(0, 5))
    
    return airlineMap

  } catch (error) {
    console.error('❌ Error loading cities XLSX file:', error)
    // Return a fallback map with common cities
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
    console.log('🔄 Using fallback cities data')
    return fallbackAirlines
  }
}

const suggestCity = async (query:string) => {
    try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const fileUrl = `${baseUrl}/data/City.xlsx`
    
    console.log('🔍 Attempting to fetch cities file from:', fileUrl)
    
    const response = await fetch(fileUrl, {
      cache: 'force-cache',
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    })
    
    console.log('📄 cities response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch Airlines XLSX file from ${fileUrl}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    console.log('📦 cities file size (bytes):', arrayBuffer.byteLength)
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('cities file is empty (0 bytes)')
    }

    // Parse the XLSX file
    const workbook = read(arrayBuffer, { type: 'array' })
    console.log('📋 cities sheet names:', workbook.SheetNames)
    
    if (workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in Airlines XLSX file')
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = utils.sheet_to_json(worksheet)
    
    console.log('📊 Total rows in cities sheet:', data.length)
    
    if (data.length === 0) {
      throw new Error('No data found in cities sheet')
    }

    // Log the first row to see column names
    console.log('🔍 Cities first row sample:', data[0])
    const columnNames = Object.keys(data[0] || {})
    console.log('🔍 Cities column names:', columnNames)
    
    // Find the correct column names for IATA code and airline name
    const iataColumn = columnNames.find(col => 
      col.toLowerCase().includes('iata')
    )
    const nameColumn = columnNames.find(col => 
      col.toLowerCase().includes('name')
    )
    const cityColumn = columnNames.find(col => 
        col.toLowerCase().includes('city')
    )
    console.log('🔍 Detected cities columns:', {
      iata: iataColumn,
      name: nameColumn,
      city: cityColumn
    })

    const cities: City[] = data.map((row: any, index: number) => {
      // Use detected columns or fallback to first columns
      const iata = iataColumn ? row[iataColumn] : row[columnNames[0]]
      const name = nameColumn ? row[nameColumn] : row[columnNames[1]] 
      const city = cityColumn ? row[cityColumn] : row[columnNames[2]]

      return {
        iata: (iata || '').toString().trim(),
        name: (name || '').toString().trim(),
        city: (city || '').toString().trim()
      }
    }).filter(city => city.iata && city.name && city.city)

    console.log(`✅ Successfully loaded ${cities.length} airports from XLSX`)
    console.log('📝 First 3 cities:', cities.slice(0, 3))
    
    const suggestions = cities.filter(city => 
        city.name.includes(query)
    )
    console.log(suggestions)
    return suggestions

  } catch (error) {
    console.error('❌ Error loading cities XLSX file:', error)
    // Return a fallback map with common cities

    console.log('🔄 Using fallback cities data')
    return null
  }
}


const HotelContext = createContext<HotelContextType | undefined>(undefined)

export function HotelProvider({ children }: { children: ReactNode }) {
  const [hotelData, setHotelData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [airlineNames, setAirlineNames] = useState<{ [iata: string]: string }>({}) // Add this
  const [filteredHotels, setFilteredHotels] = useState<any[]>([])
  
  const getTimeRange = (timeString: string) => {
    const time = new Date(timeString).getHours()
    if (time >= 6 && time < 12) return "صبح (۶-۱۲)"
    if (time >= 12 && time < 18) return "ظهر (۱۲-۱۸)"
    if (time >= 18 && time < 24) return "عصر (۱۸-۲۴)"
    return "شب (۰-۶)"
  }

  const handleSuggestions = async (query: string) => await suggestCity(query)

  const applyFilters = (filters: FilterState) => {

    const filtered = hotelData.filter(hotel => {
        // Price filter
            const price = hotel.AirItineraryPricingInfo.ItinTotalFare.TotalFare / 10 // Convert to Toman
            if (price < filters.priceRange[0] || price > filters.priceRange[1]) {
            return false
            }

            // Airline filter
            if (filters.cities.length > 0) {
            // const airlineName = getCity(hotel.ValidatingAirlineCode)
            // if (!filters.cities.includes(airlineName)) {
            //     return false
            // }
            }

            // Hotel time filter
            if (filters.hotelTimes.length > 0) {
            const departureTime = hotel.OriginDestinationOptions[0]?.HotelSegments[0]?.DepartureDateTime
            const timeRange = getTimeRange(departureTime)
            if (!filters.hotelTimes.includes(timeRange)) {
                return false
            }
            }

            // Stops filter
            if (filters.stops.length > 0) {
            const stopsCount = hotel.OriginDestinationOptions[0]?.HotelSegments?.length - 1
            const stopType = stopsCount === 0 ? "direct" : 
                            stopsCount === 1 ? "1-stop" : "2-stops"
            if (!filters.stops.includes(stopType)) {
                return false
            }
            }

            return true
        })
        console.log(filtered)

      setFilteredHotels(filtered)
    }

    // Update when new hotel data arrives
    useEffect(() => {
        setFilteredHotels(hotelData)
    }, [hotelData])

  // Load cities on component mount
  useEffect(() => {
    const loadHotels = async () => {
      try {
        const cities = await loadAirlinesFromXLSX()
        console.log(cities)
        setAirlineNames(cities)
      } catch (error) {
        console.error('Failed to load cities:', error)
      }
    }
    
    loadHotels()
  }, [])

  const getHotelName = (iataCode: string): string => {
    if (!iataCode) return 'نامشخص'
    
    const normalizedCode = iataCode.trim().toUpperCase()
    console.log(normalizedCode)
    return airlineNames[normalizedCode] || normalizedCode
  }

  const clearResults = () => {
    setHotelData([])
  }

  const searchHotels = async (params: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!response.ok) throw new Error('Hotel search failed')
      return await response.json()
    } finally {
      setLoading(false)
    }
  }

  const setHotelsData = (hotels:any) => {
    setHotelData(hotels)
    setLoading(false)
  }

  return (
    <HotelContext.Provider value={{
      hotelData,
      setHotelsData,
      filteredHotels,
      searchHotels,
      loading,
      clearResults,
      airlineNames,
    //   getAirlineName,
      applyFilters,
      handleSuggestions
    }}>
      {children}
    </HotelContext.Provider>
  )
}

export function useHotel() {
  const context = useContext(HotelContext)
  if (context === undefined) {
    throw new Error('useHotel must be used within a HotelProvider')
  }
  return context
}