import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { generateUniqueSlug } from "@/lib/slugify"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const published = searchParams.get("published");
    
    const where = published === "true" ? { published: true } : {};

    const services = await prisma.visaService.findMany({
      where,
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ],
      include: {
        // You can include related data if needed
      }
    });

    return NextResponse.json({ 
      services,
      count: services.length 
    });
  } catch (error) {
    console.error("Error fetching visa services:", error);
    return NextResponse.json(
      { error: "مشکلی در دریافت خدمات ویزا پیش آمد" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role != "ADMIN") {
        return NextResponse.json({
            message: "شما باید ابتدا وارد حساب کاربری خود شوید"
        }, { status: 401 })
    }

    const body = await request.json();
    
   
    const {
      title,
      description,
      image,
      country,
      city,
      price,
      currency = "ریال",
      processingTime,
      validity,
      entryType,
      features = [],
      requirements = [],
      documents = [],
      priority = 0,
      published = false,
      featured = false
    } = body;

    // Validation
    if (!title || !country || !city) {
      return NextResponse.json(
        { error: "عنوان، کشور و شهر اجباری هستند" },
        { status: 400 }
      );
    }

     const existingSlugs = await prisma.visaService.findMany({
        select: { slug: true }
      }).then(services => services.map(s => s.slug))

      const slug = generateUniqueSlug(title, existingSlugs)


    const visaService = await prisma.visaService.create({
      data: {
        title,
        description,
        slug,
        image,
        country,
        city,
        price: price ? parseFloat(price) : null,
        currency,
        processingTime,
        validity,
        entryType,
        features: features.filter((f: string) => f.trim()),
        requirements: requirements.filter((r: string) => r.trim()),
        documents: documents.filter((d: string) => d.trim()),
        priority: parseInt(priority) || 0,
        published: Boolean(published),
        featured: Boolean(featured),
        priceTables: body.priceTables || []
      }
    });

    return NextResponse.json(visaService, { status: 201 });
  } catch (error) {
    console.error("Error creating visa service:", error);
    return NextResponse.json(
      { error: "مشکلی در ایجاد خدمت ویزا پیش آمد" },
      { status: 500 }
    );
  }
}