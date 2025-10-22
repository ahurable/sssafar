import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { HotelList } from "@/components/hotels/hotel-list"
import { HotelFilters } from "@/components/hotels/hotel-filters"

export default function HotelsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">رزرو هتل</h1>
            <p className="text-muted-foreground">بهترین هتل‌ها را با مناسب‌ترین قیمت پیدا کنید</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <HotelFilters />
            </aside>
            <div className="lg:col-span-3">
              <HotelList />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
