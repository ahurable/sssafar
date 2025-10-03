import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ error: "احراز هویت نشده" }, { status: 401 })
    }

    if (session.role !== "ADMIN") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 })
    }

    const [totalUsers, totalPosts, totalBookings, publishedPosts, pendingBookings] = await Promise.all([
      prisma.user.count(),
      prisma.post.count(),
      prisma.booking.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.booking.count({ where: { status: "PENDING" } }),
    ])

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
    })

    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json({
      stats: {
        totalUsers,
        totalPosts,
        totalBookings,
        publishedPosts,
        pendingBookings,
      },
      recentUsers,
      recentBookings,
    })
  } catch (error: any) {
    console.error("[v0] Get stats error:", error)
    return NextResponse.json({ error: "خطا در دریافت آمار" }, { status: 500 })
  }
}
