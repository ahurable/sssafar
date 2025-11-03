// app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ message: 'لطفا وارد شوید' }, { status: 401 })
    }

    const { verificationCode } = await req.json()

    if (!verificationCode) {
      return NextResponse.json({ message: 'کد تایید الزامی است' }, { status: 400 })
    }

    // Convert verification code to number
    const codeNumber = parseInt(verificationCode)

    if (isNaN(codeNumber)) {
      return NextResponse.json({ message: 'کد تایید باید عددی باشد' }, { status: 400 })
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.userId }
    })

    if (!user?.email) {
      return NextResponse.json({ message: 'لطفا ابتدا ایمیل خود را اضافه کنید' }, { status: 400 })
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'ایمیل شما قبلا تایید شده است' }, { status: 400 })
    }

    // Find valid OTP code
    const otpCode = await prisma.otpCode.findFirst({
      where: {
        userId: session.userId,
        code: codeNumber,
        expireDate: {
          gt: new Date()
        }
      }
    })

    if (!otpCode) {
      return NextResponse.json({ message: 'کد تایید نامعتبر یا منقضی شده است' }, { status: 400 })
    }

    // Update user email verification status
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        emailVerified: true
      }
    })

    // Delete used OTP code
    await prisma.otpCode.delete({
      where: { id: otpCode.id }
    })

    return NextResponse.json({ 
      message: 'ایمیل شما با موفقیت تایید شد' 
    })
  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { message: 'خطا در تایید ایمیل' },
      { status: 500 }
    )
  }
}