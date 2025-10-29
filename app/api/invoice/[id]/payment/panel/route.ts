import { NextResponse, NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export const POST = async (request: NextRequest, { params } : { params: { id: string }}) => {
    const session = await getSession()
    const body = await request.json()
    if (!session) {
        return NextResponse.json({
            message: "لطفا ابتدا وارد حساب کاربری خود شوید"
        }, { status: 403})
    }
    try {
        if (body.panelId) {
            const invoice = await prisma.invoice.findUnique({
                where: {
                    id: params.id
                },
                select: {
                    id: true,
                    amount: true
                }
            })
            const panelMember = await prisma.membersOnPanel.findFirst({
                where: {
                    id: body.panelId,
                    userId: session.userId
                },
                select: {
                    id: true,
                    credit: true
                }
            })
            console.log(body.panelId)
            console.log(panelMember)
            if (!panelMember || !invoice) {
                return NextResponse.json({
                    message: "شما عضو این پنل نیستید"
                }, { status: 500 })
            }
            if (panelMember.credit > parseInt(invoice.amount)) {
                const newBalance = panelMember.credit - parseInt(invoice.amount)
                const updatePanelMemberBalance = await prisma.membersOnPanel.update({
                    where: {
                        id: panelMember.id
                    },
                    data: {
                        credit: newBalance
                    }
                })
                const updateInvoice = await prisma.invoice.update({
                    where: {
                        id: invoice.id
                    },
                    data: {
                        state: "PAID"
                    }
                })
                if (updatePanelMemberBalance && updateInvoice) {
                    return NextResponse.json({
                        message: "پرداخت با موفقیت انجام شد و اعتبار از پنل شما کسر شد"
                    }, { status: 200 })
                }
            } else {
                return NextResponse.json({
                    message: "اعتبار پنل شما برای این خرید کافی نمی باشد"
                }, { status: 403 })
            }
        }
    } catch {
        return NextResponse.json({
            message: 'در پردازش اطلاعات پرداخت با پنل شما مشکلی پیش آمد'
        })
    }
}