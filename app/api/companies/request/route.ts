// app/api/corporate/request/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // اعتبارسنجی فیلدهای ضروری
    const requiredFields = [
      'companyName',
      'companyType', 
      'email',
      'phone',
      'address',
      'contactPerson',
      'employeeCount'
    ]

    const missingFields = requiredFields.filter(field => {
        // console.log(body[field],
        !body[field]
      )
    })
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          error: 'فیلدهای اجباری پر نشده‌اند',
          missingFields 
        },
        { status: 400 }
      )
    }

    // اعتبارسنجی ایمیل
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { error: 'فرمت ایمیل نامعتبر است' },
        { status: 400 }
      )
    }

    // اعتبارسنجی تعداد کارکنان
    if (body.employeeCount < 1) {
      return NextResponse.json(
        { error: 'تعداد کارکنان باید بیشتر از ۰ باشد' },
        { status: 400 }
      )
    }

    // ذخیره درخواست در دیتابیس
    const corporateRequest = await prisma.corporateRequest.create({
      data: {
        companyName: body.companyName,
        companyType: body.companyType,
        email: body.email,
        phone: body.phone,
        address: body.address,
        contactPerson: body.contactPerson,
        employeeCount: parseInt(body.employeeCount),
        needs: body.needs || null,
      }
    })

    // console.log('Corporate request created:', corporateRequest.id)

    return NextResponse.json(
      { 
        success: true,
        message: 'درخواست با موفقیت ثبت شد',
        requestId: corporateRequest.id 
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating corporate request:', error)
    
    return NextResponse.json(
      { 
        success: false,
        error: 'خطای سرور. لطفا مجددا تلاش کنید' 
      },
      { status: 500 }
    )
  }
}