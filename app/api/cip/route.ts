import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cipServiceSchema, cipServiceWithFaqsSchema } from "@/lib/validations/cip"
import { generateUniqueSlug } from "@/lib/slugify"
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const published = searchParams.get("published")
    const airport = searchParams.get("airport")
    
    const services = await prisma.cipService.findMany({
      where: {
        ...(published && { published: published === "true" }),
        ...(airport && { airport: { id: airport } })
      },
      orderBy: [
        { priority: "desc" },
        { createdAt: "desc" }
      ],
      include: {
        airport: true,
        faqs: {
          where: { isActive: true },
          orderBy: { order: "asc" }
        }
      }
    })

    return NextResponse.json({ services })
  } catch (error: any) {
    console.error("Error fetching CIP services:", error)
    return NextResponse.json(
      { error: "خطا در دریافت خدمات CIP" },
      { status: 500 }
    )
  }
}


export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = cipServiceWithFaqsSchema.parse(body)
    
    const allSlugs = await prisma.cipService.findMany({
      select: { slug: true }
    })
    
    const slug = generateUniqueSlug(validatedData.title, allSlugs)
    const { faqs, airportId, ...serviceData } = validatedData

    // Use transaction to ensure both operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Create CIP service
      const service = await tx.cipService.create({
        data: {
          ...serviceData,
          slug,
          airport: airportId ? {
            connect: { id: airportId }
          } : undefined,
        },
        include: {
          airport: true
        }
      })

      // Create FAQs individually if provided
      if (faqs && faqs.length > 0) {
        await Promise.all(
          faqs.map(faq => 
            tx.fAQ.create({
              data: {
                question: faq.question,
                answer: faq.answer,
                type: "CIP",
                order: faq.order,
                isActive: faq.isActive,
                cip: {
                  connect: { id: service.id }
                }
              }
            })
          )
        )
      }

      // Return service with FAQs
      return await tx.cipService.findUnique({
        where: { id: service.id },
        include: {
          airport: true,
          faqs: {
            where: { isActive: true },
            orderBy: { order: "asc" }
          }
        }
      })
    })

    return NextResponse.json({
      success: true,
      service: result,
    })
  } catch (error: any) {
    console.error("Create CIP service error:", error)
    return NextResponse.json(
      { error: error.message || "خطا در ایجاد خدمت CIP" },
      { status: 500 }
    )
  }
}