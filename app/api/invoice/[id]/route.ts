import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const GET = async (request: NextRequest, { params }: { params : { id : string } }) => {

    const session = await getSession()

    if (!session) {
        return NextResponse.json({
            error: "لطفا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    try {

        const invoice = await prisma.invoice.findUnique({
            where: {
                id: params.id
            }
        })
        
        if (invoice) {
            return NextResponse.json({
                ...invoice
            }, { status: 200 })
        }

        return NextResponse.json({
            error: "صورت حسابی پیدا نشد"
        }, { status: 404 })

    } catch {
        return NextResponse.json({
            error: "مشکلی در سمت سرور ایجاد شد"
        }, { status: 500 })
    }

}