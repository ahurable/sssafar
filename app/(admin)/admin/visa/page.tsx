// app/admin/visa/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { VisaManagement } from "@/components/admin/visa-management"

export default async function AdminVisaPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">مدیریت خدمات ویزا</h1>
          <p className="text-muted-foreground mt-2">
            ایجاد، ویرایش و حذف خدمات ویزای کشورهای مختلف
          </p>
        </div>

        <VisaManagement />
      </div>
    </div>
  )
}