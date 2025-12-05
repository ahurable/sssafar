import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";



export const POST = async (request: NextRequest) => {

    const session = await getSession()
    if (!session) {
        return NextResponse.json({
            message: "ابتدا شما باید وارد حساب کاربری خود شوید"
        }, { status: 403 })
    }

    try {
        const { cardNumber, shabaCode, cardName } = await request.json()
        if (!cardNumber || !shabaCode || !cardName)
            return NextResponse.json({
                message: "لطفا اطلاعات خواسته شده را کامل وارد کنید"
            }, { status: 401 })

        const card = await prisma.creditCard.create({
            data: {
                cardNumber,
                cardShaba: shabaCode,
                fullName: cardName,
                user: {
                    connect: {
                        id: session.userId
                    }
                }
            }
        })
        return NextResponse.json(card, { status: 201 })
    } catch (error) {
        console.log("Error raised : ", error)
        return NextResponse.json({
            message: "خطای سیستمی"
        }, { status: 500 })
    }

}


export const GET = async (request: NextRequest) => {
    const session = await getSession()
    if (!session)
        return NextResponse.json({
            message: "ابتدا باید وارد حساب کاربری خود شوید"
        }, { status: 401 })

    try {
        const card = await prisma.creditCard.findFirst({
            where: {
                userId: session.userId
            }
        })
        if (!card) {
            return NextResponse.json({
                message: "هنوز کارت بانکی خود را ثبت نکرده اید نسبت به ثبت آن جهت عملیات استرداد و بازگشت وجه اقدام نمائید"
            }, { status: 404 })
        }
        return NextResponse.json(card, { status: 200 })
    } catch (errr) {
        console.log(errr)
        return NextResponse.json({
            message: "خطایی در سیستم رخ داد"
        }, { status: 500 })
    }
}