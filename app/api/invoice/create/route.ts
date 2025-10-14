import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (request: NextRequest) => {
    const session = await getSession()

    if (!session) {
        return NextResponse.json({
            error: "شما ابتدا باید وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    try {
        const body = await request.json()
        console.log("Invoice creation request:", body)

        // Validate required fields
        if (!body.kind) {
            return NextResponse.json({
                error: "نوع صورت حساب مشخص نیست"
            }, { status: 400 })
        }

        if (!body.amount) {
            return NextResponse.json({
                error: "مبلغ صورت حساب مشخص نیست"
            }, { status: 400 })
        }

        if (!body.travelers || !Array.isArray(body.travelers) || body.travelers.length === 0) {
            return NextResponse.json({
                error: "لیست مسافران مشخص نیست"
            }, { status: 400 })
        }

        if (body.kind === "FLIGHT" && !body.flightSourceCode) {
            return NextResponse.json({
                error: "سورس کد پرواز در دسترس نیست"
            }, { status: 400 })
        }

        const expireAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes in milliseconds


        // Create invoice with proper error handling
        const createdInvoice = await prisma.invoice.create({
            data: {
                kind: body.kind,
                amount: body.amount.toString(),
                travelers: body.travelers, 
                state: "WAITING",
                flightSourceCode: body.flightSourceCode || null,
                flightType: body.flightType || null,
                selectedServices: body.selectedServices || null,
                userId: session.userId,
                type: "NO", 
                expireAt: expireAt
            }
        })

        console.log("Invoice created successfully:", createdInvoice)

        return NextResponse.json({
            success: "صورت حساب با موفقیت ایجاد شد نسبت به پرداخت آن اقدام نمایید",
            invoiceId: createdInvoice.id
        }, { status: 201 })

    } catch (error) {
        console.error("Error creating invoice:", error)
        
        // More specific error handling
        if (error instanceof Error) {
            if (error.message.includes("Unique constraint")) {
                return NextResponse.json({
                    error: "صورت حساب تکراری است"
                }, { status: 400 })
            }
            
            if (error.message.includes("Foreign key constraint")) {
                return NextResponse.json({
                    error: "کاربر معتبر نیست"
                }, { status: 400 })
            }
        }

        return NextResponse.json({
            error: "مشکلی در ایجاد صورت حساب پیش آمد"
        }, { status: 500 })
    }
}