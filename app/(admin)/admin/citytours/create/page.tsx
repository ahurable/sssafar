// app/admin/city-tours/page.tsx
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"
import { CreateCityTourForm } from "@/components/admin/create-city-tour-form"

export default async function AdminCityToursPage() {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">ایجاد گشت‌های شهری</h1>
        </div>

        <CreateCityTourForm />
      </div>
    </div>
  )
}