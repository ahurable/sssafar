// app/admin/tours/[id]/edit/page.tsx (Server Component)
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import EditTourPageClient from "./tour-edit-page"

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
        },
        reservations: true
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

  // Convert dates to strings for client component
  const serializedTour = {
    ...tour,
    startDate: tour.startDate.toISOString(),
    endDate: tour.endDate.toISOString(),
    createdAt: tour.createdAt.toISOString(),
    updatedAt: tour.updatedAt.toISOString(),
    reservations: tour.reservations.map(reservation => ({
      ...reservation,
      createdAt: reservation.createdAt.toISOString(),
      updatedAt: reservation.updatedAt.toISOString(),
    }))
  }

  return <EditTourPageClient tour={serializedTour} />
}