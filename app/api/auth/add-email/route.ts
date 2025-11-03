// app/api/auth/add-email/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ message: 'لطفا وارد شوید' }, { status: 401 })
    }

    const { email } = await req.json()

    if (!email) {
      return NextResponse.json({ message: 'ایمیل الزامی است' }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'فرمت ایمیل نامعتبر است' }, { status: 400 })
    }

    // Check if email already exists for another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        id: { not: session.userId }
      }
    })

    if (existingUser) {
      return NextResponse.json({ message: 'این ایمیل قبلا استفاده شده است' }, { status: 400 })
    }

    // Update user with new email (unverified)
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        email: email.toLowerCase(),
        emailVerified: false
      }
    })

    return NextResponse.json({ 
      message: 'ایمیل با موفقیت اضافه شد. لطفا ایمیل خود را تایید کنید.' 
    })
  } catch (error) {
    console.error('Error adding email:', error)
    return NextResponse.json(
      { message: 'خطا در افزودن ایمیل' },
      { status: 500 }
    )
  }
}