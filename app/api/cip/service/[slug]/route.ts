import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

interface Context {
  params: {
    slug: string
  }
}


export async function GET(request: NextRequest, context: Context) {
  try {

    const session = await getSession()

    if (session?.role === "ADMIN") {
      const service = await prisma.cipService.findUnique({
        where: { slug: context.params.slug },
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
      where: { slug: context.params.slug },
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
