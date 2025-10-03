import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { BookingsList } from "@/components/dashboard/bookings-list"

export default function BookingsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">رزروهای من</h1>
            <p className="text-muted-foreground">مشاهده و مدیریت رزروهای خود</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <DashboardNav />
            </aside>
            <div className="lg:col-span-3">
              <BookingsList />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
