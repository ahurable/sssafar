// app/api/visa/reservations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export const PATCH = async (
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
    
    const updatedReservation = await prisma.reservation.update({
      where: { id: params.id },
      data: {
        status: body.status,
      },
      include: {
        visa: true
      }
    });

    return NextResponse.json(
      {
        message: "وضعیت درخواست ویزا با موفقیت به روزرسانی شد",
        reservation: updatedReservation
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error updating visa reservation:", error);
    return NextResponse.json(
      { error: "خطایی در به روزرسانی وضعیت درخواست ویزا رخ داد" },
      { status: 500 }
    );
  }
};