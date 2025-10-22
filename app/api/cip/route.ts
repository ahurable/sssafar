import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cipServiceSchema } from "@/lib/validations/cip"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get("published")
    
    const services = await prisma.cipService.findMany({
      where: published ? { published: published === "true" } : undefined,
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ],
    })

    return NextResponse.json({ services })
  } catch (error: any) {
    console.error("Error fetching CIP services:", error)
    return NextResponse.json(
      { error: "خطا در دریافت خدمات CIP" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = cipServiceSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .trim() + "-" + Date.now()

    const service = await prisma.cipService.create({
      data: {
        ...validatedData,
        slug,
      },
    })

    return NextResponse.json({
      success: true,
      service,
    })
  } catch (error: any) {
    console.error("Create CIP service error:", error)
    return NextResponse.json(
      { error: error.message || "خطا در ایجاد خدمت CIP" },
      { status: 500 }
    )
  }
}