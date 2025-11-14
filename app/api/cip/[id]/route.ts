import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { cipServiceSchema, cipFaqSchema } from "@/lib/validations/cip"
import { z } from "zod"

interface Context {
  params: {
    id: string
  }
}

// Extended schema for update with FAQs
const cipServiceUpdateSchema = cipServiceSchema.extend({
  faqs: z.array(cipFaqSchema).optional()
})

export async function GET(request: NextRequest, context: Context) {
  try {

    const session = await getSession()

    if (session?.role === "ADMIN") {
      const service = await prisma.cipService.findUnique({
        where: { id: context.params.id },
        include: {
          airport: true,
          reservations: true,
          faqs: {
            where: { isActive: true },
            orderBy: { order: "asc" }
          }
        }
      })

      if (!service) {
        return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 })
      }

      return NextResponse.json({ service })
    }

    const service = await prisma.cipService.findUnique({
      where: { id: context.params.id },
      include: {
        airport: true,
        faqs: {
          where: { isActive: true },
          orderBy: { order: "asc" }
        }
      }
    })

    if (!service) {
      return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({ service })
  } catch (error: any) {
    console.error("Error fetching CIP service:", error)
    return NextResponse.json(
      { error: "خطا در دریافت خدمت CIP" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: Context) {
  try {
    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = cipServiceUpdateSchema.parse(body)

    // Check if service exists
    const existingService = await prisma.cipService.findUnique({
      where: { id: context.params.id },
      include: { faqs: true }
    })

    if (!existingService) {
      return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 })
    }

    // Extract FAQs from the data
    const { faqs, ...serviceData } = validatedData

    // Use transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // Update the main service
      const service = await tx.cipService.update({
        where: { id: context.params.id },
        data: {
          ...serviceData,
          // Handle airport connection properly
          airport: serviceData.airportId ? {
            connect: { id: serviceData.airportId }
          } : serviceData.airportId === "" ? {
            disconnect: true
          } : undefined,
        },
        include: {
          airport: true
        }
      })

      // Handle FAQs if provided
      if (faqs && faqs.length > 0) {
        // Get existing FAQ IDs to track which ones to delete
        const existingFaqIds = existingService.faqs.map(faq => faq.id)
        const updatedFaqIds: string[] = []

        // Update or create FAQs
        for (const faqData of faqs) {
          // If FAQ has an ID, it's an existing one to update
          if (faqData.id) {
            await tx.fAQ.update({
              where: { id: faqData.id },
              data: {
                question: faqData.question,
                answer: faqData.answer,
                order: faqData.order,
                isActive: faqData.isActive,
                type: "CIP"
              }
            })
            updatedFaqIds.push(faqData.id)
          } else {
            // Create new FAQ
            const newFaq = await tx.fAQ.create({
              data: {
                question: faqData.question,
                answer: faqData.answer,
                order: faqData.order,
                isActive: faqData.isActive,
                type: "CIP",
                cip: {
                  connect: { id: context.params.id }
                }
              }
            })
            updatedFaqIds.push(newFaq.id)
          }
        }

        // Delete FAQs that were removed from the form
        const faqsToDelete = existingFaqIds.filter(id => !updatedFaqIds.includes(id))
        if (faqsToDelete.length > 0) {
          await tx.fAQ.deleteMany({
            where: {
              id: { in: faqsToDelete },
              cipId: context.params.id
            }
          })
        }
      } else {
        // If no FAQs provided, delete all existing FAQs for this service
        await tx.fAQ.deleteMany({
          where: { cipId: context.params.id }
        })
      }

      // Return the complete service with FAQs
      return await tx.cipService.findUnique({
        where: { id: context.params.id },
        include: {
          airport: true,
          faqs: {
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
    console.error("Update CIP service error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "داده‌های ورودی نامعتبر است", details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error.message || "خطا در بروزرسانی خدمت CIP" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    // Check if service exists
    const existingService = await prisma.cipService.findUnique({
      where: { id: context.params.id }
    })

    if (!existingService) {
      return NextResponse.json({ error: "خدمت یافت نشد" }, { status: 404 })
    }

    await prisma.cipService.delete({
      where: { id: context.params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Delete CIP service error:", error)
    return NextResponse.json(
      { error: "خطا در حذف خدمت CIP" },
      { status: 500 }
    )
  }
}