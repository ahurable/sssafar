import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { prisma } from '@/lib/prisma';

interface HotelImage {
  Name: string;
  Thumbnail: string;
}

interface PropertyImage {
  Id: number;
  PropertyId: number;
  Images: HotelImage[];
}

// Cache for found hotel images
const hotelImagesCache = new Map<number, HotelImage[]>();

const PROPERTY_IMAGE_FILE_PATTERNS = {
  international: /^PropertyImage_\d+-\d+\.json$/,
  domestic: /^DomesticPropertyImage_\d+-\d+\.json$/
};

async function findHotelImagesInFile(filePath: string, hotelId: number): Promise<HotelImage[] | null> {
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const propertyImages: PropertyImage[] = JSON.parse(data);
    
    const hotelImages = propertyImages.find(prop => prop.PropertyId === hotelId);
    return hotelImages ? hotelImages.Images : null;
  } catch (error) {
    console.error(`Error reading image file ${filePath}:`, error);
    return null;
  }
}

// Support GET method for individual hotel images
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

    const getHotelImage = await prisma.hotelImage.findMany({
      where: {
        hotelId: id
      }
    })

    return NextResponse.json({ images: getHotelImage });

  } catch (error) {
    console.error('Error in hotel images API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Support POST method for batch hotel images
export async function POST(request: NextRequest) {
  try {
    const { hotelIds } = await request.json();

    if (!hotelIds || !Array.isArray(hotelIds)) {
      return NextResponse.json(
        { error: 'hotelIds array is required' },
        { status: 400 }
      );
    }

    const getHotelsImages = await prisma.hotelImage.findMany({
      where: {
        hotelId : {
          in: hotelIds
        }
      }
    })
    

    return NextResponse.json({ images: getHotelsImages });

  } catch (error) {
    console.error('Error in hotel images batch API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}