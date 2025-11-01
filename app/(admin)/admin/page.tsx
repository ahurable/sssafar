
import { RecentUsers } from "@/components/admin/recent-users"
import { RecentBookings } from "@/components/admin/recent-bookings"
import { IncomeChart } from "@/components/admin/income-chart"
import { StatsGrid } from "@/components/admin/admin-stats"

export default async function Page() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-right">
          <h1 className="text-3xl font-bold text-foreground">پنل مدیریت</h1>
          <p className="text-muted-foreground mt-2">خوش آمدید به پنل مدیریت فلای‌تودی</p>
        </div>

        {/* Main Stats Grid */}
        <StatsGrid />

        {/* Income Chart */}
        <div className="mt-8">
          <IncomeChart />
        </div>

        {/* Recent Activity Grid */}
        <div className="grid gap-6 md:grid-cols-2 mt-8">
          <RecentUsers />
          <RecentBookings />
        </div>
      </div>
    </div>
  )
}