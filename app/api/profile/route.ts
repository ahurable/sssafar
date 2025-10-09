import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updateProfileSchema } from "@/lib/validations/user"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: {
        panelUser: true,
        createdPanels: {
          where: {
            adminId: session.userId
          }
        },
        userCredit: true
      }
    })

    return NextResponse.json({ user })
  } catch (error: any) {
    console.error("Get profile error:", error)
    return NextResponse.json({ error: "خطا در دریافت پروفایل" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateProfileSchema.parse(body)

    // Check if national ID is already taken by another user
    if (validatedData.nationalId) {
      const existingUser = await prisma.user.findFirst({
        where: {
          nationalId: validatedData.nationalId,
          NOT: { id: session.userId },
        },
      })

      if (existingUser) {
        return NextResponse.json({ error: "این کد ملی قبلا ثبت شده است" }, { status: 400 })
      }
    }

    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        ...validatedData,
        dateOfBirth: validatedData.dateOfBirth ? new Date(validatedData.dateOfBirth) : undefined,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        nationalId: true,
        address: true,
        postalCode: true,
        city: true,
        province: true,
        dateOfBirth: true,
        userCredit: true
      }
    })

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    console.error("[v0] Update profile error:", error)
    return NextResponse.json({ error: error.message || "خطا در به‌روزرسانی پروفایل" }, { status: 500 })
  }
}
