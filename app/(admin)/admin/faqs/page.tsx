// app/admin/faqs/page.tsx
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { FAQsManagement } from "@/components/admin/faqs-management"

export default async function AdminFAQsPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">مدیریت سوالات متداول</h1>
          <p className="text-muted-foreground mt-2">ایجاد، ویرایش و حذف سوالات متداول</p>
        </div>

        <FAQsManagement />
      </div>
    </div>
  )
}