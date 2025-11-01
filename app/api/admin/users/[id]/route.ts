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

    // Validate required fields
    if (!body.role) {
      return NextResponse.json({ error: "نقش کاربر الزامی است" }, { status: 400 })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: "کاربر یافت نشد" }, { status: 404 })
    }

    // Check for unique constraints if email/phone is being updated
    if (body.email && body.email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: body.email },
      })
      if (emailExists) {
        return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است" }, { status: 400 })
      }
    }

    if (body.phone && body.phone !== existingUser.phone) {
      const phoneExists = await prisma.user.findUnique({
        where: { phone: body.phone },
      })
      if (phoneExists) {
        return NextResponse.json({ error: "این شماره تلفن قبلاً ثبت شده است" }, { status: 400 })
      }
    }

    if (body.nationalId && body.nationalId !== existingUser.nationalId) {
      const nationalIdExists = await prisma.user.findUnique({
        where: { nationalId: body.nationalId },
      })
      if (nationalIdExists) {
        return NextResponse.json({ error: "این کد ملی قبلاً ثبت شده است" }, { status: 400 })
      }
    }

    // Prepare update data
    const updateData: any = {
      role: body.role,
      emailVerified: body.emailVerified,
      phoneVerified: body.phoneVerified,
      firstName: body.firstName || null,
      lastName: body.lastName || null,
      nationalId: body.nationalId || null,
      address: body.address || null,
      postalCode: body.postalCode || null,
      city: body.city || null,
      province: body.province || null,
    }

    // Only update email if provided and different
    if (body.email !== undefined) {
      updateData.email = body.email || null
    }

    // Only update phone if provided and different
    if (body.phone !== undefined) {
      updateData.phone = body.phone || null
    }

    // Handle date of birth
    if (body.dateOfBirth) {
      updateData.dateOfBirth = new Date(body.dateOfBirth)
    } else {
      updateData.dateOfBirth = null
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
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
          take: 5,
          select: {
            id: true,
            type: true,
            status: true,
            bookingCode: true,
            totalPrice: true,
            currency: true,
            createdAt: true,
          },
        },
        posts: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            title: true,
            slug: true,
            published: true,
            featured: true,
            views: true,
            createdAt: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: "اطلاعات کاربر با موفقیت به‌روزرسانی شد",
      user,
    })
  } catch (error: any) {
    console.error("[v0] Update user error:", error)

    // Handle Prisma unique constraint errors
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0]
      if (field === "email") {
        return NextResponse.json({ error: "این ایمیل قبلاً ثبت شده است" }, { status: 400 })
      }
      if (field === "phone") {
        return NextResponse.json({ error: "این شماره تلفن قبلاً ثبت شده است" }, { status: 400 })
      }
      if (field === "nationalId") {
        return NextResponse.json({ error: "این کد ملی قبلاً ثبت شده است" }, { status: 400 })
      }
    }

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
