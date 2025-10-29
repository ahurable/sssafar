import { NextRequest, NextResponse } from 'next/server'

interface NiraAvailabilityRequest {
  airline: string
  origin: string
  destination: string
  departureDate: string // Format: YYYY-MM-DD
  adults: number
  children?: number
  infants?: number
}

interface NiraFlight {
  AirLine: string
  Origin: string
  OriginIATACODE: string
  Destination: string
  DestinationIATACODE: string
  DepartureDateShamsi: string
  DepartureDateMiladi: string
  DepartureTime: string
  ArrivalTime: string
  PlaneType: string
  PlaneTypeCode: string
  FlightNo: string
  FlightClasses: string
}

interface NiraAvailabilityResponse {
  AvailableFlights: NiraFlight[]
}

export async function POST(request: NextRequest) {
  try {
    const searchData: NiraAvailabilityRequest = await request.json()

    // Validate required fields
    if (!searchData.airline || !searchData.origin || !searchData.destination || !searchData.departureDate) {
      return NextResponse.json(
        { error: 'Missing required fields: airline, origin, destination, departureDate' },
        { status: 400 }
      )
    }

    // Convert date to Shamsi (Persian calendar) format required by Nira API
    const gregorianDate = new Date(searchData.departureDate)
    const shamsiDate = convertToShamsi(gregorianDate)

    // Prepare parameters for Nira API
    const params = new URLSearchParams({
      AirLine: searchData.airline.toUpperCase(),
      cbSource: searchData.origin.toUpperCase(),
      cbTarget: searchData.destination.toUpperCase(),
      cbDay1: shamsiDate.day.toString(),
      cbMonth1: shamsiDate.month.toString(),
      cbAdultQty: (searchData.adults || 1).toString(),
      cbChildQty: (searchData.children || 0).toString(),
      cbInfantQty: (searchData.infants || 0).toString()
    })

    const officeUser = 'thr639.ws'
    const officePassword = 'Aseman2024@'

    // Nira API base URL for availability
    const niraBaseURL = 'http://zv.zagrosairlines.com:882'
    const apiUrl = `${niraBaseURL}/AvailabilityJS.jsp?${params}&OfficeUser=${officeUser}&OfficePassword=${officePassword}`

    console.log('🔍 Calling Nira Availability API:', apiUrl)

    // Call Nira API with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; TravelSystem/1.0)'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`Nira API responded with status: ${response.status}`)
      }

      const niraResponse: NiraAvailabilityResponse = await response.json()

      // Transform Nira response to our standard format
      const transformedFlights = transformNiraResponse(niraResponse, searchData)

      return NextResponse.json({
        success: true,
        data: transformedFlights,
        rawNiraResponse: niraResponse // Include raw response for debugging
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('Nira API request timed out after 30 seconds')
      }
      throw fetchError
    }

  } catch (error) {
    console.error('❌ Nira Availability API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch flight availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Helper function to convert Gregorian to Shamsi (simplified version)
function convertToShamsi(gregorianDate: Date): { day: number; month: number; year: number } {
  // This is a simplified conversion. In production, use a proper library like jalali-moment
  const gDate = new Date(gregorianDate)
  const gYear = gDate.getFullYear()
  const gMonth = gDate.getMonth() + 1
  const gDay = gDate.getDate()

  // Simple conversion algorithm (approximate)
  let shamsiYear = gYear - 621
  let shamsiMonth = gMonth - 3
  let shamsiDay = gDay - 21

  if (shamsiMonth <= 0) {
    shamsiYear--
    shamsiMonth += 12
  }

  if (shamsiDay <= 0) {
    shamsiMonth--
    if (shamsiMonth <= 0) {
      shamsiYear--
      shamsiMonth = 12
    }
    // Simple day adjustment
    shamsiDay += 30
  }

  // Ensure valid ranges
  shamsiMonth = Math.max(1, Math.min(12, shamsiMonth))
  shamsiDay = Math.max(1, Math.min(31, shamsiDay))

  return {
    day: shamsiDay,
    month: shamsiMonth,
    year: shamsiYear
  }
}

// Transform Nira API response to our standard format
function transformNiraResponse(niraResponse: NiraAvailabilityResponse, searchData: NiraAvailabilityRequest) {
  if (!niraResponse.AvailableFlights || !Array.isArray(niraResponse.AvailableFlights)) {
    return []
  }

  return niraResponse.AvailableFlights.map((flight: NiraFlight) => {
    // Parse available classes from FlightClasses string (e.g., "/YA ZA")
    const availableClasses = parseAvailableClasses(flight.FlightClasses)
    
    return {
      id: generateFlightId(flight),
      airline: {
        code: flight.AirLine,
        name: getAirlineName(flight.AirLine)
      },
      flightNumber: flight.FlightNo,
      departure: {
        airport: {
          code: flight.OriginIATACODE,
          name: flight.Origin,
          city: extractCityName(flight.Origin)
        },
        date: flight.DepartureDateMiladi,
        time: flight.DepartureTime
      },
      arrival: {
        airport: {
          code: flight.DestinationIATACODE,
          name: flight.Destination,
          city: extractCityName(flight.Destination)
        },
        date: flight.DepartureDateMiladi, // Same day flights in Iran
        time: flight.ArrivalTime
      },
      duration: calculateFlightDuration(flight.DepartureTime, flight.ArrivalTime),
      aircraft: {
        type: flight.PlaneType,
        code: flight.PlaneTypeCode
      },
      availableClasses,
      priceRange: calculatePriceRange(availableClasses),
      isDomestic: true,
      rawData: flight // Include raw data for reference
    }
  })
}

// Parse FlightClasses string to extract available classes
function parseAvailableClasses(flightClasses: string): Array<{
  code: string
  name: string
  availability: 'available' | 'limited' | 'waitlist'
}> {
  const classes: Array<{ code: string; name: string; availability: 'available' | 'limited' | 'waitlist' }> = []
  
  if (!flightClasses) return classes

  // FlightClasses format: "/YA ZA" or "/YC ZC" etc.
  const classMatches = flightClasses.match(/([A-Z])([A-Z])/g) || []
  
  classMatches.forEach(match => {
    const classCode = match[0] // First character is class code
    const availabilityCode = match[1] // Second character is availability code
    
    const className = getClassName(classCode)
    const availability = getAvailabilityStatus(availabilityCode)
    
    classes.push({
      code: classCode,
      name: className,
      availability
    })
  })

  return classes
}

// Get class name from code
function getClassName(classCode: string): string {
  const classNames: { [key: string]: string } = {
    'Y': 'اکونومی',
    'C': 'بیزینس',
    'F': 'فرست',
    'Z': 'اکونومی ویژه',
    'B': 'بیزینس ویژه'
  }
  return classNames[classCode] || `کلاس ${classCode}`
}

// Get availability status from code
function getAvailabilityStatus(availabilityCode: string): 'available' | 'limited' | 'waitlist' {
  const statusMap: { [key: string]: 'available' | 'limited' | 'waitlist' } = {
    'A': 'available',
    'B': 'available',
    'C': 'limited',
    'D': 'limited',
    'E': 'limited',
    'F': 'limited',
    'G': 'limited',
    'H': 'limited',
    'J': 'waitlist',
    'K': 'waitlist',
    'L': 'waitlist'
  }
  return statusMap[availabilityCode] || 'available'
}

// Calculate flight duration
function calculateFlightDuration(departureTime: string, arrivalTime: string): string {
  try {
    const [depHours, depMinutes] = departureTime.split(':').map(Number)
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number)
    
    let totalMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes)
    
    // Handle overnight flights
    if (totalMinutes < 0) {
      totalMinutes += 24 * 60
    }
    
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    
    return `${hours}h ${minutes}m`
  } catch {
    return '1h 30m' // Default duration
  }
}

