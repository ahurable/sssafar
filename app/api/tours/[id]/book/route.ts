import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async ( request: NextRequest,  { params }: { params: { id: string }} ) => {
    const { searchParams } = new URL(request.url)
    const firstName = searchParams.get('firstName')
    const lastName = searchParams.get('lastName')

    const phoneNumber = searchParams.get('phoneNumber')

    if ( !firstName  )
        return NextResponse.json({
            message: "نام خود را وارد کنید"
        }, { status: 400 })
     if ( !lastName )
        return NextResponse.json({
            message: "نام خانوادگی خود را وارد کنید"
        }, { status: 400 })
    if (!phoneNumber) 
        return NextResponse.json({
            message: "شماره همراه خود را وارد کنید"
        }, { status: 400 })
    try {
        const reservation = await prisma.reservation.create({
            data: {
                firstName: firstName,
                lastName: lastName,
                phoneNumber: phoneNumber,
                tourId: params.id
            }
        })

        return NextResponse.json({
            message: "درخواست شما با موفقیت ثبت شد ، پس از مشاهده ، کارشناسان با شما تماس میگیرند."
        }, { status: 201 })
    } catch (err) {
        // console.log('error raised : ', err)
        return NextResponse.json({
            message: "خطایی رخ داد"
        }, { status: 500 })
    }

}