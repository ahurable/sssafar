// app/api/tour-cities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const cities = await prisma.city.findMany({
      include: {
        _count: {
          select: {
            cityTours: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ cities });
  } catch (error) {
    console.error('Error fetching tour cities:', error);
    return NextResponse.json(
      { error: 'خطا در دریافت لیست شهرها' },
      { status: 500 }
    );
  }
}