import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (request: NextRequest) => {
    const session = await getSession()
    const body = await request.json()
    if (!session) {
        return NextResponse.json({
            message: "ابتدا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }
    if (!body.phoneNumber) {
        return NextResponse.json({
            message: "شماره همراه خود را به درستی وارد کنید"
        })
    } 

    const updatedUser = await prisma.user.update({
        where: {
            id: session.userId
        }, data: {
            phone: body.phoneNumber
        }
    })

    if (updatedUser) {
        return NextResponse.json({
            message: "شماره همراه شما با موفقیت اضافه شد نسبت به تایید آن اقدام کنید"
        }, { status: 200 })
    }

    return NextResponse.json({
        message: "در افزودن شماره همراه شما مشکلی از سمت سرور رخ داد"
    }, { status: 500 })

} 