import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createPostSchema } from "@/lib/validations/post"
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"

// GET single post
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const post = await prisma.post.findUnique({
      where: { id },
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

    if (!post) {
      return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 })
    }

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error("[v0] Get post error:", error)
    return NextResponse.json({ error: "خطا در دریافت پست" }, { status: 500 })
  }
}

// PUT update post
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const { id } = params
    const body = await request.json()
    const validatedData = createPostSchema.parse(body)

    // Check if post exists
    const existingPost = await prisma.post.findUnique({
      where: { id },
    })

    if (!existingPost) {
      return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 })
    }

    // Update post with transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update main post
      const post = await tx.post.update({
        where: { id },
        data: {
          title: validatedData.title,
          excerpt: validatedData.excerpt,
          content: validatedData.content,
          coverImage: validatedData.coverImage,
          images: validatedData.images,
          category: validatedData.category,
          tags: validatedData.tags,
          published: validatedData.published,
          featured: validatedData.featured,
        },
      })

      // Delete existing tables and create new ones
      await tx.postTable.deleteMany({
        where: { postId: id }
      })

      // Create new tables if provided
      if (validatedData.tables && validatedData.tables.length > 0) {
        await tx.postTable.createMany({
          data: validatedData.tables.map((table, index) => ({
            postId: id,
            title: table.title,
            content: table.content,
            order: index,
          }))
        })
      }

      // Update or create metadata
      if (validatedData.readingTime > 0 || validatedData.seoTitle || validatedData.seoDescription || validatedData.canonicalUrl) {
        await tx.postMetadata.upsert({
          where: { postId: id },
          update: {
            readingTime: validatedData.readingTime,
            seoTitle: validatedData.seoTitle,
            seoDescription: validatedData.seoDescription,
            canonicalUrl: validatedData.canonicalUrl,
          },
          create: {
            postId: id,
            readingTime: validatedData.readingTime,
            seoTitle: validatedData.seoTitle,
            seoDescription: validatedData.seoDescription,
            canonicalUrl: validatedData.canonicalUrl,
          }
        })
      } else {
        // Delete metadata if all fields are empty
        await tx.postMetadata.deleteMany({
          where: { postId: id }
        })
      }

      // Return updated post with relations
      return await tx.post.findUnique({
        where: { id },
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
    console.error("[v0] Update post error:", error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: "داده‌های ورودی نامعتبر است",
        details: error.errors 
      }, { status: 400 })
    }
    
    return NextResponse.json({ error: error.message || "خطا در بروزرسانی پست" }, { status: 500 })
  }
}