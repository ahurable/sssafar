import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { forgotPasswordSchema } from "@/lib/validations/auth"
import { randomBytes } from "crypto"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = forgotPasswordSchema.parse(body)

    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: validatedData.identifier }, { phone: validatedData.identifier }],
      },
    })

    if (!user) {
      // Don't reveal if user exists or not
      return NextResponse.json({
        success: true,
        message: "اگر حساب کاربری وجود داشته باشد، لینک بازیابی ارسال خواهد شد",
      })
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex")
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save token to database
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry,
      },
    })

    // TODO: Send email/SMS with reset link
    // For now, just return success
    console.log("[v0] Reset token:", resetToken)

    return NextResponse.json({
      success: true,
      message: "لینک بازیابی رمز عبور ارسال شد",
      // In development, return token for testing
      ...(process.env.NODE_ENV === "development" && { resetToken }),
    })
  } catch (error: any) {
    console.error("[v0] Forgot password error:", error)
    return NextResponse.json({ error: error.message || "خطا در بازیابی رمز عبور" }, { status: 500 })
  }
}
