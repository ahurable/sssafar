import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get total users count
    const totalUsers = await prisma.user.count()

    // Get total bookings count
    const totalBookings = await prisma.booking.count()

    // Get pending bookings count
    const pendingBookings = await prisma.booking.count({
      where: { status: "PENDING" }
    })

    // Get recent users (last 10)
    const recentUsers = await prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        role: true,
        emailVerified: true,
        phoneVerified: true,
        createdAt: true
      }
    })

    // Get recent bookings (last 10)
    const recentBookings = await prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            email: true
          }
        }
      }
    })

    // Calculate total revenue from successful transactions
    const successfulTransactions = await prisma.creditTransaction.findMany({
      where: {
        type: "DEPOSIT",
        amount: { gt: 0 }
      }
    })

    const totalRevenue = successfulTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    // Calculate monthly growth (placeholder - you might want to implement proper logic)
    const monthlyGrowth = 12.5 // This should be calculated based on previous month data

    // Active users (users with bookings in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const activeUsers = await prisma.user.count({
      where: {
        bookings: {
          some: {
            createdAt: { gte: thirtyDaysAgo }
          }
        }
      }
    })

    const stats = {
      totalUsers,
      totalBookings,
      totalRevenue,
      monthlyGrowth,
      pendingBookings,
      activeUsers
    }

    return NextResponse.json({
      stats,
      recentUsers,
      recentBookings
    })

  } catch (error) {
    console.error("[v0] Error fetching admin stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}