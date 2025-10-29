// app/tours/page.tsx
import { prisma } from "@/lib/prisma"
import { TourCard } from "@/components/tours/tour-card"
import { TourFilters } from "@/components/tours/tour-filters"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

async function getTours(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    const where: any = {
      isActive: true,
      startDate: {
        gte: new Date()
      }
    }

    // Filter by featured
    if (searchParams.featured === 'true') {
      where.featured = true
    }

    // Filter by date range
    if (searchParams.startDate) {
      where.startDate = {
        gte: new Date(searchParams.startDate as string)
      }
    }

    // Filter by price range
    if (searchParams.minPrice || searchParams.maxPrice) {
      where.prices = {
        some: {
          price: {
            ...(searchParams.minPrice && { gte: parseFloat(searchParams.minPrice as string) }),
            ...(searchParams.maxPrice && { lte: parseFloat(searchParams.maxPrice as string) })
          }
        }
      }
    }

    const tours = await prisma.tour.findMany({
      where,
      include: {
        prices: true,
        routes: {
          orderBy: { order: 'asc' },
          take: 1
        },
        images: true,
        transports: {
          take: 1
        }
      },
      orderBy: {
        featured: 'desc'
      }
    })

    return tours
  } catch (error) {
    console.error('Error fetching tours:', error)
    return []
  }
}

export default async function ToursPage({
  searchParams
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const tours = await getTours(searchParams)

  return (
    <>
    <Header/>
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">تورهای مسافرتی</h1>
          <p className="text-xl text-muted-foreground">
            بهترین تجربه‌های سفر را با ما تجربه کنید
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Tours Grid */}
          <div className="lg:w-4/4">
            {tours.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-muted-foreground text-lg mb-4">
                  هیچ توری یافت نشد
                </div>
                <p className="text-muted-foreground">
                  لطفا فیلترهای جستجو را تغییر دهید
                </p>
              </div>
            ) : (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <p className="text-muted-foreground">
                    {tours.length} تور یافت شد
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {tours.map((tour) => (
                    <TourCard key={tour.id} tour={tour} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer/>
    </>
  )
}