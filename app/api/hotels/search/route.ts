import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// Types for Domestic Hotel Data
interface DomesticCity {
  Id: number;
  Name: string;
  NameFa: string;
  PropertyDestinationId: number;
  IsPopular: boolean;
  SearchDestinationOrCity: boolean;
  IsActive: boolean;
  DomesticProperty: any[];
  DomesticPropertyCityProvider: any[];
}

// Types for International Hotel Data
interface InternationalCity {
  Id: number;
  Name: string;
  PropertyDestinationId: number;
}

// Combined response type
interface Suggestion {
  id?: number;
  hotelId?: number;
  name: string;
  nameFa?: string;
  propertyDestinationId?: number;
  type: string;
  isPopular?: boolean;
  searchDestinationOrCity?: boolean;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  kind?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase().trim();
    const type = searchParams.get('type'); // 'domestic' or 'international' or both

    if (!query) {
      return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
    }

    const results: Suggestion[] = [];

    // Search in Domestic Hotel Data
    if (type && type == "domestic") {
      const domesticResponse = await fetch('http://localhost:3000/data/DomesticPropertyCity.json');

      if (!domesticResponse.ok) {
        throw new Error(`Failed to fetch domestic cities data: ${domesticResponse.status}`);
      }

      const domesticCities: DomesticCity[] = await domesticResponse.json();

      const domesticMatches = domesticCities.filter(city =>
        city.Name.toLowerCase().includes(query) ||
        (city.NameFa && city.NameFa.toLowerCase().includes(query))
      ).map(city => ({
        id: city.Id,
        name: city.Name,
        nameFa: city.NameFa,
        propertyDestinationId: city.PropertyDestinationId,
        type: 'domestic' as const,
        isPopular: city.IsPopular,
        searchDestinationOrCity: city.SearchDestinationOrCity,
        isActive: city.IsActive,
        kind: 'city'
      }));

      results.push(...domesticMatches);

      if (domesticMatches.length === 0) {
        const hotels = await prisma.hotel.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                name: {
                  contains: query.toUpperCase(),
                  mode: 'insensitive'
                }
              }
            ],
            type: "DOMESTIC"
          }
        });

        if (hotels.length > 0)
          results.push(...hotels)
      }
    }

    else {
      // Search in International Hotel Data
      const internationalResponse = await fetch('http://localhost:3000/data/PropertyCity.json');

      if (!internationalResponse.ok) {
        throw new Error(`Failed to fetch international cities data: ${internationalResponse.status}`);
      }

      const internationalCities: InternationalCity[] = await internationalResponse.json();

      const internationalMatches = internationalCities.filter(city =>
        city.Name.toLowerCase().includes(query)
      ).map(city => ({
        id: city.Id,
        name: city.Name,
        propertyDestinationId: city.PropertyDestinationId,
        type: 'international' as const,
        kind: 'city'
      }));

      // console.log(internationalMatches)
      results.push(...internationalMatches);

      // console.log(results)

      if (internationalMatches.length === 0) {
        const hotels = await prisma.hotel.findMany({
          where: {
            OR: [
              {
                name: {
                  contains: query,
                  mode: 'insensitive'
                }
              },
              {
                name: {
                  contains: query.toUpperCase(),
                  mode: 'insensitive'
                }
              }
            ],
            type: "INTERNATIONAL"
          }
        });

        if (hotels.length > 0)
          results.push(...hotels)
      }

    }

    // Sort results by relevance (exact matches first, then partial matches)
    const sortedResults = results.sort((a, b) => {
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aNameFa = a.nameFa?.toLowerCase() || '';

      // Exact match check
      if (aName === query || aNameFa === query) return -1;
      if (bName === query) return 1;

      // Starts with query
      if (aName.startsWith(query)) return -1;
      if (bName.startsWith(query)) return 1;

      return aName.localeCompare(bName);
    });

    return NextResponse.json({
      query,
      count: sortedResults.length,
      results: sortedResults
    });

  } catch (error) {
    console.error('Error in cities search API:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}