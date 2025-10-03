import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FlightList } from "@/components/flights/flight-list"
import { FlightFilters } from "@/components/flights/flight-filters"

export default function FlightsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">خرید بلیط هواپیما</h1>
            <p className="text-muted-foreground">پروازهای داخلی با بهترین قیمت</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <FlightFilters />
            </aside>
            <div className="lg:col-span-3">
              <FlightList />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
