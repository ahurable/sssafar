// app/activities/page.tsx
import { prisma } from "@/lib/prisma"
import { CityTourCard } from "@/components/activities/city-tour-card"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

async function getCityTours(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const where: any = {
      isActive: true
    }

    // Filter by city
    if (searchParams.city) {
      where.city = {
        contains: searchParams.city as string,
        mode: 'insensitive'
      }
    }

    // Filter by date range (if needed for city tours)
    if (searchParams.from || searchParams.to) {
      // For city tours, we might want to filter by availability dates
      // This would require adding availability dates to the CityTour model
      // For now, we'll just use the basic filters
    }

    // Filter by featured
    if (searchParams.featured === 'true') {
      where.featured = true
    }

    const cityTours = await prisma.cityTour.findMany({
      where,
      include: {
        prices: true,
        inclusions: true,
        exclusions: true,
        itineraries: {
          orderBy: { order: 'asc' }
        }
      },
      orderBy: {
        featured: 'desc'
      }
    })

    return cityTours
  } catch (error) {
    console.error('Error fetching city tours:', error)
    return []
  }
}

export default async function ActivitiesPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const cityTours = await getCityTours(searchParams)
  
  // Extract query params for display
  const destination = searchParams.city as string || ''
  const fromDate = searchParams.from as string || ''
  const toDate = searchParams.to as string || ''

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          {/* Header with search info */}
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-foreground mb-4">
              گشت‌های شهری
            </h1>
            <p className="text-xl text-muted-foreground mb-6">
              بهترین تجربه‌های گردشگری در شهرهای مختلف
            </p>

            {/* Search Summary */}
            {(destination || fromDate || toDate) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-2xl mx-auto">
                <div className="flex flex-wrap gap-4 justify-center items-center text-sm">
                  {destination && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">مقصد:</span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        {destination}
                      </span>
                    </div>
                  )}
                  {fromDate && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">از:</span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        {new Date(fromDate).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  )}
                  {toDate && (
                    <div className="flex items-center gap-2">
                      <span className="font-medium">تا:</span>
                      <span className="bg-white px-3 py-1 rounded-full border">
                        {new Date(toDate).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* City Tours Grid */}
          <div className="lg:w-full">
            {cityTours.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-4">
                  هیچ گشت شهری یافت نشد
                </div>
                <p className="text-muted-foreground">
                  {destination ? `هیچ گشت شهری در ${destination} یافت نشد` : 'لطفا فیلترهای جستجو را تغییر دهید'}
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-muted-foreground">
                    {cityTours.length} گشت شهری یافت شد
                    {destination && ` در ${destination}`}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cityTours.map((tour) => (
                    <CityTourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}