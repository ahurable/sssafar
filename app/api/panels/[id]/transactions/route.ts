import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export const GET = async (request: NextRequest, { params} : { params: { id : string }}) => {


    const session = await getSession()
    const isAdmin = await prisma.panelUser.findFirst({ where: { panelId: params.id, userId: session?.userId } })

    if (!session || session && !isAdmin) {
        return NextResponse.json({
            message: "ابتدا وارد حساب کاربری خود شوید"
        }, { status: 403 })
    }
    try {
        
        const transactions = await prisma.panelCreditTransaction.findMany({
            where: {
                panelId: params.id
            },
            include: {
                approvals: {
                    select: {
                        panelUser: {
                            select: {
                                user: {
                                    select: {
                                        id: true,
                                        firstName: true,
                                        lastName: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        return NextResponse.json(transactions, { status: 200 })

    } catch {

        return NextResponse.json({
            message: "مشکلی در حین دریافت اطلاعات تراکنش ها پیش آمد"
        }, { status: 500 })

    }

}