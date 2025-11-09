import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { getSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const session = await getSession()
  if (!session || session.role != "ADMIN") {
    return NextResponse.json({
        message: "ابتدا وارد حساب کاربری خود شوید"
    }, { status: 401 })
  }
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "فایلی آپلود نشده است" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "فرمت فایل مجاز نیست. فقط تصاویر JPEG, PNG, GIF و WebP مجاز هستند" },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate filename using timestamp and original name
    const timestamp = Date.now();
    const originalName = path.parse(file.name).name;
    const fileExtension = path.extname(file.name);
    
    // Clean filename: remove special characters and replace spaces with hyphens
    const cleanName = originalName
      .replace(/[^a-zA-Z0-9\u0600-\u06FF\s-]/g, '')
      .replace(/\s+/g, '-')
      .toLowerCase();
    
    const fileName = `visa-${cleanName}-${timestamp}${fileExtension}`;
    
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public/uploads/visa");
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (error) {
      console.error("Error creating upload directory:", error);
    }

    // Write file to disk
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the public URL
    const publicUrl = `/uploads/visa/${fileName}`;

    return NextResponse.json({ 
      url: publicUrl,
      message: "تصویر با موفقیت آپلود شد" 
    });

  } catch (error) {
    console.error("Error uploading visa image:", error);
    return NextResponse.json(
      { error: "مشکلی در آپلود تصویر پیش آمد" },
      { status: 500 }
    );
  }
}