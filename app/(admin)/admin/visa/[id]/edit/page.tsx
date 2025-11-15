// app/admin/visa/[id]/edit/page.tsx (Server Component)
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EditVisaPageClient from "./visa-edit-page"

async function getVisa(id: string) {
  try {
    const visa = await prisma.visaService.findUnique({
      where: { id },
      include: {
        faq: {
          orderBy: { order: 'asc' }
        },
        bookings: true
      }
    })
    return visa
  } catch (error) {
    console.error('Error fetching visa service:', error)
    return null
  }
}

export default async function EditVisaPage({
  params
}: {
  params: { id: string }
}) {
  const session = await getSession()

  if (!session || session.role !== "ADMIN") {
    redirect("/")
  }

  const visa = await getVisa(params.id)

  if (!visa) {
    redirect("/admin/visa")
  }

  // Convert dates to strings for client component
  const serializedVisa = {
    ...visa,
    createdAt: visa.createdAt.toISOString(),
    updatedAt: visa.updatedAt.toISOString(),
    bookings: visa.bookings.map(booking => ({
      ...booking,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    }))
  }

  return <EditVisaPageClient visa={serializedVisa} />
}