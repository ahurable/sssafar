import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

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

    // Check cache first
    if (hotelImagesCache.has(id)) {
      return NextResponse.json({ images: hotelImagesCache.get(id) });
    }

    const basePath = path.join(process.cwd(), 'assets', 'data');
    const internationalPath = path.join(basePath, 'HotelStaticData');
    const domesticPath = path.join(basePath, 'DomesticHotelStaticData');

    // Search in international property images first
    try {
      const internationalFiles = await fs.readdir(internationalPath);
      const imageFiles = internationalFiles.filter(file => 
        PROPERTY_IMAGE_FILE_PATTERNS.international.test(file)
      );

      console.log(`Searching in ${imageFiles.length} international image files for hotel ${id}`);

      for (const file of imageFiles) {
        const filePath = path.join(internationalPath, file);
        const images = await findHotelImagesInFile(filePath, id);
        
        if (images && images.length > 0) {
          hotelImagesCache.set(id, images);
          return NextResponse.json({ images });
        }
      }
    } catch (error) {
      console.error('Error searching international property images:', error);
    }

    // If not found, search in domestic property images
    try {
      const domesticFiles = await fs.readdir(domesticPath);
      const imageFiles = domesticFiles.filter(file => 
        PROPERTY_IMAGE_FILE_PATTERNS.domestic.test(file)
      );

      console.log(`Searching in ${imageFiles.length} domestic image files for hotel ${id}`);

      for (const file of imageFiles) {
        const filePath = path.join(domesticPath, file);
        const images = await findHotelImagesInFile(filePath, id);
        
        if (images && images.length > 0) {
          hotelImagesCache.set(id, images);
          return NextResponse.json({ images });
        }
      }
    } catch (error) {
      console.error('Error searching domestic property images:', error);
    }

    // If no images found, return empty array
    hotelImagesCache.set(id, []);
    return NextResponse.json({ images: [] });

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

    if (hotelIds.length > 50) {
      return NextResponse.json(
        { error: 'Too many hotel IDs. Maximum 50 per request.' },
        { status: 400 }
      );
    }

    const basePath = path.join(process.cwd(), 'assets', 'data');
    const internationalPath = path.join(basePath, 'HotelStaticData');
    const domesticPath = path.join(basePath, 'DomesticHotelStaticData');

    const results: { [key: number]: HotelImage[] } = {};
    const remainingIds = [...hotelIds];

    // Check cache first
    hotelIds.forEach(id => {
      if (hotelImagesCache.has(id)) {
        results[id] = hotelImagesCache.get(id)!;
        const index = remainingIds.indexOf(id);
        if (index > -1) {
          remainingIds.splice(index, 1);
        }
      }
    });

    if (remainingIds.length === 0) {
      return NextResponse.json({ images: results });
    }

    console.log(`Searching for ${remainingIds.length} hotels in image files`);

    // Search in international property images
    try {
      const internationalFiles = await fs.readdir(internationalPath);
      const imageFiles = internationalFiles.filter(file => 
        PROPERTY_IMAGE_FILE_PATTERNS.international.test(file)
      );

      for (const file of imageFiles) {
        if (remainingIds.length === 0) break;
        
        const filePath = path.join(internationalPath, file);
        const data = await fs.readFile(filePath, 'utf-8');
        const propertyImages: PropertyImage[] = JSON.parse(data);
        
        propertyImages.forEach(prop => {
          if (remainingIds.includes(prop.PropertyId) && prop.Images.length > 0) {
            results[prop.PropertyId] = prop.Images;
            hotelImagesCache.set(prop.PropertyId, prop.Images);
            const index = remainingIds.indexOf(prop.PropertyId);
            if (index > -1) {
              remainingIds.splice(index, 1);
            }
          }
        });
      }
    } catch (error) {
      console.error('Error searching international property images:', error);
    }

    // Search in domestic property images for remaining IDs
    if (remainingIds.length > 0) {
      try {
        const domesticFiles = await fs.readdir(domesticPath);
        const imageFiles = domesticFiles.filter(file => 
          PROPERTY_IMAGE_FILE_PATTERNS.domestic.test(file)
        );

        for (const file of imageFiles) {
          if (remainingIds.length === 0) break;
          
          const filePath = path.join(domesticPath, file);
          const data = await fs.readFile(filePath, 'utf-8');
          const propertyImages: PropertyImage[] = JSON.parse(data);
          
          propertyImages.forEach(prop => {
            if (remainingIds.includes(prop.PropertyId) && prop.Images.length > 0) {
              results[prop.PropertyId] = prop.Images;
              hotelImagesCache.set(prop.PropertyId, prop.Images);
              const index = remainingIds.indexOf(prop.PropertyId);
              if (index > -1) {
                remainingIds.splice(index, 1);
              }
            }
          });
        }
      } catch (error) {
        console.error('Error searching domestic property images:', error);
      }
    }

    // Set empty arrays for any remaining unfound hotels
    remainingIds.forEach(id => {
      results[id] = [];
      hotelImagesCache.set(id, []);
    });

    return NextResponse.json({ images: results });

  } catch (error) {
    console.error('Error in hotel images batch API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}