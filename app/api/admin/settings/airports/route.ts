import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";


export const POST = async (request: NextRequest) => {

    const session = await getSession()

    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            message: "ابتدا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    const { airportName, airportIata, airportCity } = await request.json()

    try {

        await prisma.airport.create({
            data: {
                name: airportName,
                airportIata: airportIata,
                airportCity: airportCity
            }
        })

        return NextResponse.json({
            message: "با موفقیت فرودگاه اضافه شد"
        }, { status: 201 })

    } catch (error) {
        return NextResponse.json({
            message: "مشکلی در ثبت ایرلاین به وجود آمد"
        })
    }

}


export const GET = async (request: NextRequest) => {
    const session = await getSession()
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")


    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            message: "ابتدا وارد حساب کاربری خود شوید"
        }, { status: 401})
    }

    try {
        const airports = await prisma.airport.findMany()
        if (airports.length === 0)
            return null
        if (query && query.length > 0) {
            const qAirports = await prisma.airport.findMany({
                where: {
                    name: {
                        contains: query
                    }
                }
            })
            return NextResponse.json(qAirports)
        }
        return NextResponse.json(airports)
    } catch (error) {
        // console.log(error)
        return NextResponse.json({
            message: "خطایی در دریافت لیست فرودگاه ها پیش آمد"
        }, { status: 500 })
    }
}