import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createToken, setSession } from "@/lib/auth"
import { signInSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = signInSchema.parse(body)

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.identifier }, { phone: validatedData.identifier }],
      },
    })

    if (!user) {
      return NextResponse.json({ error: "ایمیل/شماره موبایل یا رمز عبور اشتباه است" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(validatedData.password, user.password)

    if (!isValid) {
      return NextResponse.json({ error: "ایمیل/شماره موبایل یا رمز عبور اشتباه است" }, { status: 401 })
    }

    // Create token and set session
    const token = await createToken({ userId: user.id, role: user.role })
    await setSession(token)

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone: user.phone,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    })
  } catch (error: any) {
    console.error("[v0] Signin error:", error)
    return NextResponse.json({ error: error.message || "خطا در ورود" }, { status: 500 })
  }
}
