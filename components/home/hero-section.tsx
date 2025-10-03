"use client"

import { useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import gsap from "gsap"

export function HeroSection() {
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const subtitleRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } })

      tl.from(titleRef.current, {
        y: 100,
        opacity: 0,
        duration: 1,
      })
        .from(
          subtitleRef.current,
          {
            y: 50,
            opacity: 0,
            duration: 0.8,
          },
          "-=0.5",
        )
        .from(
          buttonRef.current,
          {
            y: 30,
            opacity: 0,
            duration: 0.6,
          },
          "-=0.4",
        )
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-[90vh] items-center justify-center overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23000000' fillOpacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 ref={titleRef} className="mb-6 text-5xl font-bold leading-tight text-balance md:text-6xl lg:text-7xl">
          سفر رویایی خود را
          <br />
          <span className="bg-gradient-to-l from-primary to-primary/60 bg-clip-text text-transparent">
            با ما تجربه کنید
          </span>
        </h1>
        <p
          ref={subtitleRef}
          className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground leading-relaxed md:text-xl"
        >
          رزرو آنلاین هتل، خرید بلیط هواپیما و قطار با بهترین قیمت و خدمات عالی. سفر شما از اینجا شروع می‌شود.
        </p>
        <div ref={buttonRef} className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button size="lg" className="text-base">
            شروع رزرو
            <ArrowLeft className="mr-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" className="text-base bg-transparent">
            مشاهده تورها
          </Button>
        </div>
      </div>

      {/* Floating Elements */}
      <div className="absolute bottom-10 left-10 hidden lg:block">
        <div className="h-20 w-20 rounded-full bg-primary/10 blur-2xl" />
      </div>
      <div className="absolute top-20 right-20 hidden lg:block">
        <div className="h-32 w-32 rounded-full bg-accent/10 blur-3xl" />
      </div>
    </section>
  )
}
