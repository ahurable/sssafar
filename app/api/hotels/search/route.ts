// app/api/hotels/search/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Using Booking.com API via RapidAPI
    const response = await fetch('https://booking-com.p.rapidapi.com/v1/hotels/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
        'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
      },
      body: JSON.stringify({
        checkin_date: body.checkIn,
        checkout_date: body.checkOut,
        units: 'metric',
        dest_id: body.city,
        dest_type: 'city',
        adults_number: body.guests,
        room_number: body.rooms,
        order_by: 'popularity',
        locale: 'en-gb',
        currency: 'USD'
      })
    })

    if (!response.ok) {
      throw new Error('Hotel API request failed')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Hotel search error:', error)
    return NextResponse.json(
      { error: 'Failed to search hotels' },
      { status: 500 }
    )
  }
}