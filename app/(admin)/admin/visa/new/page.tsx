// app/admin/visa/new/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { CreateVisaForm } from "@/components/admin/create-visa-form"

export default async function NewVisaServicePage() {
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
              href="/admin/visa" 
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              ← بازگشت به مدیریت خدمات
            </a>
          </div>
          <h1 className="text-3xl font-bold text-foreground">ایجاد خدمت ویزای جدید</h1>
          <p className="text-muted-foreground mt-2">
            اطلاعات خدمت جدید ویزا را وارد کنید
          </p>
        </div>

        <CreateVisaForm />
      </div>
    </div>
  )
}