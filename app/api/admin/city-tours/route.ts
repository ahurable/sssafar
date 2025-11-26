// app/api/admin/city-tours/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { generateUniqueSlug } from "@/lib/slugify";

// Schema for creating a city tour
const createCityTourSchema = z.object({
  title: z.string().min(1, "عنوان گشت شهری الزامی است"),
  description: z.string().min(1, "توضیحات الزامی است"),
  shortDescription: z.string().min(1, "توضیحات کوتاه الزامی است"),
  cityId: z.string().min(1, "شهر الزامی است"),
  location: z.string().min(1, "موقعیت مکانی الزامی است"),
  duration: z.number().min(1, "مدت زمان باید بیشتر از 0 باشد"),
  maxCapacity: z.number().min(1, "ظرفیت باید بیشتر از 0 باشد"),
  featured: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  meetingPoint: z.string().min(1, "نقطه ملاقات الزامی است"),
  meetingLatitude: z.number().optional(),
  meetingLongitude: z.number().optional(),
  
  images: z.array(z.string()).optional().default([]),
  
  prices: z.array(z.object({
    type: z.string().min(1, "نوع قیمت الزامی است"),
    price: z.number().min(0, "قیمت باید بیشتر از 0 باشد"),
    date: z.string().transform((val) => new Date(val)),
    currency: z.string().optional().default("IRR")
  })).optional().default([]),
  
  inclusions: z.array(z.object({
    item: z.string().min(1, "مورد الزامی است")
  })).optional().default([]),
  
  exclusions: z.array(z.object({
    item: z.string().min(1, "مورد الزامی است")
  })).optional().default([]),
  
  itineraries: z.array(z.object({
    order: z.number().int().min(1, "ترتیب باید بیشتر از 0 باشد"),
    title: z.string().min(1, "عنوان الزامی است"),
    description: z.string().min(1, "توضیحات الزامی است"),
    duration: z.number().min(0, "مدت زمان نمی‌تواند منفی باشد").optional()
  })).optional().default([])
});

