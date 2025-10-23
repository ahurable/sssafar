import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";


export const GET = async (request: NextRequest, {params} : {params:{id:string}}) => {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({
            message: "لطفا ابتدا وارد حساب کاربری خود شوید"
        })
    }

    const panelUser = await prisma.panelUser.findFirst({
        where: {
            panelId: params.id,
            userId: session.userId
        },
        select: {
            user: {
                select: {
                    firstName: true,
                    lastName: true
                }
            },
            userId: true,
            role: true
        }
    })

    if (!panelUser) {
        return NextResponse.json({
            message: "دسترسی به این صفحه برای شما مجاز نمی باشد"
        }, { status: 403 })
    }

    return NextResponse.json({...panelUser}, { status: 200 })
}