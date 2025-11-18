// app/admin/citytours/page.tsx
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CityToursManagement } from "@/components/admin/city-tours-management"

export default async function AdminCityToursPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">مدیریت گشت‌های شهری</h1>
          <p className="text-muted-foreground mt-2">ایجاد، ویرایش و حذف گشت‌های شهری</p>
        </div>

        <CityToursManagement />
      </div>
    </div>
  )
}