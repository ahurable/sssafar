// app/api/suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.toLowerCase() || ''
  const type = searchParams.get('type') || 'hotel'
  // // console.log(query) => tehr
  // // console.log(type) => flight
  try {
    let suggestions: any[] = []

    if (type === 'flight') {
      // Fetch from airports API for flight searches
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const airportsResponse = await fetch(`${baseUrl}/api/flights/getAirportCity?query=${encodeURIComponent(query)}`)

      if (airportsResponse.ok) {
        const airports = await airportsResponse.json()
        // console.log(airports)
        suggestions = airports.map((airport: any) => ({
          id: airport.iata,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          showName: airport.showName,
          code: airport.iata,
          type: 'airport' as const
        }))
        // console.log(suggestions)
      }


      else {
        console.warn('Failed to fetch airports, using fallback')
        suggestions = getFallbackAirportSuggestions(query)
      }
    }
    else if (type == "domesticFlights") {
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const airportsResponse = await fetch(`${baseUrl}/api/flights/getDomesticAirportCity?query=${encodeURIComponent(query)}`)

      if (airportsResponse.ok) {
        const airports = await airportsResponse.json()
        suggestions = airports.map((airport: any) => ({
          id: airport.iata,
          name: airport.name,
          city: airport.city,
          country: airport.country,
          code: airport.iata,
          type: 'airport' as const
        }))
        // console.log(airports)
      }
    }
    else {
      // For hotels and trains, use city-based suggestions
      suggestions = getCitySuggestions(query)
    }

    // Limit results
    suggestions = suggestions.slice(0, 10)
    // console.log(suggestions)
    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Suggestions API error:', error)
    return NextResponse.json([], { status: 500 })
  }
}

function getFallbackAirportSuggestions(query: string): any[] {
  const airports = [
    { iata: 'IKA', name: 'فرودگاه بین المللی امام خمینی', city: 'تهران', country: 'ایران' },
    { iata: 'THR', name: 'فرودگاه مهرآباد', city: 'تهران', country: 'ایران' },
    { iata: 'MHD', name: 'فرودگاه بین المللی شهید هاشمی نژاد', city: 'مشهد', country: 'ایران' },
    { iata: 'SYZ', name: 'فرودگاه بین المللی شهید دستغیب', city: 'شیراز', country: 'ایران' },
    { iata: 'DXB', name: 'فرودگاه بین المللی دبی', city: 'دبی', country: 'امارات' },
    { iata: 'IST', name: 'فرودگاه بین المللی استانبول', city: 'استانبول', country: 'ترکیه' },
  ]

  if (!query) {
    return airports.slice(0, 6).map(airport => ({
      id: airport.iata,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      // showName: airport.showName,
      code: airport.iata,
      type: 'airport' as const
    }))
  }

  return airports
    .filter(airport =>
      airport.name.toLowerCase().includes(query) ||
      airport.city.toLowerCase().includes(query) ||
      airport.iata.toLowerCase().includes(query)
    )
    .map(airport => ({
      id: airport.iata,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      code: airport.iata,
      type: 'airport' as const
    }))
}

function getCitySuggestions(query: string): any[] {
  const CITIES = [
    { id: '1', name: 'تهران', country: 'ایران', type: 'city' as const },
    { id: '2', name: 'مشهد', country: 'ایران', type: 'city' as const },
    { id: '3', name: 'اصفهان', country: 'ایران', type: 'city' as const },
    { id: '4', name: 'شیراز', country: 'ایران', type: 'city' as const },
    { id: '5', name: 'استانبول', country: 'ترکیه', type: 'city' as const },
    { id: '6', name: 'دبی', country: 'امارات', type: 'city' as const },
  ]

  if (!query) return CITIES.slice(0, 6)

  return CITIES.filter(city =>
    city.name.toLowerCase().includes(query) ||
    city.country.toLowerCase().includes(query)
  ).slice(0, 6)
}