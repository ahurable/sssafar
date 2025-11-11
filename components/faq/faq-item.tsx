// components/faq/faq-item.tsx
"use client"

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

export function FAQItem({ faq, isOpen, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-gray-300">
      {/* Question */}
      <button
        onClick={onToggle}
        className="w-full px-4 py-4 text-right flex items-center justify-between gap-4 hover:bg-gray-50"
      >
        <span className="font-medium text-lg text-black text-right flex-1">
          {faq.question}
        </span>
        
        <div>
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-black" />
          ) : (
            <ChevronDown className="h-5 w-5 text-black" />
          )}
        </div>
      </button>

      {/* Answer */}
      {isOpen && (
        <div className="px-4 pb-4">
          <div className="text-black leading-relaxed whitespace-pre-wrap">
            {faq.answer}
          </div>
        </div>
      )}
    </div>
  )
}