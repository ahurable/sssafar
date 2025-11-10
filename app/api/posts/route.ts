import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPostSchema } from "@/lib/validations/post"
import { z } from "zod"

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
          tables: true,
          metadata: true,
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

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Generate slug from title
    const slug = validatedData.title
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
      .trim() + "-" + Date.now()

    // Create post with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create main post (without relations first)
      const post = await tx.post.create({
        data: {
          slug,
          title: validatedData.title,
          excerpt: validatedData.excerpt,
          content: validatedData.content,
          coverImage: validatedData.coverImage,
          images: validatedData.images,
          category: validatedData.category,
          tags: validatedData.tags,
          published: validatedData.published,
          featured: validatedData.featured,
          authorId: session.userId,
        },
      })

      // Create tables if provided
      if (validatedData.tables && validatedData.tables.length > 0) {
        await tx.postTable.createMany({
          data: validatedData.tables.map((table, index) => ({
            postId: post.id,
            title: table.title,
            content: table.content,
            order: index,
          }))
        })
      }

      // Create metadata if provided
      if (validatedData.readingTime > 0 || validatedData.seoTitle || validatedData.seoDescription || validatedData.canonicalUrl) {
        await tx.postMetadata.create({
          data: {
            postId: post.id,
            readingTime: validatedData.readingTime,
            seoTitle: validatedData.seoTitle,
            seoDescription: validatedData.seoDescription,
            canonicalUrl: validatedData.canonicalUrl,
          }
        })
      }

      // Return post with relations
      return await tx.post.findUnique({
        where: { id: post.id },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          tables: {
            orderBy: { order: "asc" }
          },
          metadata: true,
        },
      })
    })

    return NextResponse.json({
      success: true,
      post: result,
    })
  } catch (error: any) {
    console.error("[v0] Create post error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "داده‌های ورودی نامعتبر است",
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message || "خطا در ایجاد پست" }, { status: 500 })
  }
}