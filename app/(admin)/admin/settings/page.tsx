
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { SettingsManagement } from "@/components/admin/settings-management"

export default async function AdminSettingsPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">تنظیمات سیستم</h1>
          <p className="text-muted-foreground mt-2">
            مدیریت تنظیمات و اطلاعات پایه سیستم
          </p>
        </div>

        <SettingsManagement />
      </div>
    </div>
  )
}