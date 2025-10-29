// app/tours/[id]/page.tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { TourDetails } from "@/components/tours/tour-details"
import { BookingForm } from "@/components/tours/booking-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

async function getTour(id: string) {
  try {
    const tour = await prisma.tour.findUnique({
      where: {
        id,
        isActive: true
      },
      include: {
        prices: true,
        itineraries: {
          orderBy: { day: 'asc' }
        },
        routes: {
          orderBy: { order: 'asc' }
        },
        images: true,
        rules: true,
        transports: {
          orderBy: { departure: 'asc' }
        }
      }
    })

    return tour
  } catch (error) {
    console.error('Error fetching tour:', error)
    return null
  }
}

export default async function TourDetailPage({
  params
}: {
  params: { id: string }
}) {
  const tour = await getTour(params.id)

  if (!tour) {
    notFound()
  }

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Tour Details */}
          <div className="lg:col-span-2">
            <TourDetails tour={tour} />
          </div>

          {/* Booking Sidebar */}
          <div className="lg:col-span-1">
            <BookingForm tour={tour} />
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  )
}