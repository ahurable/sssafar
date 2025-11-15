// app/admin/tours/[id]/edit/page.tsx
"use client"

import { useState } from "react"
import { EditTourForm } from "@/components/admin/edit-tour-form"
import { TourReservations } from "@/components/admin/tour-reservations"
import Link from "next/link"
import { ArrowRight, Edit, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface Tour {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  featured: boolean
  isActive: boolean
  prices: any[]
  itineraries: any[]
  routes: any[]
  rules: any[]
  transports: any[]
  images: any[]
  reservations: any[]
}

interface EditTourPageProps {
  tour: Tour
}

type ActiveTab = "edit" | "reservations"

export default function EditTourPage({ tour }: EditTourPageProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("edit")

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/admin/tours"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-4 w-4" />
              بازگشت به لیست تورها
            </Link>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground">ویرایش تور</h1>
              <p className="text-muted-foreground mt-2">
                در حال ویرایش: {tour.title}
              </p>
            </div>
            
            {/* Tab Navigation */}
              <CardContent className="p-2">
                <div className="flex rounded-lg bg-muted p-1">
                  <Button
                    variant={activeTab === "edit" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setActiveTab("edit")}
                    className={`flex items-center gap-2 ${
                      activeTab === "edit" 
                        ? "bg-black shadow-sm" 
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
                        ? "bg-black shadow-sm" 
                        : "hover:bg-transparent hover:underline"
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    رزروها ({tour.reservations.length})
                  </Button>
                </div>
              </CardContent>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "edit" && (
            <Card>
              <CardContent className="p-6">
                <EditTourForm tour={tour} />
              </CardContent>
            </Card>
          )}

          {activeTab === "reservations" && (
            <TourReservations tourId={tour.id} reservations={tour.reservations} />
          )}
        </div>
      </div>
    </div>
  )
}