export const GET = async (request: NextRequest) => {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "لطفا وارد حساب کاربری خود شوید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const cityTours = await prisma.cityTour.findMany();
    // // console.log(cityTours)
    const totalCityTours = await prisma.cityTour.count();

    return NextResponse.json({
      tours: cityTours,
      pagination: {
        page,
        limit,
        total: totalCityTours,
        pages: Math.ceil(totalCityTours / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching city tours:", error);
    return NextResponse.json(
      { error: "خطایی در دریافت لیست گشت‌های شهری رخ داد" },
      { status: 500 }
    );
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "لطفا وارد حساب کاربری خود شوید" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if (!body) {
      return NextResponse.json(
        { error: "لطفا اطلاعات فرم را کامل ارسال کنید" },
        { status: 400 }
      );
    }

    // console.log("Received data:", body);

    // اعتبارسنجی داده‌ها
    const validatedData = createCityTourSchema.parse(body);

    // Verify that the city exists
    const cityExists = await prisma.city.findUnique({
      where: { id: validatedData.cityId }
    });

    if (!cityExists) {
      return NextResponse.json(
        { error: "شهر انتخاب شده یافت نشد" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingSlugs = await prisma.cityTour.findMany({
      select: { slug: true }
    });

    const slug = generateUniqueSlug(validatedData.title, existingSlugs)

    // Create city tour with nested relations
    const cityTour = await prisma.cityTour.create({
      data: {
        title: validatedData.title,
        slug: slug,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        location: validatedData.location,
        duration: validatedData.duration,
        maxCapacity: validatedData.maxCapacity,
        featured: validatedData.featured,
        isActive: validatedData.isActive,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        meetingPoint: validatedData.meetingPoint,
        meetingLatitude: validatedData.meetingLatitude,
        meetingLongitude: validatedData.meetingLongitude,
        images: validatedData.images,
        
        // Connect to city
        city: {
          connect: { id: validatedData.cityId }
        },
        
        // Create nested relations without IDs
        prices: {
          create: validatedData.prices.map(price => ({
            type: price.type,
            price: price.price,
            date: price.date,
            currency: price.currency
          }))
        },
        
        inclusions: {
          create: validatedData.inclusions.map(inclusion => ({
            item: inclusion.item
          }))
        },
        
        exclusions: {
          create: validatedData.exclusions.map(exclusion => ({
            item: exclusion.item
          }))
        },
        
        itineraries: {
          create: validatedData.itineraries.map(itinerary => ({
            order: itinerary.order,
            title: itinerary.title,
            description: itinerary.description,
            duration: itinerary.duration || 0
          }))
        }
      },
      include: {
        prices: true,
        inclusions: true,
        exclusions: true,
        itineraries: {
          orderBy: { order: "asc" }
        },
        city: true
      }
    });

    return NextResponse.json(
      { 
        message: "گشت شهری با موفقیت ایجاد شد",
        cityTour
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating city tour:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "داده‌های ارسالی معتبر نیستند",
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    // Handle Prisma unique constraint errors
    if (error.code === 'P2002') {
      if (error.meta?.target?.includes('slug')) {
        return NextResponse.json(
          { error: "اسلاگ از قبل وجود دارد. لطفا اسلاگ دیگری انتخاب کنید" },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: "گشت شهری با این مشخصات از قبل وجود دارد" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطایی در ایجاد گشت شهری رخ داد" },
      { status: 500 }
    );
  }
};

export const PUT = async (request: NextRequest) => {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "لطفا وارد حساب کاربری خود شوید" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    if (!body.id) {
      return NextResponse.json(
        { error: "شناسه گشت شهری الزامی است" },
        { status: 400 }
      );
    }

    const validatedData = createCityTourSchema.parse(body);

    // Update city tour
    const cityTour = await prisma.cityTour.update({
      where: { id: body.id },
      data: {
        title: validatedData.title,
        slug: validatedData.slug,
        description: validatedData.description,
        shortDescription: validatedData.shortDescription,
        location: validatedData.location,
        duration: validatedData.duration,
        maxCapacity: validatedData.maxCapacity,
        featured: validatedData.featured,
        isActive: validatedData.isActive,
        latitude: validatedData.latitude,
        longitude: validatedData.longitude,
        meetingPoint: validatedData.meetingPoint,
        meetingLatitude: validatedData.meetingLatitude,
        meetingLongitude: validatedData.meetingLongitude,
        images: validatedData.images,
        
        // Connect to city
        city: {
          connect: { id: validatedData.cityId }
        }
      },
      include: {
        prices: true,
        inclusions: true,
        exclusions: true,
        itineraries: true,
        city: true
      }
    });

    return NextResponse.json(
      { 
        message: "گشت شهری با موفقیت به‌روزرسانی شد",
        cityTour
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating city tour:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: "داده‌های ارسالی معتبر نیستند",
          details: error.errors.map(err => ({
            path: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    else if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "اسلاگ از قبل وجود دارد. لطفا اسلاگ دیگری انتخاب کنید" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "خطایی در به‌روزرسانی گشت شهری رخ داد" },
      { status: 500 }
    );
  }
};

export const DELETE = async (request: NextRequest) => {
  try {
    const session = await getSession();

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json(
        { error: "لطفا وارد حساب کاربری خود شوید" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "شناسه گشت شهری الزامی است" },
        { status: 400 }
      );
    }

    // Check if city tour has any bookings
    const cityTourWithBookings = await prisma.cityTour.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      }
    });

    if (cityTourWithBookings && cityTourWithBookings._count.bookings > 0) {
      return NextResponse.json(
        { 
          error: "امکان حذف گشت شهری وجود ندارد",
          details: `این گشت شهری دارای ${cityTourWithBookings._count.bookings} رزرو است`
        },
        { status: 400 }
      );
    }

    // Delete nested relations first
    await prisma.$transaction([
      prisma.cityTourPrice.deleteMany({ where: { tourId: id } }),
      prisma.cityTourInclusion.deleteMany({ where: { tourId: id } }),
      prisma.cityTourExclusion.deleteMany({ where: { tourId: id } }),
      prisma.cityTourItinerary.deleteMany({ where: { tourId: id } }),
      prisma.cityTour.delete({ where: { id } })
    ]);

    return NextResponse.json(
      { message: "گشت شهری با موفقیت حذف شد" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting city tour:", error);
    return NextResponse.json(
      { error: "خطایی در حذف گشت شهری رخ داد" },
      { status: 500 }
    );
  }
};