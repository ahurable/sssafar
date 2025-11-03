// app/api/auth/send-email-verification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ message: 'لطفا وارد شوید' }, { status: 401 })
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

    // Generate verification code (6-digit)
    const verificationCode = Math.floor(100000 + Math.random() * 900000)
    const expireDate = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Delete any existing OTP codes for this user
    await prisma.otpCode.deleteMany({
      where: { userId: session.userId }
    })

    // Create new OTP code
    await prisma.otpCode.create({
      data: {
        code: verificationCode,
        userId: session.userId,
        expireDate: expireDate
      }
    })

    // Send verification email
    await sendVerificationEmail(user.email, verificationCode.toString())

    return NextResponse.json({ 
      message: 'کد تایید به ایمیل شما ارسال شد' 
    })
  } catch (error) {
    console.error('Error sending email verification:', error)
    return NextResponse.json(
      { message: 'خطا در ارسال کد تایید' },
      { status: 500 }
    )
  }
}

// Mock function - replace with your actual email service
async function sendVerificationEmail(email: string, code: string) {
  // Implement your email sending logic here (Nodemailer, SendGrid, etc.)
  console.log(`Verification code for ${email}: ${code}`)
  
  // Example with Nodemailer:
  /*
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  })

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'کد تایید ایمیل',
    html: `
      <div dir="rtl">
        <h2>کد تایید ایمیل</h2>
        <p>کد تایید شما: <strong>${code}</strong></p>
        <p>این کد به مدت ۱۰ دقیقه معتبر است.</p>
      </div>
    `
  })
  */
}