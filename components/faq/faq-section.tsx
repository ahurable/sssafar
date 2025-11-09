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

interface GroupedFAQs {
  HOTEL: FAQ[]
  AIR: FAQ[]
  CIP: FAQ[]
  TOUR: FAQ[]
  CITY_TOUR: FAQ[]
  VISA: FAQ[]
  OTHER: FAQ[]
}

interface FAQSectionProps {
  initialTab?: string
  showTitle?: boolean
  className?: string
}

const TAB_CONFIG = [
  { key: 'ALL', label: 'همه', icon: '📋' },
  { key: 'HOTEL', label: 'رزرو هتل', icon: '🏨' },
  { key: 'AIR', label: 'پرواز', icon: '✈️' },
  { key: 'CIP', label: 'سیپ', icon: '⭐' },
  { key: 'TOUR', label: 'تور', icon: '🗺️' },
  { key: 'CITY_TOUR', label: 'گشت شهری', icon: '🏛️' },
  { key: 'VISA', label: 'ویزا', icon: '🛂' },
  { key: 'OTHER', label: 'سایر', icon: '❓' },
] as const

export function FAQSection({ 
  initialTab = 'ALL', 
  showTitle = true,
  className = "" 
}: FAQSectionProps) {
  const [activeTab, setActiveTab] = useState<string>(initialTab)
  const [openItemId, setOpenItemId] = useState<string | null>(null)
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch FAQs
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
        setError('خطا در بارگذاری سوالات')
      } finally {
        setLoading(false)
      }
    }

    fetchFAQs()
  }, [])

  // Group FAQs by type
  const groupedFAQs: GroupedFAQs = {
    HOTEL: faqs.filter(faq => faq.type === 'HOTEL' && faq.isActive),
    AIR: faqs.filter(faq => faq.type === 'AIR' && faq.isActive),
    CIP: faqs.filter(faq => faq.type === 'CIP' && faq.isActive),
    TOUR: faqs.filter(faq => faq.type === 'TOUR' && faq.isActive),
    CITY_TOUR: faqs.filter(faq => faq.type === 'CITY_TOUR' && faq.isActive),
    VISA: faqs.filter(faq => faq.type === 'VISA' && faq.isActive),
    OTHER: faqs.filter(faq => faq.type === 'OTHER' && faq.isActive),
  }

  // Get all active FAQs sorted by order
  const allFAQs = faqs
    .filter(faq => faq.isActive)
    .sort((a, b) => a.order - b.order)

  // Get FAQs for active tab
  const getCurrentFAQs = () => {
    if (activeTab === 'ALL') {
      return allFAQs
    }
    return groupedFAQs[activeTab as keyof GroupedFAQs] || []
  }

  const currentFAQs = getCurrentFAQs()

  const handleItemToggle = (id: string) => {
    setOpenItemId(openItemId === id ? null : id)
  }

  // Count FAQs per category
  const getTabCount = (tabKey: string) => {
    if (tabKey === 'ALL') return allFAQs.length
    return groupedFAQs[tabKey as keyof GroupedFAQs]?.length || 0
  }

  if (loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-4">در حال بارگذاری سوالات...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-red-600 mb-4">⚠️</div>
        <p className="text-muted-foreground">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          تلاش مجدد
        </button>
      </div>
    )
  }

  if (allFAQs.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="text-4xl mb-4">❓</div>
        <h3 className="text-lg font-semibold mb-2">سوالی یافت نشد</h3>
        <p className="text-muted-foreground">هیچ سوال فعالی در سیستم وجود ندارد</p>
      </div>
    )
  }

  return (
    <div className={`max-w-6xl py-12 mx-auto ${className}`}>
      {/* Title */}
      {showTitle && (
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            سوالات متداول
          </h2>
          <p className="text-lg text-muted-foreground">
            پاسخ سوالات پرتکرار شما
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-8">
        <div className="flex gap-2 justify-center overflow-auto">
          {TAB_CONFIG.map((tab) => {
            const count = getTabCount(tab.key)
            if (count === 0 && tab.key !== 'ALL') return null
            
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  flex items-center gap-2 px-4 py-3 rounded-lg border transition-all duration-200
                  ${activeTab === tab.key
                    ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                    : 'bg-white text-foreground border-gray-200 hover:border-blue-300 hover:shadow-md'
                  }
                `}
              >
                <span className="text-lg">{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
                <span className={`
                  text-xs px-2 py-1 rounded-full
                  ${activeTab === tab.key
                    ? 'bg-white text-blue-600'
                    : 'bg-gray-100 text-gray-600'
                  }
                `}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* FAQ Items */}
      <div className="space-y-4">
        {currentFAQs.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-semibold mb-2">سوالی در این دسته یافت نشد</h3>
            <p className="text-muted-foreground">
              هیچ سوال فعالی در دسته "{TAB_CONFIG.find(t => t.key === activeTab)?.label}" وجود ندارد
            </p>
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

      {/* Summary */}
      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          {currentFAQs.length} سوال در دسته "{TAB_CONFIG.find(t => t.key === activeTab)?.label}" نمایش داده می‌شود
        </p>
      </div>
    </div>
  )
}