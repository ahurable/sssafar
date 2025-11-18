"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Clock, CreditCard, Headphones } from "lucide-react"

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

  return (
    <section ref={sectionRef} className=" py-16">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold text-black md:text-4xl">چرا سفرتودی؟</h2>
          <p className="mx-auto max-w-2xl leading-relaxed text-black">
            ما با ارائه بهترین خدمات و امکانات، سفر شما را به تجربه‌ای فراموش‌نشدنی تبدیل می‌کنیم
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card
                key={index}
                className="border border-gray-300 bg-[#fffefe] shadow-sm"
              >
                <CardContent className="flex flex-col items-center p-6 text-center">
                  <div className="mb-4 flex h-16 w-16 items-center justify-center bg-gray-100">
                    <Icon className="h-8 w-8 text-black" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-black">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-black">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}