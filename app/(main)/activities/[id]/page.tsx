// app/activities/[city]/[slug]/page.tsx
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { CityTourDetails } from "@/components/activities/city-tour-details"
import { CityTourBookingForm } from "@/components/activities/city-tour-booking-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

async function getCityTour(id: string) {
  try {
    const tour = await prisma.cityTour.findFirst({
      where: {
        id: id,
        isActive: true
      },
      include: {
        prices: true,
        inclusions: true,
        exclusions: true,
        itineraries: {
          orderBy: { order: 'asc' }
        }
      }
    })

    return tour
  } catch (error) {
    console.error('Error fetching city tour:', error)
    return null
  }
}

export default async function CityTourDetailPage({
  params
}: {
  params: { id: string }
}) {
  const tour = await getCityTour(params.id)

  if (!tour) {
    notFound()
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Tour Details */}
            <div className="lg:col-span-2">
              <CityTourDetails tour={tour} />
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <CityTourBookingForm tour={tour} />
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}