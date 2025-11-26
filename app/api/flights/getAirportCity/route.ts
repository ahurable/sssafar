// app/api/airports/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { read, utils } from 'xlsx'

interface Airport {
  iata: string
  name: string
  city: string
  country?: string
}

let airportsCache: Airport[] | null = null

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('query')?.toLowerCase() || ''
  // console.log('fired')
  try {
    if (!airportsCache) {
      airportsCache = await loadAirportsFromXLSX()
      
      if (airportsCache.length === 0) {
        return NextResponse.json({
          error: 'No airports loaded from file',
          debug: await debugFileAccess()
        }, { status: 500 })
      }
    }

    let suggestions: Airport[] = []

    if (query) {
      suggestions = airportsCache.filter(airport =>
        airport.name.toLowerCase().includes(query) ||
        airport.city.toLowerCase().includes(query) ||
        airport.iata.toLowerCase().includes(query)
      )
    } else {
      suggestions = airportsCache.slice(0, 20)
    }

    suggestions = suggestions.slice(0, 15)
    return NextResponse.json(suggestions)

  } catch (error) {
    console.error('Airports API error:', error)
    return NextResponse.json({
      error: 'Failed to load airports',
      debug: await debugFileAccess(),
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

async function loadAirportsFromXLSX(): Promise<Airport[]> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const fileUrl = `${baseUrl}/data/Airport.xls` // Using City.xlsx
    
    // console.log('🔍 Attempting to fetch file from:', fileUrl)
    
    const response = await fetch(fileUrl, {
      cache: 'force-cache',
      headers: {
        'Cache-Control': 'public, max-age=3600'
      }
    })
    
    // console.log('📄 Response status:', response.status, response.statusText)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch XLSX file from ${fileUrl}`)
    }

    const contentType = response.headers.get('content-type')
    const contentLength = response.headers.get('content-length')
    
    // console.log('📊 File info:', { contentType, contentLength })
    
    if (!contentType?.includes('spreadsheet') && !contentType?.includes('excel')) {
      console.warn('⚠️ Unexpected content type:', contentType)
    }

    const arrayBuffer = await response.arrayBuffer()
    // console.log('📦 File size (bytes):', arrayBuffer.byteLength)
    
    if (arrayBuffer.byteLength === 0) {
      throw new Error('File is empty (0 bytes)')
    }

    // Parse the XLSX file
    const workbook = read(arrayBuffer, { type: 'array' })
    // console.log('📋 Sheet names:', workbook.SheetNames)
    
    if (workbook.SheetNames.length === 0) {
      throw new Error('No sheets found in XLSX file')
    }

    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = utils.sheet_to_json(worksheet)
    
    // console.log('📊 Total rows in sheet:', data.length)
    
    if (data.length === 0) {
      throw new Error('No data found in the first sheet')
    }

    // Log the first row to see column names
    // console.log('🔍 First row sample:', data[0])
    // console.log('🔍 All column names:', Object.keys(data[0] || {}))

    // Map to Airport interface - we'll figure out the column names from the debug
    const columnNames = Object.keys(data[0] || {})
    // console.log('🏷️ Available columns:', columnNames)
    
    // Find the correct column names
    const iataColumn = columnNames.find(col => 
      col.toLowerCase().includes('iata') || col.toLowerCase().includes('code')
    )
    const nameColumn = columnNames.find(col => 
      col.toLowerCase().includes('name') || col.toLowerCase().includes('airport')
    )
    const cityColumn = columnNames.find(col => 
      col.toLowerCase().includes('city') || col.toLowerCase().includes('city name')
    )
    const countryColumn = columnNames.find(col => 
      col.toLowerCase().includes('country') || col.toLowerCase().includes('country code')
    )

    // console.log('🔍 Detected columns:', {
    //   iata: iataColumn,
    //   name: nameColumn,
    //   city: cityColumn,
    //   country: countryColumn
    // })

    const airports: Airport[] = data.map((row: any, index: number) => {
      // Use detected columns or fallback to first columns
      const iata = iataColumn ? row[iataColumn] : row[columnNames[0]]
      const name = nameColumn ? row[nameColumn] : row[columnNames[1]] 
      const city = cityColumn ? row[cityColumn] : row[columnNames[2]]
      const country = countryColumn ? row[countryColumn] : row[columnNames[3]]

      return {
        iata: (iata || '').toString().trim(),
        name: (name || '').toString().trim(),
        city: (city || '').toString().trim(),
        country: (country || '').toString().trim()
      }
    }).filter(airport => airport.iata && airport.name && airport.city)

    // console.log(`✅ Successfully loaded ${airports.length} airports from XLSX`)
    // console.log('📝 First 3 airports:', airports.slice(0, 3))
    // // console.log(airports)
    return airports

  } catch (error) {
    console.error('❌ Error loading XLSX file:', error)
    throw error // Re-throw to handle in the main function
  }
}

async function debugFileAccess() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const fileUrl = `${baseUrl}/data/Airport.xls`
    
    const response = await fetch(fileUrl)
    return {
      fileUrl,
      status: response.status,
      statusText: response.statusText,
      contentType: response.headers.get('content-type'),
      contentLength: response.headers.get('content-length'),
      accessible: response.ok
    }
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}