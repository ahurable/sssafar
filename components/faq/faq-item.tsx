// components/faq/faq-item.tsx
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

interface FAQ {
  id: string
  question: string
  answer: string
  type: string
  order: number
}

interface FAQItemProps {
  faq: FAQ
  isOpen: boolean
  onToggle: () => void
}

const TYPE_ICONS = {
  HOTEL: "🏨",
  AIR: "✈️",
  CIP: "⭐",
  TOUR: "🗺️",
  CITY_TOUR: "🏛️",
  VISA: "🛂",
  OTHER: "❓"
} as const

export function FAQItem({ faq, isOpen, onToggle }: FAQItemProps) {
  const [isAnimating, setIsAnimating] = useState(false)

  const handleToggle = () => {
    setIsAnimating(true)
    onToggle()
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <>
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow duration-200">
      {/* Question */}
      <button
        onClick={handleToggle}
        className="w-full px-6 py-4 text-right flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors duration-200"
      >
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xl">
            {TYPE_ICONS[faq.type as keyof typeof TYPE_ICONS] || "❓"}
          </span>
          <span className="font-semibold text-lg text-foreground text-right flex-1">
            {faq.question}
          </span>
        </div>
        
        <div className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-blue-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Answer */}
      <div className={`
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
      `}>
        <div className="px-6 pb-4 pt-2 border-t border-gray-100">
          <div className="prose prose-lg max-w-none text-justify">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {faq.answer}
            </p>
          </div>
          
          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
            <span className="text-xs text-gray-500">
              دسته: {Object.entries(TYPE_ICONS).find(([key]) => key === faq.type)?.[1] || "سایر"}
            </span>
            {faq.order > 0 && (
              <span className="text-xs text-gray-500">
                اولویت: {faq.order}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  )
}