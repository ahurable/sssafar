import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { BlogGrid } from "@/components/blog/blog-grid"
import { BlogCategories } from "@/components/blog/blog-categories"

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">وبلاگ اُمسافر</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              راهنماهای سفر، نکات مفید و آخرین اخبار گردشگری
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <BlogCategories />
            </aside>
            <div className="lg:col-span-3">
              <BlogGrid />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
