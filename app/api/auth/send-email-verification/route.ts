// app/api/auth/send-email-verification/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

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

async function sendVerificationEmail(email: string, code: string) {
  // Create transporter based on environment
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || process.env.EMAIL_USER,
      pass: process.env.SMTP_PASSWORD || process.env.EMAIL_PASS,
    },
  })

  const mailOptions = {
    from: process.env.EMAIL_FROM || `"${process.env.APP_NAME || 'App'}" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'کد تایید ایمیل - Verification Code',
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">تایید ایمیل</h2>
        <p style="font-size: 16px; color: #555;">کاربر گرامی،</p>
        <p style="font-size: 16px; color: #555;">برای تکمیل فرآیند ثبت‌نام و تایید ایمیل خود، از کد زیر استفاده کنید:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; color: #007bff; letter-spacing: 5px;">${code}</span>
        </div>
        
        <p style="font-size: 14px; color: #888;">این کد به مدت <strong>۱۰ دقیقه</strong> معتبر است.</p>
        <p style="font-size: 14px; color: #888;">اگر این درخواست توسط شما ارسال نشده است، لطفا این ایمیل را نادیده بگیرید.</p>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        
        <div style="text-align: left; direction: ltr;">
          <p style="font-size: 14px; color: #888;">Email Verification Code</p>
          <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin: 10px 0;">
            <code style="font-size: 18px; font-weight: bold;">${code}</code>
          </div>
          <p style="font-size: 12px; color: #888;">This code will expire in 10 minutes.</p>
        </div>
      </div>
    `,
  }

  try {
    const info = await transporter.sendMail(mailOptions)
    console.log(`Verification email sent to ${email}: ${info.messageId}`)
    return info
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send verification email')
  }
}