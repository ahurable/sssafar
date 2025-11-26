import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export const GET = async (request: NextRequest) => {

    
    const { searchParams } = new URL(request.url);
    const city = searchParams.get('city')?.toLowerCase().trim();
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    try {
        if (from && to) {
            const tours = await prisma.tour.findMany({
                where: {
                    cityId: city,
                    startDate: from,
                    endDate: to
                }
            })
            return NextResponse.json(tours, { status: 200 })
        }
        else if (city) {
            const tours = await prisma.tour.findMany({
                where: {
                    cityId: city
                }
            })
            // console.log(tours)
            return NextResponse.json(tours, { status: 200 })
        } else {
            const tours = await prisma.tour.findMany({
                orderBy: {
                    createdAt: 'desc'
                },
                take: 5,
                include: {
                    images: true
                }
            })
            if (tours.length == 0) {
                return NextResponse.json({
                    message: "هیچ توری تعریف نشده است"
                }, { status: 404 })
            }
            return NextResponse.json(tours, { status: 200 })
        }

    } catch (error) {
        // console.log(error)
        return NextResponse.json({
            message: error
        }, { status: 500 })
    }

}