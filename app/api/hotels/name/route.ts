// app/api/hotels/name/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';


// Support GET method for individual hotel names
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const hotelId = searchParams.get('id');

    if (!hotelId) {
      return NextResponse.json(
        { error: 'Hotel ID is required' },
        { status: 400 }
      );
    }

    const id = parseInt(hotelId);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: 'Invalid hotel ID' },
        { status: 400 }
      );
    }

    const getHotelName = await prisma.hotel.findUnique({
      where: {
        hotelId: id
      }
    })
    console.log(getHotelName)
    return NextResponse.json({ ...getHotelName });

  } catch (error) {
    console.error('Error in hotel name API (GET):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Support POST method for batch hotel names
export async function POST(request: NextRequest) {
  try {
    const { hotelIds } = await request.json();

    if (!hotelIds || !Array.isArray(hotelIds)) {
      return NextResponse.json(
        { error: 'hotelIds array is required' },
        { status: 400 }
      );
    }

    // const names: Record<number, string> = {};
    const getHotelsNames = await prisma.hotel.findMany({
      where: {
        hotelId: {
          in: hotelIds
        }
      }
    })

    console.log(getHotelsNames)

    return NextResponse.json([ ...getHotelsNames ] , { status: 200 });

  } catch (error) {
    console.error('Error in hotel name API (POST):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}