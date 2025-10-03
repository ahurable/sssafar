"use client"

import { useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import { blogPosts } from "@/lib/data/blog-posts"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export function FeaturedBlogSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  const featuredPosts = blogPosts.filter((post) => post.featured).slice(0, 3)

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card) => {
        gsap.from(card, {
          y: 80,
          opacity: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            end: "top 60%",
            scrub: 1,
          },
        })
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="mb-2 text-3xl font-bold md:text-4xl">مقالات پیشنهادی</h2>
            <p className="text-muted-foreground">راهنماهای سفر و نکات مفید برای مسافران</p>
          </div>
          <Button variant="ghost" asChild className="hidden md:flex">
            <Link href="/blog">
              مشاهده همه
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredPosts.map((post, index) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              ref={(el) => {
                cardsRef.current[index] = el
              }}
            >
              <Card className="group h-full overflow-hidden transition-all hover:shadow-xl">
                <div className="relative h-48 w-full overflow-hidden">
                  <Image
                    src={post.image || "/placeholder.svg"}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 right-3 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
                    {post.category}
                  </div>
                </div>
                <CardContent className="p-5">
                  <h3 className="mb-2 text-xl font-bold leading-tight text-balance group-hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="mb-4 text-sm text-muted-foreground leading-relaxed line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{post.author}</span>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-8 text-center md:hidden">
          <Button variant="outline" asChild>
            <Link href="/blog">
              مشاهده همه مقالات
              <ArrowLeft className="mr-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
