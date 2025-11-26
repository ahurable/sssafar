// app/api/activities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city');
    const featured = searchParams.get('featured');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      isActive: true
    };

    if (city) {
      where.city = {
        name: {
          contains: city,
          mode: 'insensitive'
        }
      };
    }

    if (featured === 'true') {
      where.featured = true;
    }

    // Get city tours with related data
    const cityTours = await prisma.cityTour.findMany({
      where,
      skip,
      take: limit,
      include: {
        prices: true,
        inclusions: true,
        exclusions: true,
        itineraries: {
          orderBy: { order: 'asc' }
        },
        city: true,
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        featured: 'desc'
      }
    });
    // // console.log(cityTours)
    // Get total count for pagination
    const total = await prisma.cityTour.count({ where });

    return NextResponse.json({
      cityTours: cityTours,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching city tours:', error);
    return NextResponse.json(
      { error: 'خطایی در دریافت لیست گشت‌های شهری رخ داد' },
      { status: 500 }
    );
  }
}