import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/invoice - Get all invoices for the current user
export const GET = async (request: NextRequest) => {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({
            error: "شما ابتدا باید وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    try {
        const invoices = await prisma.invoice.findMany({
            where: {
                userId: session.userId
            },
            select: {
                id: true,
                kind: true,
                amount: true,
                state: true,
                flightType: true,
                flightSourceCode: true,
                hotelIdentifier: true,
                trainIdentifier: true,
                travelers: true,
                selectedServices: true,
                type: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'desc' // Show newest invoices first
            }
        })

        if (invoices && invoices.length > 0) {
            return NextResponse.json({
                invoices: invoices
            }   , { status: 200 })
        }
        
        return NextResponse.json({
            message: "صورت حسابی یافت نشد"
        }, { status: 404 })

    } catch (error) {
        console.error("Error fetching invoices:", error)
        
        return NextResponse.json({
            error: "مشکلی در دریافت صورت حساب‌ها پیش آمد"
        }, { status: 500 })
    }
}