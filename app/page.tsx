import { HeroSection } from "@/components/home/hero-section"
import { SearchSection } from "@/components/home/search-section"
import { FeaturesSection } from "@/components/home/features-section"
import { FeaturedBlogSection } from "@/components/home/featured-blog-section"
import { StatsSection } from "@/components/home/stats-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <HeroSection />
        <SearchSection />
        <FeaturesSection />
        <StatsSection />
        <FeaturedBlogSection />
      </main>
      <Footer />
    </div>
  )
}
