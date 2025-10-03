"use client"

import { useEffect, useState } from "react"
import { Users, FileText, ShoppingCart, CheckCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Stats {
  totalUsers: number
  totalPosts: number
  totalBookings: number
  publishedPosts: number
  pendingBookings: number
}

export function AdminStats() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error fetching stats:", error)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>
  }

  if (!stats) {
    return null
  }

  const statCards = [
    {
      title: "کل کاربران",
      value: stats.totalUsers,
      icon: Users,
      color: "text-blue-600",
    },
    {
      title: "کل پست‌ها",
      value: stats.totalPosts,
      icon: FileText,
      color: "text-green-600",
    },
    {
      title: "کل رزروها",
      value: stats.totalBookings,
      icon: ShoppingCart,
      color: "text-purple-600",
    },
    {
      title: "پست‌های منتشر شده",
      value: stats.publishedPosts,
      icon: CheckCircle,
      color: "text-teal-600",
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString("fa-IR")}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
