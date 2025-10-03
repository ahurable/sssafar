import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { SettingsForm } from "@/components/dashboard/settings-form"

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">تنظیمات</h1>
            <p className="text-muted-foreground">مدیریت تنظیمات حساب کاربری</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <DashboardNav />
            </aside>
            <div className="lg:col-span-3">
              <SettingsForm />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
