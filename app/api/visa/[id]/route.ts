import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface Params {
  params: {
    id: string;
  };
}

export async function GET(request: NextRequest, { params }: Params) {
  try {
    const { id } = params;

    const visaService = await prisma.visaService.findUnique({
      where: { id }
    });

    if (!visaService) {
      return NextResponse.json(
        { error: "خدمت ویزا یافت نشد" },
        { status: 404 }
      );
    }

    return NextResponse.json(visaService);
  } catch (error) {
    console.error("Error fetching visa service:", error);
    return NextResponse.json(
      { error: "مشکلی در دریافت خدمت ویزا پیش آمد" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session || session.role != "ADMIN") {
    return NextResponse.json({
        message: "ابتدا وارد حساب کاربری خود شوید"
    }, { status: 401 })
  }
  try {
    const { id } = params;
    const body = await request.json();
    
    const {
      title,
      description,
      image,
      country,
      city,
      price,
      currency,
      processingTime,
      validity,
      entryType,
      features,
      requirements,
      documents,
      priority,
      published,
      featured
    } = body;

    // Check if service exists
    const existingService = await prisma.visaService.findUnique({
      where: { id }
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "خدمت ویزا یافت نشد" },
        { status: 404 }
      );
    }

    const updatedService = await prisma.visaService.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(image !== undefined && { image }),
        ...(country && { country }),
        ...(city && { city }),
        ...(price !== undefined && { price: price ? parseFloat(price) : null }),
        ...(currency && { currency }),
        ...(processingTime !== undefined && { processingTime }),
        ...(validity !== undefined && { validity }),
        ...(entryType && { entryType }),
        ...(features && { features: features.filter((f: string) => f.trim()) }),
        ...(requirements && { requirements: requirements.filter((r: string) => r.trim()) }),
        ...(documents && { documents: documents.filter((d: string) => d.trim()) }),
        ...(priority !== undefined && { priority: parseInt(priority) || 0 }),
        ...(published !== undefined && { published: Boolean(published) }),
        ...(featured !== undefined && { featured: Boolean(featured) })
      }
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating visa service:", error);
    return NextResponse.json(
      { error: "مشکلی در به‌روزرسانی خدمت ویزا پیش آمد" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const session = await getSession()
  if (!session || session.role != "ADMIN") {
    return NextResponse.json({
        message: "ابتدا وارد حساب کاربری خود شوید"
    }, { status: 401 })
  }
  try {
    const { id } = params;

    // Check if service exists
    const existingService = await prisma.visaService.findUnique({
      where: { id }
    });

    if (!existingService) {
      return NextResponse.json(
        { error: "خدمت ویزا یافت نشد" },
        { status: 404 }
      );
    }

    await prisma.visaService.delete({
      where: { id }
    });

    return NextResponse.json(
      { message: "خدمت ویزا با موفقیت حذف شد" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting visa service:", error);
    return NextResponse.json(
      { error: "مشکلی در حذف خدمت ویزا پیش آمد" },
      { status: 500 }
    );
  }
}