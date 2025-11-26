import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"


interface Order {
  serviceId: string
  date: string
  price: number
  title: string
  serviceType: string
  passengers: number
  airport: string
}

interface Traveler {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  passengerType: string;
  nationalId: string;
}
export async function POST(request: NextRequest) {
  try {
    const { invoiceId } = await request.json()
    // console.log(`
      invoiceId: ${invoiceId}
      `)
    if (!invoiceId ) {
      return NextResponse.json({
        message: "خطا! اطلاعات وارد شده ناقص میباشد"
      }, { status: 400 })
    }

    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId
      }
    })

    if (!invoice || !invoice.order || !invoice.travelers) {
      return NextResponse.json({
        message: "اطلاعات وارد شده ناقص است"
      }, { status: 400 })
    }

    const order = typeof invoice.order === "string" ?
    JSON.stringify(invoice.order) as unknown as Order
    : invoice.order as unknown as Order

    const travelers = typeof invoice.travelers === "string" ?
    JSON.stringify(invoice.travelers) as unknown as Traveler[]
    : invoice.travelers as unknown as Traveler[]


    const service = await prisma.cipService.findUnique({
      where: {
        id: order.serviceId,
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
        serviceId: order.serviceId,
        search: JSON.stringify(order)
      }
    })

    const book = await prisma.booking.create({
      data: {
        bookingCode: invoiceId,
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
        data: {invoice: invoiceId, Success: true}
      }
    })

    return NextResponse.json({...reservation, ...book}, { status: 200 })
  } catch (error) {
    // console.log(`[Error debugger] Error is : ${error}`)
    return NextResponse.json({
      message: "خطایی از سمت سرور حین ثبت درخواست شما به وجود آمد"
    }, { status: 500 })
  }
}