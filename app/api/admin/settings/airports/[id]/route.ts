// app/api/admin/airports/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()

  if (!session || session.role != "ADMIN") {
    return NextResponse.json({
      message: "ابتدا وارد حساب کاربری خود شوید"
    }, { status: 401 })
  }

  const { name, airportIata, airportCity } = await request.json()

  try {
    await prisma.airport.update({
      where: { id: params.id },
      data: {
        name,
        airportIata,
        airportCity
      }
    })

    return NextResponse.json({
      message: "فرودگاه با موفقیت ویرایش شد"
    }, { status: 200 })

  } catch (error) {
    console.error('Error updating airport:', error)
    return NextResponse.json({
      message: "مشکلی در ویرایش فرودگاه به وجود آمد"
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession()

  if (!session || session.role != "ADMIN") {
    return NextResponse.json({
      message: "ابتدا وارد حساب کاربری خود شوید"
    }, { status: 401 })
  }

  try {
    await prisma.airport.delete({
      where: { id: params.id }
    })

    return NextResponse.json({
      message: "فرودگاه با موفقیت حذف شد"
    }, { status: 200 })

  } catch (error) {
    console.error('Error deleting airport:', error)
    return NextResponse.json({
      message: "مشکلی در حذف فرودگاه به وجود آمد"
    }, { status: 500 })
  }
}