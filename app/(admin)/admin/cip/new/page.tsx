import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { CreateCipForm } from "@/components/admin/create-cip-form"

export default async function NewCipServicePage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <a 
              href="/admin/cip" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← بازگشت به مدیریت خدمات
            </a>
          </div>
          <h1 className="text-3xl font-bold text-foreground">ایجاد خدمت CIP جدید</h1>
          <p className="text-muted-foreground mt-2">
            اطلاعات خدمت جدید CIP را وارد کنید
          </p>
        </div>

        <CreateCipForm />
      </div>
    </div>
  )
}