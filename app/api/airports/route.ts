import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (request: NextRequest) => {
    try {
        const airports = await prisma.airport.findMany({
            include: {
                airportServeTypes: true
            }
        })
        return NextResponse.json(airports, { status: 200 })
    } catch (errr) {
        console.log(errr)
        return NextResponse.json({
            message: 'خطای سیستمی'
        }, { status: 500 })
    }
}