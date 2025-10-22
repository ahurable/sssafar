import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditCipForm } from "@/components/admin/edit-cip-form"
import { notFound } from "next/navigation"

interface EditCipServicePageProps {
  params: {
    id: string
  }
}

export default async function EditCipServicePage({ params }: EditCipServicePageProps) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  // Fetch the service data
  const service = await prisma.cipService.findUnique({
    where: { id: params.id },
  })

  if (!service) {
    notFound()
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
          <h1 className="text-3xl font-bold text-foreground">ویرایش خدمت CIP</h1>
          <p className="text-muted-foreground mt-2">
            اطلاعات خدمت CIP را ویرایش کنید
          </p>
        </div>

        <EditCipForm service={service} />
      </div>
    </div>
  )
}