// Calculate price range based on classes (estimated)
function calculatePriceRange(availableClasses: any[]): { min: number; max: number; currency: string } {
  if (availableClasses.length === 0) {
    return { min: 0, max: 0, currency: 'IRR' }
  }

  // Base prices in IRR (Iranian Rial)
  const basePrices: { [key: string]: number } = {
    'Y': 5000000, // Economy
    'Z': 6000000, // Premium Economy
    'C': 10000000, // Business
    'F': 15000000, // First
    'B': 12000000  // Premium Business
  }

  const prices = availableClasses
    .map(cls => basePrices[cls.code] || 5000000)
    .filter(price => price > 0)

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
    currency: 'IRR'
  }
}

// Generate unique flight ID
function generateFlightId(flight: NiraFlight): string {
  return `${flight.AirLine}-${flight.FlightNo}-${flight.DepartureDateMiladi}-${flight.DepartureTime}`
}

// Get airline name from code
function getAirlineName(airlineCode: string): string {
  const airlines: { [key: string]: string } = {
    'ZV': 'زاگرس',
    'IR': 'ایران ایر',
    'W5': 'ماهان',
    'QB': 'قشم ایر',
    'II': 'آتا',
    'IV': 'کاسپین',
    'EP': 'آسمان',
    'HH': 'تابان',
    'I3': 'آراک ایر',
    'JR': 'کیش ایر'
  }
  return airlines[airlineCode] || airlineCode
}

// Extract city name from airport name
function extractCityName(airportName: string): string {
  // Remove airport-specific terms to get city name
  return airportName
    .replace(/فرودگاه|بین المللی|بین‌المللی|آباد/g, '')
    .trim()
}

// Also support GET requests for direct testing
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  try {
    const searchData: NiraAvailabilityRequest = {
      airline: searchParams.get('airline') || 'ZV',
      origin: searchParams.get('origin') || '',
      destination: searchParams.get('destination') || '',
      departureDate: searchParams.get('departureDate') || new Date().toISOString().split('T')[0],
      adults: parseInt(searchParams.get('adults') || '1'),
      children: parseInt(searchParams.get('children') || '0'),
      infants: parseInt(searchParams.get('infants') || '0')
    }

    // Validate required fields for GET
    if (!searchData.origin || !searchData.destination) {
      return NextResponse.json(
        { error: 'Missing required parameters: origin, destination' },
        { status: 400 }
      )
    }

    // Create a mock request and call POST handler
    const mockRequest = new Request(request.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchData)
    })

    return POST(mockRequest)

  } catch (error) {
    console.error('❌ Nira Availability GET error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch flight availability',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}