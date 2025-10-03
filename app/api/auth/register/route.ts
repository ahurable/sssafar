// app/api/auth/register/route.ts
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { hash } from 'bcrypt'

export async function POST(request: Request) {
  try {
    const { email, phone, password } = await request.json()

    // Validate that at least one of email or phone is provided
    if (!email && !phone) {
      return NextResponse.json(
        { error: 'Either email or phone must be provided' },
        { status: 400 }
      )
    }

    // Validate password
    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      )
    }

    // Check if user already exists with this email
    if (email) {
      const existingUserByEmail = await prisma.user.findUnique({
        where: { email }
      })
      if (existingUserByEmail) {
        return NextResponse.json(
          { error: 'User with this email already exists' },
          { status: 400 }
        )
      }
    }

    // Check if user already exists with this phone
    if (phone) {
      const existingUserByPhone = await prisma.user.findUnique({
        where: { phone }
      })
      if (existingUserByPhone) {
        return NextResponse.json(
          { error: 'User with this phone number already exists' },
          { status: 400 }
        )
      }
    }

    // Hash password
    const hashedPassword = await hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email || null, // Store as null if not provided
        phone: phone || null, // Store as null if not provided
        password: hashedPassword
      }
    })

    // Don't return password in response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'User created successfully',
        user: userWithoutPassword 
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}