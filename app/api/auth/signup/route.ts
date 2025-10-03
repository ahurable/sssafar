import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword, createToken, setSession } from "@/lib/auth"
import { signUpSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signUpSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.email || undefined }, { phone: validatedData.phone || undefined }],
      },
    })

    if (existingUser) {
      return NextResponse.json({ error: "کاربر با این ایمیل یا شماره موبایل قبلا ثبت‌نام کرده است" }, { status: 400 })
    }

    // Hash password
    const hashedPassword = await hashPassword(validatedData.password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        role: true,
        firstName: true,
        lastName: true,
      },
    })

    // Create token and set session
    const token = await createToken({ userId: user.id, role: user.role })
    await setSession(token)

    return NextResponse.json({
      success: true,
      user,
    })
  } catch (error: any) {
    console.error("[v0] Signup error:", error)
    return NextResponse.json({ error: error.message || "خطا در ثبت‌نام" }, { status: 500 })
  }
}
