"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Clock, CreditCard, Headphones } from "lucide-react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const features = [
  {
    icon: Shield,
    title: "پرداخت امن",
    description: "تمامی پرداخت‌ها با بالاترین استانداردهای امنیتی انجام می‌شود",
  },
  {
    icon: Clock,
    title: "رزرو سریع",
    description: "رزرو هتل و خرید بلیط در کمتر از 2 دقیقه",
  },
  {
    icon: CreditCard,
    title: "بهترین قیمت",
    description: "تضمین بهترین قیمت بازار با امکان مقایسه",
  },
  {
    icon: Headphones,
    title: "پشتیبانی 24/7",
    description: "تیم پشتیبانی ما همیشه در خدمت شماست",
  },
]

export function FeaturesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, index) => {
        gsap.from(card, {
          scale: 0.8,
          opacity: 0,
          duration: 0.6,
          ease: "back.out(1.7)",
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
    <section ref={sectionRef} className="bg-muted/30 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-balance md:text-4xl">چرا سفرتودی؟</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground leading-relaxed">
            ما با ارائه بهترین خدمات و امکانات، سفر شما را به تجربه‌ای فراموش‌نشدنی تبدیل می‌کنیم
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                ref={(el) => {
                  cardsRef.current[index] = el
                }}
                className="border-none shadow-lg transition-shadow hover:shadow-xl"
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
