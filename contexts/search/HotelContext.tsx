// contexts/hotel-context.tsx
"use client"

import { StdioNull } from 'node:child_process'
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { read, utils } from 'xlsx'
import path from 'path'

interface HotelPricedItinerary {
  FareSourceCode: string
  Offer: string
  Promotion: string
  NonRefundable: boolean
  HotelId: number
  HotelPolicy: {
    BeginTime: string
    EndTime: string
    MinAge: string
    CheckOutTime: string
    Instructions: string
    SpecialInstructions: string
    MandatoryFee: string
    OptionalFee: string
    KnowBeforeYouGo: string
    PaymentDetail: string
    LicenseNumber: string
    KeyCollectionInfo: string
    InstructionsFa: string
    SpecialInstructionsFa: string
    ChildPolicyDescriptionFa: string
    SingleWomanDescriptionFa: string
    PetAttribiute: Array<{ name: string }>
  }
  ExtraCharge: {
    Excluded: string
    Included: string
    MealplanDescription: string
  }
  PaymentDeadline: string
  Currency: string
  AvailableRoom: number
  PlainTextCancellationPolicy: string
  NetRate: number
  NetRateWithoutDiscount: number
  ExtraBedRate: number
  BaseRate: number
  Rooms: Array<{
    RoomId: string
    RoomMapId: string
    Name: string
    RoomMapName: string
    AdultCount: number
    ExtraBedCount: number
    ChildCount: number
    ChildAges: string[]
    MealType: string
    SharingBedding: boolean
    BedGroups: string
  }>
  Surcharges: Array<{
    Name: string
    ChargeType: string
    SupplierAmount: number
    Amount: number
    ExclusionType: number
  }>
  CancellationPolicies: Array<{
    Amount: number
    FromDate: string
  }>
  Remarks: string[]
  RemarksFa: string[]
  Amenities: string[]
  IsReserveOffline: boolean
  IsBlockout: boolean
  HotelLabels: string[]
}

export interface HotelImage {
  Name: string;
  Thumbnail: string;
}

export interface PropertyImage {
  Id: number;
  PropertyId: number;
  Images: HotelImage[];
}

interface HotelSearchResponse {
  Success: boolean
  SearchId: number
  Error?: {
    Id: string
    Message: string
  }
  CheckIn: string
  CheckOut: string
  PricedItineraries: HotelPricedItinerary[]
}


interface HotelListProps {
  searchData?: HotelSearchResponse
  loading?: boolean
}

interface City {
  iata: string
  name: string
  city: string
}

interface FilterState {
  priceRange: [number, number]
  hotelRatings: string[]
  amenities: string[]
  hotelTypes: string[] // Add this if you need hotel type filtering
}

// Interface for property data from JSON files
interface Property {
  Id: number;
  LastUpdate: string;
  Name: string;
  PropertyCityId: number;
  Rating: number;
  ReviewScore?: number;
  Address: string;
  Email?: string;
  Url?: string;
  Latitude: string;
  Longitude: string;
  PostalCode: string;
  Accommodation: number;
  Phone?: string;
  Fax?: string;
}

interface HotelContextType {
  hotelData?: HotelSearchResponse
  setHotelsData: (hotels:any) => void
  loading: boolean
  searchHotels: (params: any) => any
  clearResults: () => void
  applyFilters: (filters: FilterState) => void
  filteredHotels: any[]
  handleSuggestions: (query: string) => Promise<City[] | null>
  getHotelName: (hotelId: number) => Promise<string> 
  getHotelNames: (hotelIds: number[]) => Promise<{[key: number]: string}>
  getHotelImages: (hotelId: number) => Promise<HotelImage[]>,
  getHotelsImages: (hotelIds: number[]) => Promise<{[key: number]:  HotelImage[]}>
  clearFilters: () => void,
  request: any,
  setRequest: (request: any) => void
}




// Cache for hotel names to avoid repeated file reads
const hotelNameCache = new Map<number, string>();


const suggestCity = async (query:string) => {
    try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const fileUrl = `${baseUrl}/api/hotels/search?q=${query}`
    
    // console.log('🔍 Attempting to fetch cities file from:', fileUrl)
    
    const response = await fetch(fileUrl, {
      cache: 'force-cache'
    })
    
    // console.log('📄 cities response status:', response.status)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch Airlines XLSX file from ${fileUrl}`)
    }
    const data = await response.json()
 
    
    if (data.length === 0) {
      throw new Error('No data found in cities sheet')
    }

  
    const suggestions = data.results
    // // console.log(suggestions)
    return suggestions

  } catch (error) {
    console.error('❌ Error loading cities XLSX file:', error)
    // Return a fallback map with common cities

    // console.log('🔄 Using fallback cities data')
    return null
  }
}

const HotelContext = createContext<HotelContextType | undefined>(undefined)

