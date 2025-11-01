"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

interface IncomeData {
  date: string
  income: number
  bookings: number
}

interface PaymentData {
  creditTransactions: any[]
  panelCreditTransactions: any[]
  userTransactions: any[]
}

export function IncomeChart() {
  const [incomeData, setIncomeData] = useState<IncomeData[]>([])
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/payments")
      .then((res) => res.json())
      .then((data: PaymentData) => {
        const processedData = processIncomeData(data, timeRange)
        setIncomeData(processedData)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error fetching income data:", error)
        setLoading(false)
      })
  }, [timeRange])

  const processIncomeData = (data: PaymentData, range: "week" | "month" | "year"): IncomeData[] => {
    // Filter successful transactions (DEPOSIT type for income)
    const successfulTransactions = [
      ...data.creditTransactions.filter((t: any) => t.type === "DEPOSIT" && t.amount > 0),
      ...data.panelCreditTransactions.filter((t: any) => t.status === "APPROVED" && t.type === "INCREAMENT"),
      ...data.userTransactions.filter((t: any) => t.type === "DEPOSIT" && t.amount > 0)
    ]

    // Group by time range
    const groupedData: { [key: string]: { income: number; bookings: number } } = {}

    successfulTransactions.forEach(transaction => {
      const date = new Date(transaction.createdAt)
      let key: string

      switch (range) {
        case "week":
          key = date.toLocaleDateString('fa-IR', { weekday: 'short' })
          break
        case "month":
          key = `${date.getDate()} ${date.toLocaleDateString('fa-IR', { month: 'short' })}`
          break
        case "year":
          key = date.toLocaleDateString('fa-IR', { month: 'long' })
          break
      }

      if (!groupedData[key]) {
        groupedData[key] = { income: 0, bookings: 0 }
      }

      groupedData[key].income += Math.abs(transaction.amount)
      groupedData[key].bookings += 1
    })

    return Object.entries(groupedData).map(([date, values]) => ({
      date,
      income: values.income,
      bookings: values.bookings
    }))
  }

  const totalIncome = incomeData.reduce((sum, item) => sum + item.income, 0)
  const totalBookings = incomeData.reduce((sum, item) => sum + item.bookings, 0)

  if (loading) {
    return (
      <Card className="py-6">
        <CardHeader>
          <CardTitle>درآمد و آمار فروش</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">در حال بارگذاری نمودار...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>درآمد و آمار فروش</CardTitle>
          <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>کل درآمد: {totalIncome.toLocaleString('fa-IR')} تومان</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>کل رزروها: {totalBookings.toLocaleString('fa-IR')}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {(["week", "month", "year"] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-full border ${
                timeRange === range
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-border"
              }`}
            >
              {range === "week" && "هفته"}
              {range === "month" && "ماه"}
              {range === "year" && "سال"}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.toLocaleString('fa-IR')}
              />
              <Tooltip 
                formatter={(value: number, name: string) => [
                  name === "income" ? `${value.toLocaleString('fa-IR')} تومان` : value.toLocaleString('fa-IR'),
                  name === "income" ? "درآمد" : "تعداد رزرو"
                ]}
                labelFormatter={(label) => `تاریخ: ${label}`}
              />
              <Bar dataKey="income" name="income" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="bookings" name="bookings" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}