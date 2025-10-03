import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const post = await prisma.post.findUnique({
      where: { slug: params.slug },
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
      where: { slug: params.slug },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error("[v0] Get post by slug error:", error)
    return NextResponse.json({ error: "خطا در دریافت پست" }, { status: 500 })
  }
}
