import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cipServiceSchema } from "@/lib/validations/cip"

interface Context {
  params: {
    id: string
  }
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const service = await prisma.cipService.findUnique({
      where: { id: context.params.id },
    })

    if (!service) {
      return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error("Error fetching CIP service:", error)
    return NextResponse.json(
      { error: "خطا در دریافت خدمت CIP" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = cipServiceSchema.parse(body)

    const service = await prisma.cipService.update({
      where: { id: context.params.id },
      data: validatedData,
    })

    return NextResponse.json({
      success: true,
      service,
    })
  } catch (error: any) {
    console.error("Update CIP service error:", error)
    return NextResponse.json(
      { error: error.message || "خطا در بروزرسانی خدمت CIP" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    await prisma.cipService.delete({
      where: { id: context.params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete CIP service error:", error)
    return NextResponse.json(
      { error: "خطا در حذف خدمت CIP" },
      { status: 500 }
    )
  }
}