export function HotelProvider({ children }: { children: ReactNode }) {
  const [hotelData, setHotelData] = useState<HotelSearchResponse>()
  const [loading, setLoading] = useState(false)
  const [filteredHotels, setFilteredHotels] = useState<any[]>([])
  const [request, setRequest] = useState()
  const getHotelNames = async (hotelIds: number[]): Promise<{[key: number]: string}> => {
    try {
      const response = await fetch('/api/hotels/name', { // Changed to /api/hotels/name
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelIds })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotel names');
      }
      
      const data = await response.json();
      // console.log(data)
      return data;
    } catch (error) {
      console.error('Error getting hotel names:', error);
      const fallbackNames: {[key: number]: string} = {};
      hotelIds.forEach(id => {
        fallbackNames[id] = `هتل ${id}`;
      });
      return fallbackNames;
    }
  };

  const getHotelImages = async (hotelId: number): Promise<HotelImage[]> => {
    try {
      const response = await fetch(`/api/hotels/images?id=${hotelId}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotel images');
      }
      
      const data = await response.json();
      return data.images || [];
    } catch (error) {
      console.error(`Error getting hotel images for ID ${hotelId}:`, error);
      return [];
    }
  };

  const getHotelsImages = async (hotelIds: number[]): Promise<{[key: number]: HotelImage[]}> => {
    try {
      const response = await fetch('/api/hotels/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelIds })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotel images');
      }
      
      const data = await response.json();
      return data.images || {};
    } catch (error) {
      console.error('Error getting hotel images:', error);
      const fallbackImages: {[key: number]: HotelImage[]} = {};
      hotelIds.forEach(id => {
        fallbackImages[id] = [];
      });
      return fallbackImages;
    }
  };

  // Single hotel name function
  const getHotelName = async (hotelId: number): Promise<string> => {
    try {
      const response = await fetch(`/api/hotels/name?id=${hotelId}`) // This should now work
      
      if (!response.ok) {
        throw new Error('Failed to fetch hotel name');
      }
      
      const data = await response.json();
      return data.name || `هتل ${hotelId}`;
    } catch (error) {
      console.error(`Error getting hotel name for ID ${hotelId}:`, error);
      return `هتل ${hotelId}`;
    }
  };

  const getTimeRange = (timeString: string) => {
    const time = new Date(timeString).getHours()
    if (time >= 6 && time < 12) return "صبح (۶-۱۲)"
    if (time >= 12 && time < 18) return "ظهر (۱۲-۱۸)"
    if (time >= 18 && time < 24) return "عصر (۱۸-۲۴)"
    return "شب (۰-۶)"
  }

  const handleSuggestions = async (query: string) => await suggestCity(query)

   const applyFilters = (newFilters: FilterState) => {
    
    if (!hotelData?.PricedItineraries) return

    const filtered = hotelData.PricedItineraries.filter(hotel => {
      // Price filter
      const hotelPrice = hotel.NetRate || 0
      if (hotelPrice < newFilters.priceRange[0] || hotelPrice > newFilters.priceRange[1]) {
        return false
      }

      // Rating filter
      if (newFilters.hotelRatings.length > 0) {
        const hotelRating = Math.floor(hotel.BaseRate || 0)
        const ratingMap: { [key: string]: number } = {
          '5 ستاره': 5,
          '4 ستاره': 4,
          '3 ستاره': 3,
          '2 ستاره': 2
        }
        
        const hasMatchingRating = newFilters.hotelRatings.some(rating => 
          hotelRating === ratingMap[rating]
        )
        if (!hasMatchingRating) return false
      }

      // Amenities filter
      if (newFilters.amenities.length > 0 && hotel.Amenities) {
        const hasAllAmenities = newFilters.amenities.every(amenity => 
          hotel.Amenities.includes(amenity)
        )
        if (!hasAllAmenities) return false
      }

      // Hotel type filter (domestic/international)
      if (newFilters.hotelTypes.length > 0) {
        // You might need to determine hotel type based on some logic
        // This is a placeholder - adjust based on your data structure
        const isDomestic = hotel.HotelId < 1000000 // Example logic
        const hotelType = isDomestic ? 'domestic' : 'international'
        
        if (!newFilters.hotelTypes.includes(hotelType)) return false
      }

      return true
    })

    setFilteredHotels(filtered)
  }

  const clearFilters = () => {
    if (hotelData?.PricedItineraries) {
      setFilteredHotels(hotelData.PricedItineraries)
    }
  }


  useEffect(() => {
    if (hotelData?.PricedItineraries) {
      setFilteredHotels(hotelData.PricedItineraries)
    }
  }, [hotelData])

  // Update when new hotel data arrives
  useEffect(() => {
    if (hotelData)
      setFilteredHotels(hotelData.PricedItineraries)
  }, [hotelData])

  // Load cities on component mount
  

  const clearResults = () => {
    setHotelData(undefined)
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
    // // console.log(hotels)
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
      applyFilters,
      handleSuggestions,
      getHotelName,
      getHotelNames,
      getHotelImages,
      getHotelsImages,
      clearFilters,
      request,
      setRequest
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