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

export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      {
        message: "لطفا ابتدا وارد حساب کاربری خود شوید"
      },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    
    const updatedVisa = await prisma.visaService.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        image: body.image,
        country: body.country,
        city: body.city,
        price: body.price,
        currency: body.currency,
        processingTime: body.processingTime,
        validity: body.validity,
        entryType: body.entryType,
        features: body.features,
        requirements: body.requirements,
        documents: body.documents,
        priceTables: body.priceTables,
        priority: body.priority,
        published: body.published,
        featured: body.featured,
      },
      include: {
        faq: true,
        bookings: true
      }
    });

    return NextResponse.json(
      { 
        message: "خدمت ویزا با موفقیت به‌روزرسانی شد",
        visa: updatedVisa
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating visa service:", error);
    return NextResponse.json(
      { error: "خطایی در به‌روزرسانی خدمت ویزا رخ داد" },
      { status: 500 }
    );
  }
};

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