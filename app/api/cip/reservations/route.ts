import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { serviceId, firstName, lastName, phoneNumber } = body

    // Validate required fields
    if (!serviceId || !firstName || !lastName || !phoneNumber) {
      return NextResponse.json(
        { error: "تمامی فیلدهای ضروری باید پر شوند" },
        { status: 400 }
      )
    }

    // Validate phone number format
    const phoneRegex = /^09[0-9]{9}$/
    if (!phoneRegex.test(phoneNumber)) {
      return NextResponse.json(
        { error: "شماره موبایل معتبر نیست" },
        { status: 400 }
      )
    }

    // Check if service exists
    const service = await prisma.cipService.findUnique({
      where: { id: serviceId }
    })

    if (!service) {
      return NextResponse.json(
        { error: "خدمت مورد نظر یافت نشد" },
        { status: 404 }
      )
    }

    // Create reservation
    const reservation = await prisma.cipReservation.create({
      data: {
        serviceId,
        firstName,
        lastName,
        phoneNumber,
        status: "PENDING"
      }
    })

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      message: "درخواست رزرو با موفقیت ثبت شد"
    })

  } catch (error: any) {
    console.error("Reservation error:", error)
    return NextResponse.json(
      { error: "خطا در ثبت رزرو" },
      { status: 500 }
    )
  }
}