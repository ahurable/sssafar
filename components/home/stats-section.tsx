"use client"

import { useEffect, useRef, useState } from "react"

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
    stats.forEach((stat, index) => {
      let startTimestamp: number | null = null
      const duration = 2000 // 2 seconds
      
      const step = (timestamp: number) => {
        if (!startTimestamp) startTimestamp = timestamp
        const progress = Math.min((timestamp - startTimestamp) / duration, 1)
        
        setAnimatedValues(prev => {
          const newValues = [...prev]
          newValues[index] = Math.floor(stat.value * progress)
          return newValues
        })
        
        if (progress < 1) {
          requestAnimationFrame(step)
        }
      }
      
      requestAnimationFrame(step)
    })
  }, [])

  return (
    <section ref={sectionRef} className=" py-16 md:py-20">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="mb-2 text-4xl font-bold text-black md:text-5xl">
                {animatedValues[index].toLocaleString("fa-IR")}
                {stat.suffix}
              </div>
              <div className="text-lg text-black">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}