import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { CipManagement } from "@/components/admin/cip-management"

export default async function AdminCipPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">مدیریت خدمات CIP</h1>
          <p className="text-muted-foreground mt-2">
            ایجاد، ویرایش و حذف خدمات CIP فرودگاهی
          </p>
        </div>

        <CipManagement />
      </div>
    </div>
  )
}