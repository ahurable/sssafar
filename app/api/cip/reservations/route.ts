import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, serviceId, travelers, type, order } = await request.json()
    console.log(`
      invoiceId: ${invoiceId},
      serviceId: ${serviceId},
      travelers: ${travelers},
      type: ${type},
      order: ${order}
      `)
    if (!invoiceId || !serviceId || !travelers || !type || !order ) {
      return NextResponse.json({
        message: "خطا! اطلاعات وارد شده ناقص میباشد"
      }, { status: 400 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId
      }
    })

    const service = await prisma.cipService.findUnique({
      where: {
        id: serviceId
      }
    })


    if ( !invoice || !service )
      return NextResponse.json({
        message: "خطا در دریافت اطلاعات از سمت سرور ، دوباره سفارش دهید اعتبار شما برگردانده شد"
      }, {status: 400})

    const reservation = await prisma.reservation.create({
      data: {
        firstName: travelers[0].firstName,
        lastName: travelers[0].lastName,
        phoneNumber: travelers[0].phoneNumber,
        serviceId: serviceId,
        search: order
      }
    })

    const book = await prisma.booking.create({
      data: {
        bookingCode: serviceId,
        bookingInformation: JSON.stringify({
          traveler: travelers[0], 
          order: {...order, service: service.title}, 
          firstName: travelers[0].firstName, 
          lastName: travelers[0].lastName
        }),
        totalPrice: parseInt(invoice.amount),
        status: "CONFIRMED",
        type: "CIP",
        user: {
          connect: {
            id: invoice.userId
          }
        },
        data: JSON.stringify({invoice: invoiceId})
      }
    })

    return NextResponse.json({...reservation, ...book}, { status: 200 })
  } catch (error) {
    console.log(`[Error debugger] Error is : ${error}`)
    return NextResponse.json({
      message: "خطایی از سمت سرور حین ثبت درخواست شما به وجود آمد"
    }, { status: 500 })
  }
}