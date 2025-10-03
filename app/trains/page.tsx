import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { TrainList } from "@/components/trains/train-list"
import { TrainFilters } from "@/components/trains/train-filters"

export default function TrainsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">خرید بلیط قطار</h1>
            <p className="text-muted-foreground">سفر راحت و اقتصادی با قطار</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <TrainFilters />
            </aside>
            <div className="lg:col-span-3">
              <TrainList />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
