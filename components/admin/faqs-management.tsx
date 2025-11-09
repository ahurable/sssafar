// components/admin/faqs-management.tsx
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, HelpCircle } from "lucide-react"
import Link from "next/link"

interface FAQ {
  id: string
  question: string
  answer: string
  type: string
  order: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

const FAQ_TYPES = {
  HOTEL: "رزرو هتل",
  AIR: "پرواز",
  CIP: "سیپ",
  TOUR: "تور",
  CITY_TOUR: "گشت شهری",
  VISA: "ویزا",
  OTHER: "سایر"
} as const

export function FAQsManagement() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>("ALL")

  const fetchFAQs = () => {
    setLoading(true)
    fetch("/api/admin/faqs")
      .then((res) => res.json())
      .then((data) => {
        setFaqs(data.faqs || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching FAQs:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchFAQs()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این سوال اطمینان دارید؟ این عمل غیرقابل بازگشت است.")) return

    setDeleteLoading(id)
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, { 
        method: "DELETE" 
      })
      
      if (res.ok) {
        fetchFAQs()
      } else {
        const error = await res.json()
        alert(error.error || "خطا در حذف سوال")
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error)
      alert("خطا در حذف سوال")
    } finally {
      setDeleteLoading(null)
    }
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(`/api/admin/faqs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (res.ok) {
        fetchFAQs()
      } else {
        const error = await res.json()
        alert(error.error || "خطا در تغییر وضعیت")
      }
    } catch (error) {
      console.error("Error updating FAQ:", error)
      alert("خطا در تغییر وضعیت")
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    const variants: { [key: string]: "default" | "secondary" | "outline" } = {
      HOTEL: "default",
      AIR: "secondary",
      CIP: "outline",
      TOUR: "default",
      CITY_TOUR: "secondary",
      VISA: "outline",
      OTHER: "outline"
    }
    return variants[type] || "outline"
  }

  const getTypeBadgeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      HOTEL: "bg-blue-100 text-blue-800",
      AIR: "bg-green-100 text-green-800",
      CIP: "bg-purple-100 text-purple-800",
      TOUR: "bg-orange-100 text-orange-800",
      CITY_TOUR: "bg-cyan-100 text-cyan-800",
      VISA: "bg-red-100 text-red-800",
      OTHER: "bg-gray-100 text-gray-800"
    }
    return colors[type] || "bg-gray-100 text-gray-800"
  }

  const filteredFAQs = filter === "ALL" 
    ? faqs 
    : faqs.filter(faq => faq.type === filter)

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground mt-2">در حال بارگذاری سوالات...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <p className="text-muted-foreground">
            {filteredFAQs.length} سوال از {faqs.length} سوال
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          {/* Filter */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg bg-background"
          >
            <option value="ALL">همه دسته‌ها</option>
            {Object.entries(FAQ_TYPES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>

          {/* Create Button */}
          <Link href="/admin/faqs/create">
            <Button>
              <Plus className="h-4 w-4 ml-2" />
              ایجاد سوال جدید
            </Button>
          </Link>
        </div>
      </div>

      {filteredFAQs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filter === "ALL" ? "هنوز سوالی ایجاد نکرده‌اید" : "هیچ سوالی در این دسته وجود ندارد"}
            </h3>
            <p className="text-muted-foreground mb-4">
              اولین سوال خود را ایجاد کنید تا در سایت نمایش داده شود
            </p>
            <Link href="/admin/faqs/create">
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                ایجاد سوال جدید
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <Card key={faq.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge 
                      variant={getTypeBadgeVariant(faq.type)} 
                      className={getTypeBadgeColor(faq.type)}
                    >
                      {FAQ_TYPES[faq.type as keyof typeof FAQ_TYPES]}
                    </Badge>
                    <Badge variant={faq.isActive ? "default" : "secondary"}>
                      {faq.isActive ? "فعال" : "غیرفعال"}
                    </Badge>
                    {faq.order > 0 && (
                      <Badge variant="outline" className="bg-gray-50">
                        ترتیب: {faq.order}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleActive(faq.id, faq.isActive)}
                    >
                      {faq.isActive ? "غیرفعال" : "فعال"}
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">سوال:</h3>
                    <p className="text-foreground bg-muted/50 p-3 rounded-lg">
                      {faq.question}
                    </p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-2">پاسخ:</h3>
                    <p className="text-muted-foreground bg-muted/30 p-3 rounded-lg whitespace-pre-wrap">
                      {faq.answer}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 mt-4 border-t">
                  <Link href={`/admin/faqs/${faq.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <Edit className="h-4 w-4 ml-1" />
                      ویرایش
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(faq.id)}
                    disabled={deleteLoading === faq.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4 ml-1" />
                    {deleteLoading === faq.id ? "..." : "حذف"}
                  </Button>
                </div>

                <div className="text-xs text-muted-foreground mt-4 pt-2 border-t">
                  ایجاد شده در: {new Date(faq.createdAt).toLocaleDateString('fa-IR')}
                  {faq.updatedAt !== faq.createdAt && 
                    ` • بروزرسانی: ${new Date(faq.updatedAt).toLocaleDateString('fa-IR')}`
                  }
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}