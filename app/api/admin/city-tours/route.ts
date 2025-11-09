// app/api/admin/city-tours/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const tours = await prisma.cityTour.findMany({
      include: {
        prices: true,
        inclusions: true,
        exclusions: true,
        itineraries: true,
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ tours })
  } catch (error) {
    console.error("Error fetching city tours:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    
    const tour = await prisma.cityTour.create({
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
        images: body.images || [],
        prices: {
          create: body.prices
        },
        inclusions: {
          create: body.inclusions
        },
        exclusions: {
          create: body.exclusions
        },
        itineraries: {
          create: body.itineraries.map((it: any, index: number) => ({
            ...it,
            order: index + 1
          }))
        }
      },
      include: {
        prices: true,
        inclusions: true,
        exclusions: true,
        itineraries: true
      }
    })

    return NextResponse.json({ tour })
  } catch (error) {
    console.error("Error creating city tour:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}