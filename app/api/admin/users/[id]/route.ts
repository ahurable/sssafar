import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        nationalId: true,
        address: true,
        postalCode: true,
        city: true,
        province: true,
        dateOfBirth: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true,
        updatedAt: true,
        bookings: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "خطا در دریافت کاربر" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()

    const user = await prisma.user.update({
      where: { id: params.id },
      data: {
        role: body.role,
        emailVerified: body.emailVerified,
        phoneVerified: body.phoneVerified,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
        emailVerified: true,
        phoneVerified: true,
      },
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    console.error("[v0] Update user error:", error)
    return NextResponse.json({ error: "خطا در به‌روزرسانی کاربر" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    // Prevent deleting yourself
    if (session.userId === params.id) {
      return NextResponse.json({ error: "نمی‌توانید خودتان را حذف کنید" }, { status: 400 })
    }

    await prisma.user.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "کاربر با موفقیت حذف شد",
    })
  } catch (error: any) {
    console.error("[v0] Delete user error:", error)
    return NextResponse.json({ error: "خطا در حذف کاربر" }, { status: 500 })
  }
}
