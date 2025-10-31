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
        console.log("✅ RAW travelers data received:", JSON.stringify(body.travelers, null, 2))
        console.log("✅ Order data:", body.order)

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

        // Flight-specific validation
        if (body.kind === "FLIGHT" && !body.flightSourceCode) {
            return NextResponse.json({
                error: "سورس کد پرواز در دسترس نیست"
            }, { status: 400 })
        }

        // Hotel-specific validation
        if (body.kind === "HOTEL" && !body.order?.FareSourceCode) {
            return NextResponse.json({
                error: "سورس کد هتل در دسترس نیست"
            }, { status: 400 })
        }

        if (body.kind === "HOTEL" && !body.order?.HotelId) {
            return NextResponse.json({
                error: "شناسه هتل در دسترس نیست"
            }, { status: 400 })
        }

        const expireAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        // Validate travelers based on invoice type
        for (const traveler of body.travelers) {
            if (!traveler.email && !traveler.phoneNumber) {
                return NextResponse.json({
                    message: 'اطلاعات شماره همراه یا ایمیل مسافر را وارد نمایید'
                }, { status: 400 })
            }

            // Flight-specific validations
            if (body.kind === "FLIGHT" && body.area == "intl") {
                if (!traveler.passportNumber || traveler.passportNumber.length === 0) {
                    return NextResponse.json({
                        message: "لطفا از صحت شماره پاسپورت خود برای پرواز خارجی اطمینان حاصل نمائید"
                    }, { status: 400 })
                }
            }

            // Hotel-specific validations
            if (body.kind === "HOTEL") {
                if (!traveler.nationalId) {
                    return NextResponse.json({
                        message: "کد ملی مسافر الزامی است"
                    }, { status: 400 })
                }
            }
        }

        // Create invoice
        const createdInvoice = await prisma.invoice.create({
            data: {
                kind: body.kind,
                amount: body.amount.toString(),
                travelers: body.travelers,
                order: body.order, // This contains hotel details for hotel invoices
                state: "WAITING",
                flightSourceCode: body.flightSourceCode || null,
                flightType: body.flightType || null,
                selectedServices: body.selectedServices || null,
                userId: session.userId,
                type: "NO", 
                expireAt: expireAt
            }
        })

        console.log("✅ Invoice created with ID:", createdInvoice.id)
        console.log("✅ Invoice type:", body.kind)

        // Fetch the exact data that was saved to verify
        const verifiedInvoice = await prisma.invoice.findUnique({
            where: { id: createdInvoice.id },
            select: { travelers: true, order: true }
        })

        console.log("✅ VERIFIED travelers data from database:", JSON.stringify(verifiedInvoice?.travelers, null, 2))
        console.log("✅ VERIFIED order data from database:", JSON.stringify(verifiedInvoice?.order, null, 2))

        return NextResponse.json({
            success: "صورت حساب با موفقیت ایجاد شد نسبت به پرداخت آن اقدام نمایید",
            invoiceId: createdInvoice.id
        }, { status: 201 })

    } catch (error) {
        console.error("❌ Error creating invoice:", error)
        
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