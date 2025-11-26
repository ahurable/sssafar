import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const GET = async (request: NextRequest, { params } : { params: { id : string }}) => {

  const session = await getSession()
  if (!session || session.role != "ADMIN")
    return NextResponse.json({
      message: "باید ابتدا وارد حساب کاربری خود شوید"
    }, { status: 401 })
  
  try {
    const tour = await prisma.tour.findUnique({
      where: {
        id: params.id
      }, 
      include: {
        reservations: true
      }
    })
    return NextResponse.json(tour)
  } catch (error) {
    // console.log(error)
    return NextResponse.json({
      message: "خطایی در دریافت اطلاعا رخ داد",
      error: error
    }, { status: 500 })
  }
}


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
    
    // Validate that the city exists
    if (body.tourCityId) {
      const cityExists = await prisma.city.findUnique({
        where: { id: body.tourCityId }
      });
      
      if (!cityExists) {
        return NextResponse.json(
          { error: "شهر انتخاب شده معتبر نیست" },
          { status: 400 }
        );
      }
    }
    
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
        ...(body.tourCityId && { cityId: body.tourCityId }), // Only include if provided
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

  } catch (error: any) {
    console.error("Error updating tour:", error);
    
    // Handle specific Prisma errors
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "شهر انتخاب شده معتبر نیست" },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "تور مورد نظر یافت نشد" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "خطایی در به روزرسانی تور رخ داد" },
      { status: 500 }
    );
  }
};