// app/admin/visa/[id]/edit/page.tsx
"use client"

import { useState } from "react"
import { EditVisaForm } from "@/components/admin/edit-visa-form"
import { VisaReservations } from "@/components/visa/visa-reservations"
import Link from "next/link"
import { ArrowRight, Edit, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface VisaService {
  id: string
  title: string
  slug?: string
  description?: string
  image?: string
  country: string
  city: string
  price?: number
  currency: string
  processingTime?: string
  validity?: string
  entryType: string
  features: string[]
  requirements: string[]
  documents: string[]
  priceTables?: any
  priority: number
  published: boolean
  featured: boolean
  faq: any[]
  bookings: any[]
  createdAt: string
  updatedAt: string
}

interface EditVisaPageProps {
  visa: VisaService
}

type ActiveTab = "edit" | "reservations"

export default function EditVisaPage({ visa }: EditVisaPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("edit")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/visa"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به لیست ویزاها
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">ویرایش سرویس ویزا</h1>
              <p className="text-muted-foreground mt-2">
                {visa.title} | {visa.country} - {visa.city}
              </p>
            </div>
            
            {/* Tab Navigation */}
            <Card className="lg:w-auto w-full">
              <CardContent className="p-2">
                <div className="flex rounded-lg bg-muted p-1">
                  <Button
                    variant={activeTab === "edit" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("edit")}
                    className={`flex items-center gap-2 ${
                      activeTab === "edit" 
                        ? "bg-background shadow-sm" 
                        : "hover:bg-transparent hover:underline"
                    }`}
                  >
                    <Edit className="h-4 w-4" />
                    ویرایش اطلاعات
                  </Button>
                  <Button
                    variant={activeTab === "reservations" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("reservations")}
                    className={`flex items-center gap-2 ${
                      activeTab === "reservations" 
                        ? "bg-background shadow-sm" 
                        : "hover:bg-transparent hover:underline"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    درخواست‌ها ({visa.bookings.length})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "edit" && (
            <Card>
              <CardContent className="p-6">
                <EditVisaForm visa={visa} />
              </CardContent>
            </Card>
          )}

          {activeTab === "reservations" && (
            <VisaReservations visaId={visa.id} reservations={visa.bookings} />
          )}
        </div>
      </div>
    </div>
  )
}