// app/api/flights/search/route.ts
import { flightSessionService } from '@/lib/flight-session'
import { getLowestPriceFromSearchResponse } from '@/lib/get-lowest-price-per-date'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const sessionId = await flightSessionService.getSession()
    // console.log(sessionId)

    // Construct the request body for PartoCRS API
    const requestBody = {
      PricingSourceType: body.PricingSourceType || "All",
      RequestOption: body.RequestOption || "All",
      SessionId: sessionId,
      AdultCount: body.AdultCount || 1,
      ChildCount: body.ChildCount || 0,
      InfantCount: body.InfantCount || 0,
      TravelPreference: {
        CabinType: body.TravelPreference?.CabinType || "Y",
        MaxStopsQuantity: body.TravelPreference?.MaxStopsQuantity || "All",
        AirTripType: body.TravelPreference?.AirTripType || "OneWay",
        VendorExcludeCodes: body.TravelPreference?.VendorExcludeCodes || [],
        VendorPreferenceCodes: body.TravelPreference?.VendorPreferenceCodes || []
      },
      OriginDestinationInformations: body.OriginDestinationInformations || [],
      IsGenuine: body.IsGenuine || false
    }

    // console.log(requestBody)

    // Call PartoCRS API
    const response = await fetch('https://apidemo.partocrs.com/api/Air/AirLowFareSearch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // No Authorization header as specified
      },
      body: JSON.stringify({
        ...requestBody
      })
    })

    if (!response.ok) {
      throw new Error(`API responded with status: ${response.status}`)
    }

    const data = await response.json()
    const lowestPrice = getLowestPriceFromSearchResponse(data)
    const lowestObject = {
        origin: requestBody.OriginDestinationInformations[0].OriginLocationCode,
        destination: requestBody.OriginDestinationInformations[0].DestinationLocationCode,
        date: requestBody.OriginDestinationInformations[0].DepartureDateTime.split('T')[0]
      }
    // console.log(lowestObject)
    // // console.log(lowestObject)
    if (lowestPrice !== null)
      await prisma.flightLowPriceStorePerDay.create({
        data: {
          origin: requestBody.OriginDestinationInformations[0].OriginLocationCode,
          destination: requestBody.OriginDestinationInformations[0].DestinationLocationCode,
          date: requestBody.OriginDestinationInformations[0].DepartureDateTime,
          lowestPrice: lowestPrice.toString()
        }
      })
    return NextResponse.json(data)
  } catch (error) {
    console.error('Flight search error:', error)
    return NextResponse.json(
      { error: 'Failed to search flights' },
      { status: 500 }
    )
  }
}