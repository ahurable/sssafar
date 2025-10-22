"use client"

import { useEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const stats = [
  { value: 50000, label: "مسافر راضی", suffix: "+" },
  { value: 1200, label: "هتل همکار", suffix: "+" },
  { value: 98, label: "رضایت مشتری", suffix: "%" },
  { value: 24, label: "پشتیبانی", suffix: "/7" },
]

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [animatedValues, setAnimatedValues] = useState(stats.map(() => 0))

  useEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 70%",
        onEnter: () => {
          stats.forEach((stat, index) => {
            gsap.to(
              {},
              {
                duration: 2,
                ease: "power2.out",
                onUpdate: function () {
                  const progress = this.progress()
                  setAnimatedValues((prev) => {
                    const newValues = [...prev]
                    newValues[index] = Math.floor(stat.value * progress)
                    return newValues
                  })
                },
              },
            )
          })
        },
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section ref={sectionRef} className="bg-emerald-600 py-16 text-emerald-600-foreground md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-4xl text-white font-bold md:text-5xl">
                {animatedValues[index].toLocaleString("fa-IR")}
                {stat.suffix}
              </div>
              <div className="text-lg text-white">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
