import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
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
      },
    })

    if (!user) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("[v0] Get user error:", error)
    return NextResponse.json({ error: "خطا در دریافت اطلاعات کاربر" }, { status: 500 })
  }
}
