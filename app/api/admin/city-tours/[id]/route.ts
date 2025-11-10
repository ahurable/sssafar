// app/api/admin/city-tours/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tour = await prisma.cityTour.findUnique({
      where: { id: params.id },
      include: {
        prices: true,
        inclusions: true,
        exclusions: true,
        itineraries: {
          orderBy: { order: 'asc' }
        },
        bookings: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!tour) {
      return NextResponse.json({ error: "Tour not found" }, { status: 404 })
    }

    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Error fetching city tour:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    // Start a transaction to update all related data
    const result = await prisma.$transaction(async (tx: any) => {
      // Update main tour data
      const updatedTour = await tx.cityTour.update({
        where: { id: params.id },
        data: {
          title: body.title,
          slug: body.slug,
          description: body.description,
          shortDescription: body.shortDescription,
          city: body.city,
          location: body.location,
          latitude: body.latitude,
          longitude: body.longitude,
          meetingPoint: body.meetingPoint,
          meetingLatitude: body.meetingLatitude,
          meetingLongitude: body.meetingLongitude,
          duration: body.duration,
          maxCapacity: body.maxCapacity,
          featured: body.featured,
          isActive: body.isActive,
          images: body.images,
        },
      })

      // Delete existing related data
      await tx.cityTourPrice.deleteMany({ where: { tourId: params.id } })
      await tx.cityTourInclusion.deleteMany({ where: { tourId: params.id } })
      await tx.cityTourExclusion.deleteMany({ where: { tourId: params.id } })
      await tx.cityTourItinerary.deleteMany({ where: { tourId: params.id } })

      // Create new related data
      if (body.prices && body.prices.length > 0) {
        await tx.cityTourPrice.createMany({
          data: body.prices.map((price: any) => ({
            ...price,
            tourId: params.id,
          })),
        })
      }

      if (body.inclusions && body.inclusions.length > 0) {
        await tx.cityTourInclusion.createMany({
          data: body.inclusions.map((inclusion: any) => ({
            ...inclusion,
            tourId: params.id,
          })),
        })
      }

      if (body.exclusions && body.exclusions.length > 0) {
        await tx.cityTourExclusion.createMany({
          data: body.exclusions.map((exclusion: any) => ({
            ...exclusion,
            tourId: params.id,
          })),
        })
      }

      if (body.itineraries && body.itineraries.length > 0) {
        await tx.cityTourItinerary.createMany({
          data: body.itineraries.map((itinerary: any) => ({
            ...itinerary,
            tourId: params.id,
          })),
        })
      }

      return updatedTour
    })

    return NextResponse.json({ tour: result })
  } catch (error) {
    console.error("Error updating city tour:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}