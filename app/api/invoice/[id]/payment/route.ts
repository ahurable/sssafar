import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export const DELETE = async (request: NextRequest, { params } : { params: { id: string }}) => {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({
            message:"ابتدا وارد حساب کاربری خود شوید"
        }, { status: 403 })
    }

    const cancelePayment = await prisma.invoice.update({
        where : {
            id: params.id
        },
        data: {
            state: "CANCELLED"
        },
        select: {
            amount: true
        }
    })

    const chargeCredit = await prisma.credit.update({
        where: {
            userId: session.userId
        }, 
        data: {
            balance: {
                increment: parseInt(cancelePayment.amount)
            }
        }
    })

    if (cancelePayment && chargeCredit) {
        return NextResponse.json({
            message: "بلیط کنسل شد"
        }, { status: 200 })
    }

    return NextResponse.json({
        message: "خطا در لغو صورت حساب"
    })

}