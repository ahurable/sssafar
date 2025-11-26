import { HeroSlider } from "@/components/home/hero-section"
import { SearchSection } from "@/components/home/search-section"
import { FeaturesSection } from "@/components/home/features-section"
import { FeaturedBlogSection } from "@/components/home/featured-blog-section"
import { StatsSection } from "@/components/home/stats-section"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { FAQSection } from "@/components/faq/faq-section"
import { env } from "process"

interface Post {
  id: string
  title: string
  excerpt: string
  coverImage: string
  category: string
  featured: boolean
  author: {
    firstName: string | null
    lastName: string | null
  }
}

async function getFeaturedPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/posts?published=true&featured=true&limit=5`, {
      next: { revalidate: 60 }
    })
    
    if (!res.ok) {
      throw new Error('Failed to fetch posts')
    }
    
    const data = await res.json()
    // // console.log(data.posts)
    return data.posts || []
  } catch (error) {
    console.error('Error fetching posts:', error)
    return []
  }
}

export default async function HomePage() {
  const posts = await getFeaturedPosts()

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <SearchSection />
        <HeroSlider posts={posts} />
        <FeaturesSection />
        <StatsSection />
        <FAQSection />
      </main>
      <Footer />
    </div>
  )
}