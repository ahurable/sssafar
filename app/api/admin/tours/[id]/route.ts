import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";


export const PUT = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getSession()
  if (!session || session.role != "ADMIN") {
    return NextResponse.json({
        message: "لطفا ابتدا وارد حساب کاربری خود شوید"
    }, { status: 403 })
  }
  try {
    const body = await request.json();
    
    // Update tour
    const updatedTour = await prisma.tour.update({
      where: { id: params.id },
      data: {
        title: body.title,
        description: body.description,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        featured: body.featured,
        isActive: body.isActive,
      },
      include: {
        prices: true,
        itineraries: true,
        routes: true,
        rules: true,
        transports: true,
        images: true
      }
    });

    return NextResponse.json(
      { 
        message: "تور با موفقیت به روزرسانی شد",
        tour: updatedTour
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating tour:", error);
    return NextResponse.json(
      { error: "خطایی در به روزرسانی تور رخ داد" },
      { status: 500 }
    );
  }
};