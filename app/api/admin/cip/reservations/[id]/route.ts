import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Context {
  params: {
    id: string
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()
    const { status } = body

    const validStatuses = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "وضعیت نامعتبر" },
        { status: 400 }
      )
    }

    const reservation = await prisma.cipReservation.update({
      where: { id: context.params.id },
      data: { status },
    })

    return NextResponse.json({
      success: true,
      reservation,
    })

  } catch (error: any) {
    console.error("Update reservation error:", error)
    return NextResponse.json(
      { error: "خطا در بروزرسانی رزرو" },
      { status: 500 }
    )
  }
}