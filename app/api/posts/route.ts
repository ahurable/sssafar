import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPostSchema } from "@/lib/validations/post"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const published = searchParams.get("published")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const skip = (page - 1) * limit

    const where: any = {}

    if (category) where.category = category
    if (featured === "true") where.featured = true
    if (published !== "false") where.published = true

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.post.count({ where }),
    ])

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error("[v0] Get posts error:", error)
    return NextResponse.json({ error: "خطا در دریافت پست‌ها" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    // Check if user is admin
    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Generate slug from title
    const slug =
      validatedData.title
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .replace(/--+/g, "-")
        .trim() +
      "-" +
      Date.now()

    const post = await prisma.post.create({
      data: {
        ...validatedData,
        slug,
        authorId: session.userId,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      post,
    })
  } catch (error: any) {
    console.error("[v0] Create post error:", error)
    return NextResponse.json({ error: error.message || "خطا در ایجاد پست" }, { status: 500 })
  }
}
