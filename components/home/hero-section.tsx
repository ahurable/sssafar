"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Post {
  id: string
  title: string
  excerpt: string
  coverImage: string
  category: string
  featured: boolean
}

interface HeroSliderProps {
  posts: Post[]
}

export function HeroSlider({ posts }: HeroSliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  const featuredPosts = posts.filter(post => post.featured).slice(0, 5)

  useEffect(() => {
    if (!isAutoPlaying || featuredPosts.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredPosts.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [currentSlide, isAutoPlaying, featuredPosts.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredPosts.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredPosts.length) % featuredPosts.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  if (featuredPosts.length === 0) {
    return null
  }

  return (
    <div 
      className="relative lg:h-[750px] lg:max-w-6xl h-screen mx-auto lg:rounded-2xl lg:my-8 w-full overflow-hidden"
      onMouseEnter={() => setIsAutoPlaying(false)}
      onMouseLeave={() => setIsAutoPlaying(true)}
    >
      {/* Slides */}
      <div className="relative h-full w-full">
        {featuredPosts.map((post, index) => (
          <div
            key={post.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Background Image */}
            <div
              className="absolute top-0 inset-0 bg-center bg-no-repeat bg-cover lg:rounded-2xl h-full w-full"
              style={{ backgroundImage: `url(${process.env.NEXT_PUBLIC_APP_URL + post.coverImage})` }}
            >
              <div className="absolute inset-0 bg-black opacity-40" />
            </div>

            {/* Content */}
            <div className="relative h-full flex items-end pb-32">
              <div className="container mx-auto px-4 text-white">
                <div className="max-w-4xl">
                  <div className="inline-flex items-center gap-2 mb-4">
                    <span className="px-3 py-1 bg-red-500 text-white text-sm rounded-full font-semibold">
                      ویژه
                    </span>
                    <span className="px-3 py-1 bg-white bg-opacity-20 text-black text-sm rounded-full backdrop-blur-sm">
                      {post.category}
                    </span>
                  </div>
                  
                  <h2 className="text-5xl md:text-6xl font-bold mb-6 leading-tight drop-shadow-2xl">
                    {post.title}
                  </h2>
                  
                  <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl leading-relaxed drop-shadow-lg">
                    {post.excerpt}
                  </p>

                  <div className="flex items-center gap-4">
                    <Link href={`/posts/${post.id}`}>
                      <Button 
                        size="lg" 
                        className="bg-white text-gray-900 hover:bg-gray-100 font-semibold text-lg px-8 py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-105"
                      >
                        مطالعه مقاله
                      </Button>
                    </Link>
                    <Link href="/posts">
                      <Button 
                        variant="outline" 
                        size="lg"
                        className="border-white text-black hover:bg-white hover:text-gray-900 font-semibold text-lg px-8 py-3 rounded-full backdrop-blur-sm transition-all duration-300"
                      >
                        مشاهده همه مقالات
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {featuredPosts.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 transform -translate-y-1/2 z-20 bg-white opacity-20 hover:bg-opacity-30 text-black p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            aria-label="مقاله قبلی"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 z-20 bg-white opacity-20 hover:bg-opacity-30 text-black p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110"
            aria-label="مقاله بعدی"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {featuredPosts.length > 1 && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-3">
          {featuredPosts.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white bg-opacity-50 hover:bg-opacity-75"
              }`}
              aria-label={`برو به اسلاید ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />

      {/* Progress Bar */}
      {featuredPosts.length > 1 && isAutoPlaying && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white bg-opacity-20 z-20">
          <div
            className="h-full bg-white transition-all duration-5000 ease-linear"
            style={{
              width: `${((currentSlide + 1) / featuredPosts.length) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  )
}