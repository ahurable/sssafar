import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (request: NextRequest) => {

    const session = await getSession()

    if (!session) {
        return NextResponse.json({
            message: "ابتدا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    try {

        const bookings = await prisma.booking.findMany({
            where: {
                userId: session.userId
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        if (bookings.length == 0) {
            return NextResponse.json({
                message: "رزروی برای شما یافت نشد"
            }, { status: 404 })
        }

        return NextResponse.json(
            bookings,
            { status: 200 }
        )

    } catch (err) {
        console.log(err)
        return NextResponse.json({
            message: "خطایی در سرور رخ داد"
        }, { status: 500 })
    }

}