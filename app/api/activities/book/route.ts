import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export const POST = async (request: NextRequest) => {

    try {
        const body = await request.json()

        if (!body.invoiceId) {
            return NextResponse.json({
                message: "در پردازش پرداخت صورت حساب شما مشکلی پیش آمد"
            }, { status: 400 })
        }
        
        const invoice = await prisma.invoice.findUnique({
            where: {
                id: body.invoiceId
            }
        })

        if (!invoice) {
            return NextResponse.json({
                message: "صورت حساب یافت نشد"
            }, { status: 404 })
        }

        if (!invoice.order) {
            return NextResponse.json({
                message: "مقدار سفارش شما در صورت حساب تعیین نشده است"
            }, { status: 400 })
        }

        const bookTour = await prisma.booking.create({
            data: {
                bookingCode: invoice.id,
                user: {
                    connect: {
                        id: invoice.userId
                    }
                },
                totalPrice: parseInt(invoice.amount),
                bookingInformation: JSON.stringify(invoice.order),
                type: "ACTIVITY",
                status: "PENDING",
                data: {
                    Success: true
                }
            }
        })

        interface Traveler {
            firstName: string;
            lastName: string;
            phoneNumber: string;
            passengerType: string;
            nationalId: string;
        }

        interface Order {
            tourId: string;
        }

        const travelersData = invoice.travelers && typeof invoice.travelers === 'string' 
        ? JSON.parse(invoice.travelers) as unknown as Traveler[]
        : invoice.travelers as unknown as Traveler[];

        const orderData = invoice.order && typeof invoice.order === "string" 
        ? JSON.parse(invoice.order) as unknown as Order 
        : invoice.order as unknown as Order

        const reservation = await prisma.reservation.create({
            data: {
                firstName: travelersData[0].firstName,
                lastName: travelersData[0].lastName,
                phoneNumber: travelersData[0].phoneNumber,
                cityTour: {
                    connect: {
                        id: orderData.tourId
                    }
                }
            }
        });

        return NextResponse.json({
            message: "با موفقیت صورت حساب شما پرداخت شد و درخواست شما برای کارشناسان ما ارسال گردید"
        }, { status: 200 })
    } catch (error) {
        NextResponse.json({
            message:"خطایی از سمت سرور رخ داد",
            error: error
        }, { status: 500 })
    }

}