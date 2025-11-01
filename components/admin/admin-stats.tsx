"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, CreditCard, TrendingUp, DollarSign, Package, Activity } from "lucide-react"

interface StatsData {
  totalUsers: number
  totalBookings: number
  totalRevenue: number
  monthlyGrowth: number
  pendingBookings: number
  activeUsers: number
}

export function StatsGrid() {
  const [stats, setStats] = useState<StatsData | null>(null)
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
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card className="py-6" key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-muted rounded w-3/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const statCards = [
    {
      title: "کل کاربران",
      value: stats?.totalUsers || 0,
      icon: Users,
      description: "تعداد کل کاربران سیستم",
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "کل رزروها",
      value: stats?.totalBookings || 0,
      icon: Package,
      description: "تعداد کل رزروهای انجام شده",
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: "درآمد کل",
      value: `${(stats?.totalRevenue || 0).toLocaleString('fa-IR')} تومان`,
      icon: DollarSign,
      description: "مجموع درآمدهای سیستم",
      color: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "رشد ماهانه",
      value: `${stats?.monthlyGrowth || 0}%`,
      icon: TrendingUp,
      description: "نرخ رشد نسبت به ماه قبل",
      color: stats?.monthlyGrowth && stats.monthlyGrowth >= 0 ? "text-green-600" : "text-red-600",
      bgColor: stats?.monthlyGrowth && stats.monthlyGrowth >= 0 ? "bg-green-50" : "bg-red-50"
    },
    {
      title: "رزروهای در انتظار",
      value: stats?.pendingBookings || 0,
      icon: Activity,
      description: "رزروهای نیازمند تأیید",
      color: "text-orange-600",
      bgColor: "bg-orange-50"
    },
    {
      title: "کاربران فعال",
      value: stats?.activeUsers || 0,
      icon: Users,
      description: "کاربران فعال در ماه جاری",
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    }
  ]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {statCards.map((stat, index) => (
        <Card key={index} className="relative overflow-hidden py-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-full ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}