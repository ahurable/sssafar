import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { updatePostSchema } from "@/lib/validations/post"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { id: params.id },
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

    if (!post) {
      return NextResponse.json({ error: "پست یافت نشد" }, { status: 404 })
    }

    // Increment views
    await prisma.post.update({
      where: { id: params.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error("[v0] Get post error:", error)
    return NextResponse.json({ error: "خطا در دریافت پست" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = updatePostSchema.parse(body)

    const post = await prisma.post.update({
      where: { id: params.id },
      data: validatedData,
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
    console.error("[v0] Update post error:", error)
    return NextResponse.json({ error: error.message || "خطا در به‌روزرسانی پست" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    await prisma.post.delete({
      where: { id: params.id },
    })

    return NextResponse.json({
      success: true,
      message: "پست با موفقیت حذف شد",
    })
  } catch (error: any) {
    console.error("[v0] Delete post error:", error)
    return NextResponse.json({ error: "خطا در حذف پست" }, { status: 500 })
  }
}
