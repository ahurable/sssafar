// app/api/admin/tours/cities/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema for creating a tour city (not a tour)
const createTourCitySchema = z.object({
  name: z.string().min(1, "نام شهر الزامی است"),
  description: z.string().min(1, "توضیحات شهر الزامی است"),
  image: z.string().url("آدرس تصویر معتبر نیست").optional(),
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

    const cities = await prisma.city.findMany({
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            tours: true,
            cityTours: true
          }
        }
      }
    });

    const totalCities = await prisma.city.count();

    return NextResponse.json({
      cities,
      pagination: {
        page,
        limit,
        total: totalCities,
        pages: Math.ceil(totalCities / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching cities:", error);
    return NextResponse.json(
      { error: "خطایی در دریافت لیست شهرها رخ داد" },
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

    console.log("Received data:", body);

    // اعتبارسنجی داده‌ها برای ایجاد شهر
    const validatedData = createTourCitySchema.parse(body);

    // ایجاد شهر توریستی
    const city = await prisma.city.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        image: validatedData.image || "/placeholder-city.jpg"
      },
      include: {
        _count: {
          select: {
            tours: true,
            cityTours: true
          }
        }
      }
    });

    return NextResponse.json(
      { 
        message: "شهر توریستی با موفقیت ایجاد شد",
        city
      }, 
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating tour city:", error);
    
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

    return NextResponse.json(
      { error: "خطایی در ایجاد شهر توریستی رخ داد" },
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
        { error: "شناسه شهر الزامی است" },
        { status: 400 }
      );
    }

    const validatedData = createTourCitySchema.parse(body);

    const city = await prisma.city.update({
      where: { id: body.id },
      data: {
        name: validatedData.name,
        description: validatedData.description,
        image: validatedData.image
      },
      include: {
        _count: {
          select: {
            tours: true,
            cityTours: true
          }
        }
      }
    });

    return NextResponse.json(
      { 
        message: "شهر توریستی با موفقیت به‌روزرسانی شد",
        city
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating tour city:", error);
    
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

    return NextResponse.json(
      { error: "خطایی در به‌روزرسانی شهر توریستی رخ داد" },
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
        { error: "شناسه شهر الزامی است" },
        { status: 400 }
      );
    }

    // Check if city has any tours or city tours
    const cityWithRelations = await prisma.city.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            tours: true,
            cityTours: true
          }
        }
      }
    });

    if (cityWithRelations?._count.tours > 0 || cityWithRelations?._count.cityTours > 0) {
      return NextResponse.json(
        { 
          error: "امکان حذف شهر وجود ندارد",
          details: `این شهر دارای ${cityWithRelations._count.tours} تور و ${cityWithRelations._count.cityTours} گشت شهری است`
        },
        { status: 400 }
      );
    }

    await prisma.city.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "شهر توریستی با موفقیت حذف شد" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting tour city:", error);
    return NextResponse.json(
      { error: "خطایی در حذف شهر توریستی رخ داد" },
      { status: 500 }
    );
  }
};