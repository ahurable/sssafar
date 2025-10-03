import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { UsersManagement } from "@/components/admin/users-management"

export default async function AdminUsersPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">مدیریت کاربران</h1>
          <p className="text-muted-foreground mt-2">مشاهده و مدیریت کاربران سیستم</p>
        </div>

        <UsersManagement />
      </div>
    </div>
  )
}
