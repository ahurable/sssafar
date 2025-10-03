import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { hashPassword } from "@/lib/auth"
import { resetPasswordSchema } from "@/lib/validations/auth"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validatedData = resetPasswordSchema.parse(body)

    // Find user with valid token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: validatedData.token,
        resetTokenExpiry: {
          gt: new Date(),
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "توکن نامعتبر یا منقضی شده است" }, { status: 400 })
    }

    // Hash new password
    const hashedPassword = await hashPassword(validatedData.password)

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })

    return NextResponse.json({
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد",
    })
  } catch (error: any) {
    console.error("[v0] Reset password error:", error)
    return NextResponse.json({ error: error.message || "خطا در تغییر رمز عبور" }, { status: 500 })
  }
}
