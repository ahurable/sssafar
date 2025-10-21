// app/admin/tours/[id]/edit/page.tsx
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { EditTourForm } from "@/components/admin/edit-tour-form"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

async function getTour(id: string) {
  try {
    const tour = await prisma.tour.findUnique({
      where: { id },
      include: {
        prices: true,
        itineraries: {
          orderBy: { day: 'asc' }
        },
        routes: {
          orderBy: { order: 'asc' }
        },
        rules: true,
        transports: {
          orderBy: { departure: 'asc' }
        },
        images: {
          orderBy: [{ isPrimary: 'desc' }, { order: 'asc' }]
        }
      }
    })
    return tour
  } catch (error) {
    console.error('Error fetching tour:', error)
    return null
  }
}

export default async function EditTourPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  const tour = await getTour(params.id)

  if (!tour) {
    redirect("/admin/tours")
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
          
          <h1 className="text-3xl font-bold text-foreground">ویرایش تور</h1>
          <p className="text-muted-foreground mt-2">
            در حال ویرایش: {tour.title}
          </p>
        </div>

        <EditTourForm tour={tour} />
      </div>
    </div>
  )
}