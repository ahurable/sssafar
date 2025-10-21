// app/api/admin/tours/[id]/images/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const POST = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "لطفا وارد حساب کاربری خود شوید" },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const files = formData.getAll('images') as File[];
    const altTexts = formData.getAll('altText') as string[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "هیچ فایلی آپلود نشده است" },
        { status: 400 }
      );
    }

    // Verify tour exists
    const tour = await prisma.tour.findUnique({
      where: { id: params.id }
    });

    if (!tour) {
      return NextResponse.json(
        { error: "تور پیدا نشد" },
        { status: 404 }
      );
    }

    const uploadDir = join(process.cwd(), 'public', 'assets', 'images', 'tours', params.id);
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedImages = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const altText = altTexts[i] || '';

      if (!file) continue;

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop();
      const filename = `tour-${timestamp}-${i}.${extension}`;
      const filePath = join(uploadDir, filename);
      
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Write file to disk
      await writeFile(filePath, buffer);

      // Create image record in database
      const image = await prisma.tourImage.create({
        data: {
          tourId: params.id,
          filename: filename,
          path: `/assets/images/tours/${params.id}/${filename}`,
          altText: altText,
          order: i,
          isPrimary: i === 0 // First image is primary by default
        }
      });

      uploadedImages.push(image);
    }

    return NextResponse.json(
      { 
        message: "تصاویر با موفقیت آپلود شدند",
        images: uploadedImages
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error uploading images:", error);
    return NextResponse.json(
      { error: "خطا در آپلود تصاویر" },
      { status: 500 }
    );
  }
};

export const GET = async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const session = await getSession();

  if (!session || session.role !== "ADMIN") {
    return NextResponse.json(
      { error: "لطفا وارد حساب کاربری خود شوید" },
      { status: 401 }
    );
  }

  try {
    const images = await prisma.tourImage.findMany({
      where: { tourId: params.id },
      orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }]
    });

    return NextResponse.json({ images });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "خطا در دریافت تصاویر" },
      { status: 500 }
    );
  }
};