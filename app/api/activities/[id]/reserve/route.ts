import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const POST = async ( request: NextRequest, params : { id : string }) => {
    const { firstName, lastName, phoneNumber, description } = await request.json()

    try {
        await prisma.reservation.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                notes: description,
                cityTourId: params.id
            }
        })
        return NextResponse.json({
            message: "درخواست  شما باموفقیت در سیستم ثبت شد کارشناسان ما به زودی با شما تماس میگیرند"
        }, { status: 201 })
    } catch {
        return NextResponse.json({
            message: "در ثبت درخواست رزرو شما مشکلی پیش آمد"
        }, { status: 500 })
    }
}