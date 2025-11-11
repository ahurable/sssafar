// components/faq/faq-section.tsx
"use client"

import { useState, useEffect } from "react"
import { FAQItem } from "./faq-item"

interface FAQ {
  id: string
  question: string
  answer: string
  type: string
  order: number
  isActive: boolean
}

interface FAQSectionProps {
  initialTab?: string
  showTitle?: boolean
  className?: string
  maxHeight?: string
}

const TAB_CONFIG = [
  { key: 'ALL', label: 'همه' },
  { key: 'HOTEL', label: 'هتل' },
  { key: 'AIR', label: 'پرواز' },
  { key: 'CIP', label: 'سیپ' },
  { key: 'TOUR', label: 'تور' },
  { key: 'CITY_TOUR', label: 'گشت شهری' },
  { key: 'VISA', label: 'ویزا' },
  { key: 'OTHER', label: 'سایر' },
] as const

export function FAQSection({ 
  initialTab = 'ALL', 
  showTitle = true,
  className = "",
  maxHeight = "600px"
}: FAQSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/faqs')
        
        if (!response.ok) {
          throw new Error('Failed to fetch FAQs')
        }
        
        const data = await response.json()
        setFaqs(data.faqs || [])
      } catch (err) {
        console.error('Error fetching FAQs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  // Filter only active FAQs and sort by order
  const allFAQs = faqs
    .filter(faq => faq.isActive)
    .sort((a, b) => a.order - b.order)

  const getCurrentFAQs = () => {
    if (activeTab === 'ALL') {
      return allFAQs
    }
    return allFAQs.filter(faq => faq.type === activeTab)
  }

  const currentFAQs = getCurrentFAQs()

  const handleItemToggle = (id: string) => {
    setOpenItemId(openItemId === id ? null : id)
  }

  if (loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-black text-lg">در حال بارگذاری سوالات...</div>
      </div>
    )
  }

  // Show nothing if no active FAQs exist
  if (allFAQs.length === 0) {
    return null
  }

  return (
    <div className={`max-w-4xl mx-auto py-8 ${className}`}>
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-black mb-4">سوالات متداول</h2>
        </div>
      )}

      {/* Tabs Section */}
      <div className="mb-8">
        <div className="flex justify-center border-b border-gray-300 overflow-x-auto">
          <div className="flex min-w-max">
            {TAB_CONFIG.map((tab) => {
              // Calculate count for each tab
              const count = tab.key === 'ALL' 
                ? allFAQs.length 
                : allFAQs.filter(faq => faq.type === tab.key).length
              
              // Only show tabs that have FAQs or the ALL tab
              if (count === 0 && tab.key !== 'ALL') return null
              
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    px-6 py-4 text-lg font-medium whitespace-nowrap
                    transition-colors duration-200
                    ${activeTab === tab.key
                      ? 'text-blue-800 border-b-2 border-blue-800'
                      : 'text-black hover:text-gray-600'
                    }
                  `}
                >
                  {tab.label}
                  {count > 0 && (
                    <span className="mr-2 text-sm opacity-70">({count})</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* FAQ Items Container - Scrollable */}
      <div 
        className="space-y-4 overflow-y-auto"
        style={{ 
          maxHeight,
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none', // IE and Edge
        }}
      >
        {/* Hide scrollbar for Webkit browsers (Chrome, Safari, Opera) */}
        <style jsx>{`
          div::-webkit-scrollbar {
            display: none;
          }
        `}</style>

        {currentFAQs.length === 0 ? (
          <div className="text-center py-8 text-black text-lg">
            سوالی در این دسته یافت نشد
          </div>
        ) : (
          currentFAQs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openItemId === faq.id}
              onToggle={() => handleItemToggle(faq.id)}
            />
          ))
        )}
      </div>
    </div>
  )
}