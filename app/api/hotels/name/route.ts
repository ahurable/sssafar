// app/api/hotels/name/route.ts
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

let hotelNamesMapping: Record<number, string> = {};

async function loadHotelNamesMapping() {
  try {
    const mappingPath = path.join(process.cwd(), 'assets', 'data', 'hotel-names-mapping.json');
    const data = await fs.readFile(mappingPath, 'utf-8');
    hotelNamesMapping = JSON.parse(data);
    console.log(`✅ Loaded ${Object.keys(hotelNamesMapping).length} hotel names from mapping`);
  } catch (error) {
    console.error('❌ Error loading hotel names mapping:', error);
    hotelNamesMapping = {};
  }
}

// Load on startup
loadHotelNamesMapping();

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

    const hotelName = hotelNamesMapping[id] || `هتل ${id}`;
    return NextResponse.json({ name: hotelName });

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

    const names: Record<number, string> = {};
    hotelIds.forEach(id => {
      names[id] = hotelNamesMapping[id] || `هتل ${id}`;
    });

    return NextResponse.json({ names });

  } catch (error) {
    console.error('Error in hotel name API (POST):', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}