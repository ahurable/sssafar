// app/api/visa/reservations/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { visaId, firstName, lastName, phoneNumber } = body

    // Validate required fields
    if (!visaId || !firstName || !lastName || !phoneNumber) {
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

    // Check if visa service exists
    const visaService = await prisma.visaService.findUnique({
      where: { id: visaId }
    })

    if (!visaService) {
      return NextResponse.json(
        { error: "خدمت ویزای مورد نظر یافت نشد" },
        { status: 404 }
      )
    }

    // Create reservation
    const reservation = await prisma.reservation.create({
      data: {
        visaId,
        firstName,
        lastName,
        phoneNumber,
        status: "PENDING"
      }
    })

    return NextResponse.json({
      success: true,
      reservationId: reservation.id,
      message: "درخواست ویزا با موفقیت ثبت شد"
    })

  } catch (error: any) {
    console.error("Visa reservation error:", error)
    return NextResponse.json(
      { error: "خطا در ثبت درخواست ویزا" },
      { status: 500 }
    )
  }
}