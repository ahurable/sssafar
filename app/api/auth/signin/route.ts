// app/api/auth/signin/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { verifyPassword, createToken } from "@/lib/auth"
import { signInSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    // console.log("Signin attempt for:", body.identifier)

    // Validate input
    const validatedData = signInSchema.parse(body)

    // Find user by email or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.identifier }, { phone: validatedData.identifier }],
      },
    })

    if (!user) {
      // console.log("User not found:", validatedData.identifier)
      return NextResponse.json({ error: "ایمیل/شماره موبایل یا رمز عبور اشتباه است" }, { status: 401 })
    }

    // Verify password
    const isValid = await verifyPassword(validatedData.password, user.password)
    // console.log("Password valid:", isValid)

    if (!isValid) {
      // console.log("Invalid password for user:", user.id)
      return NextResponse.json({ error: "ایمیل/شماره موبایل یا رمز عبور اشتباه است" }, { status: 401 })
    }

    // Create token
    const token = await createToken({ userId: user.id, role: user.role })
    // console.log("Token created for user:", user.id)

    // Create response
    const response = NextResponse.json({
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

    // Set cookie - SIMPLIFIED
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: false, // Force to false
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    })

    ("✅ Cookie set successfully")
    return response

  } catch (error: any) {
    console.error("[v0] Signin error:", error)
    return NextResponse.json({ error: error.message || "خطا در ورود" }, { status: 500 })
  }
}