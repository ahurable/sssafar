import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const POST = async (request: NextRequest, { params } : { params : { id: string }}) => {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({
            error: "لطفا ابتدا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    // const requestBody = await request.json()

    const invoice = await prisma.invoice.findUnique({
        where: {
            id: params.id
        },
        select: {
            id: true,
            amount: true
        }
    })

    const userCredit = await prisma.credit.findUnique({
        where: {
            userId: session.userId
        },
        select: {
            balance: true
        }
    })


    if (userCredit && invoice) {

        const balance = userCredit.balance
        const price = parseInt(invoice.amount)

        if ( balance > price ) {

            const newBalance = balance - price

            const updateCredit = await prisma.credit.update({
                where: {
                    userId: session.userId
                },
                data: {
                    balance: newBalance
                }
            })

            const paidInvoice = await prisma.invoice.update({
                where: {
                    id: invoice.id
                }, 
                data: {
                    state: "PAID"
                }
            })

            if (updateCredit && paidInvoice) {
                return NextResponse.json({
                    message: `مبلغ ${price} از اعتبار شما برای پرداخت صورت حساب ${invoice.id} کسر شد`,
                    paidInvoice: paidInvoice
                }, { status: 200 })
            }

            return NextResponse.json({
                message: "مشکلی در تسویه حساب پیش آمد"
            }, { status: 405 })

        }

        return NextResponse.json({
            message: "اعتبار شما کمتر از بهای صورت حساب است لطفا ابتدا اعتبار خود را شارژ کنید"
        }, { status: 400 })

    }

    return NextResponse.json({
        message: "در دریافت اطلاعات صورت حساب و اعتبار شما دچار مشکل شدیم"
    }, { status: 404 })
}

