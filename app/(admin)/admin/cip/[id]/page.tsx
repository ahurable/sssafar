import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditCipForm } from "@/components/admin/edit-cip-form"
import { CipReservations } from "@/components/admin/cip-reservations"
import { notFound } from "next/navigation"

interface EditCipServicePageProps {
  params: {
    id: string
  }
}

async function getCipServiceWithReservations(id: string) {
  try {
    const service = await prisma.cipService.findUnique({
      where: { id },
      include: {
        reservations: {
          orderBy: { createdAt: 'desc' },
          take: 50 // Last 50 reservations
        }
      }
    })

    return service
  } catch (error) {
    console.error("Error fetching CIP service with reservations:", error)
    return null
  }
}

export default async function EditCipServicePage({ params }: EditCipServicePageProps) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  // Fetch the service data with reservations
  const service = await getCipServiceWithReservations(params.id)

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
            اطلاعات خدمت CIP را ویرایش کنید و درخواست‌های رزرو را مدیریت کنید
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Edit Form - Takes 2/3 on large screens */}
          <div className="xl:col-span-2">
            <EditCipForm service={service} />
          </div>

          {/* Reservations Sidebar - Takes 1/3 on large screens */}
          <div className="xl:col-span-1">
            <CipReservations 
              serviceId={service.id} 
              reservations={service.reservations} 
            />
          </div>
        </div>
      </div>
    </div>
  )
}