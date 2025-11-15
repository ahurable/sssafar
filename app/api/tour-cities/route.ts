// app/api/tour-cities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const cities = await prisma.tourCity.findMany({
      include: {
        _count: {
          select: {
            tours: {
              where: {
                isActive: true,
                startDate: {
                  gte: new Date()
                }
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