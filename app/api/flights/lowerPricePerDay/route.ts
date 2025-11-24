import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (request: NextRequest) => {

    const { searchParams } = new URL(request.url)
    const origin = searchParams.get('origin')
    const destination = searchParams.get('destination')

    if (!origin)
        return

    if (!destination)
        return

    const flightLowerPricesPerDay = await prisma.flightLowPriceStorePerDay.findMany({
        where: {
            origin: origin,
            destination: destination
        }
    })

    return NextResponse.json(
        flightLowerPricesPerDay,
        { status: 200 }
    )

}