import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { travelerSchema } from "@/lib/validations/traveler";


export async function GET(request: NextRequest) {
    const session = await getSession()
    if (!session) {
        return NextResponse.json({
            error: "لطفا وارد حساب شوید"
        }, {status:401})
    }
    
    try {
        const travelers = await prisma.traveler.findMany({
            where: {
                userId: session.userId
            }
        })
        return NextResponse.json({
            travelers
        }, { status: 200 })
    } catch {
        return NextResponse.json({
            error: "خطا در دریافت اطلاعات مسافران"
        }, {status:500})
    }
}