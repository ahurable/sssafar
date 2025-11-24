// app/api/tours/suggestions/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query || query.length < 2) {
      return NextResponse.json([])
    }

    const cities = await prisma.cityTour.findMany({
      where: {
        OR: [
          {
            city: {
              name: {
                contains: query,
                mode: 'insensitive'
              }
            }
          },
          {
            location: {
              contains: query,
              mode: 'insensitive'
            }
          }
        ],
        isActive: true
      },
      include: {
        city: true
      },
      distinct: ['cityId'],
      take: 10
    })

    const suggestions = cities.map((tour:any) => ({
      id: tour.cityId,
      name: tour.city?.name || tour.location,
      city: tour.city?.name || tour.location
    }))

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Error fetching city suggestions:', error)
    return NextResponse.json([], { status: 500 })
  }
}