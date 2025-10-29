// app/admin/tours/create/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { CreateTourForm } from "@/components/admin/create-tour-form"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default async function CreateTourPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/tours"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به لیست تورها
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold text-foreground">ایجاد تور جدید</h1>
          <p className="text-muted-foreground mt-2">
            اطلاعات تور جدید را وارد کنید
          </p>
        </div>

        <CreateTourForm />
      </div>
    </div>
  )
}