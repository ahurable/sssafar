import { getSession } from "@/lib/auth"
import { ToursManagement } from "@/components/admin/tours-management"

export default async function AdminToursPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">مدیریت تورها</h1>
          <p className="text-muted-foreground mt-2">ایجاد، ویرایش و حذف تورهای مسافرتی</p>
        </div>

        <ToursManagement />
      </div>
    </div>
  )
}