import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const GET = async (request: NextRequest) => {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query || query.length === 0) {
        return NextResponse.json([], { status: 200 });
    }

    try {
        const foundedAirports = await prisma.airport.findMany({
            where: {
                OR: [
                    { name: { contains: query, mode: "insensitive" } },
                    { airportCity: { contains: query, mode: "insensitive" } },
                    { airportIata: { contains: query, mode: "insensitive" } }
                ]
            },
            select: {
                id: true,
                name: true,
                airportIata: true,
                airportCity: true
            },
            take: 10 // Limit results
        });

        return NextResponse.json(foundedAirports);
    } catch (error) {
        console.log("Error fetching airport suggestions:", error);
        return NextResponse.json(
            { message: "مشکلی در دریافت لیست پیشنهادات پیش آمد" },
            { status: 500 }
        );
    }
};