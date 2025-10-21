// app/api/admin/tours/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema برای اعتبارسنجی داده‌های تور
const createTourSchema = z.object({
  title: z.string().min(1, "عنوان تور الزامی است"),
  description: z.string().min(1, "توضیحات تور الزامی است"),
  startDate: z.string().min(1, "تاریخ شروع الزامی است"),
  endDate: z.string().min(1, "تاریخ پایان الزامی است"),
  featured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  
  prices: z.array(z.object({
    type: z.enum(["ADULT", "CHILD", "INFANT", "STUDENT", "SENIOR"]),
    price: z.number().min(0, "قیمت باید بیشتر از 0 باشد"),
    description: z.string().optional()
  })).optional().default([]),
  
  itineraries: z.array(z.object({
    day: z.number().int().min(1, "روز باید بیشتر از 0 باشد"),
    title: z.string().min(1, "عنوان روز الزامی است"),
    description: z.string().min(1, "توضیحات روز الزامی است"),
    activities: z.any().optional()
  })).optional().default([]),
  
  routes: z.array(z.object({
    order: z.number().int().min(1, "ترتیب باید بیشتر از 0 باشد"),
    city: z.string().min(1, "نام شهر الزامی است"),
    country: z.string().min(1, "نام کشور الزامی است"),
    duration: z.number().int().optional(),
    description: z.string().optional()
  })).optional().default([]),
  
  rules: z.array(z.object({
    title: z.string().min(1, "عنوان قانون الزامی است"),
    description: z.string().min(1, "توضیحات قانون الزامی است")
  })).optional().default([]),
  
  transports: z.array(z.object({
    type: z.enum(["FLIGHT", "TRAIN", "BUS", "FERRY"]),
    departure: z.string().min(1, "تاریخ حرکت الزامی است"),
    arrival: z.string().min(1, "تاریخ رسیدن الزامی است"),
    fromCity: z.string().min(1, "شهر مبدا الزامی است"),
    toCity: z.string().min(1, "شهر مقصد الزامی است"),
    carrier: z.string().optional(),
    flightNumber: z.string().optional(),
    trainNumber: z.string().optional()
  })).optional().default([])
});

const convertToISO = (datetimeLocal: string): string => {
  // datetime-local format: "YYYY-MM-DDTHH:mm"
  // ISO format: "YYYY-MM-DDTHH:mm:ss.sssZ"
  return datetimeLocal ? `${datetimeLocal}:00.000Z` : datetimeLocal;
};

export const GET = async (request: NextRequest) => {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "لطفا وارد حساب کاربری خود شوید" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const tours = await prisma.tour.findMany({
      skip,
      take: limit,
      include: {
        prices: true,
        itineraries: {
          orderBy: { day: "asc" }
        },
        routes: {
          orderBy: { order: "asc" }
        },
        rules: true,
        images: {
            where: {
                isPrimary: true
            }
        },
        transports: {
          orderBy: { departure: "asc" }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    const totalTours = await prisma.tour.count();

    return NextResponse.json({
      tours,
      pagination: {
        page,
        limit,
        total: totalTours,
        pages: Math.ceil(totalTours / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching tours:", error);
    return NextResponse.json(
      { error: "خطایی در دریافت لیست تورها رخ داد" },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest) => {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "لطفا وارد حساب کاربری خود شوید" },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    
    if (!body) {
      return NextResponse.json(
        { error: "لطفا اطلاعات فرم را کامل ارسال کنید" },
        { status: 400 }
      );
    }

    // اعتبارسنجی داده‌ها
    const validatedData = createTourSchema.parse(body);

    // تبدیل فرمت تاریخ‌ها
    const startDate = new Date(convertToISO(validatedData.startDate));
    const endDate = new Date(convertToISO(validatedData.endDate));
    
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "تاریخ پایان باید بعد از تاریخ شروع باشد" },
        { status: 400 }
      );
    }

    
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: "تاریخ پایان باید بعد از تاریخ شروع باشد" },
        { status: 400 }
      );
    }

    const transportsWithISO = validatedData.transports.map(transport => ({
      ...transport,
      departure: new Date(convertToISO(transport.departure)),
      arrival: new Date(convertToISO(transport.arrival))
    }));

    // ایجاد تور با تمام داده‌های مرتبط
    const tour = await prisma.tour.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        startDate: startDate,
        endDate: endDate,
        featured: validatedData.featured,
        isActive: validatedData.isActive,
        
        prices: {
          create: validatedData.prices
        },
        
        itineraries: {
          create: validatedData.itineraries.map(itinerary => ({
            ...itinerary,
            activities: itinerary.activities || null
          }))
        },
        
        routes: {
          create: validatedData.routes
        },
        
        rules: {
          create: validatedData.rules
        },
        
        transports: {
          create: transportsWithISO
        }
      },
      include: {
        prices: true,
        itineraries: true,
        routes: true,
        rules: true,
        transports: true
      }
    });

    return NextResponse.json(
      { 
        message: "تور با موفقیت ایجاد شد",
        tour
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating tour:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "داده‌های ارسالی معتبر نیستند",
          details: error.errors
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطایی در ایجاد تور رخ داد" },
      { status: 500 }
    );
  }
};