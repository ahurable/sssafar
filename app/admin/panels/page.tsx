import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { PostsManagement } from "@/components/admin/posts-management"
import { PanelManagement } from "@/components/admin/panel-management"

export default async function AdminPostsPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">مدیریت پست‌ها</h1>
          <p className="text-muted-foreground mt-2">ایجاد، ویرایش و حذف پست‌های وبلاگ</p>
        </div>

        <PanelManagement />
      </div>
    </div>
  )
}
