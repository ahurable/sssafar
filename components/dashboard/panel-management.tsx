"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Eye } from "lucide-react"

interface Panel {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  slug: string
  description: string | null
  isActive: boolean
  adminId: string | null
}

export function PanelManagement({ panelId }: { panelId: string }) {
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPanels()
  }, [])

  const fetchPanels = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/panels/")
      if (!response.ok) {
        throw new Error("خطا در دریافت اطلاعات پنل‌ها")
      }
      const data = await response.json()
      setPanels(data.panels)
      console.log(data.panels)
    } catch (err) {
      setError(err instanceof Error ? err.message : "خطای ناشناخته")
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePanel = () => {
    // منطق ایجاد پنل جدید
    console.log("ایجاد پنل جدید")
  }

  const handleEditPanel = (panelId: string) => {
    // منطق ویرایش پنل
    console.log("ویرایش پنل:", panelId)
  }

  const handleDeletePanel = (panelId: string) => {
    // منطق حذف پنل
    if (confirm("آیا از حذف این پنل اطمینان دارید؟")) {
      console.log("حذف پنل:", panelId)
    }
  }

  const handleViewPanel = (panelSlug: string) => {
    // مشاهده پنل
    window.open(`/panel/${panelSlug}`, "_blank")
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-lg">در حال بارگذاری پنل‌ها...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="text-red-500 text-lg">{error}</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">مدیریت پنل‌ها</h2>
          <p className="text-muted-foreground">مدیریت و مشاهده پنل‌های ایجاد شده</p>
        </div>
        <Button onClick={handleCreatePanel} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          ایجاد پنل جدید
        </Button>
      </div>

      {panels.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-muted-foreground mb-4">هنوز هیچ پنلی ایجاد نکرده‌اید</div>
            <Button onClick={handleCreatePanel}>ایجاد اولین پنل</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
          {panels && panels.map((panel) => (
            <Card key={panel.id} className="relative">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {panel.name}
                      <Badge variant={panel.isActive ? "default" : "secondary"}>
                        {panel.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{panel.slug}</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewPanel(panel.slug)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      مشاهده
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditPanel(panel.id)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-4 w-4" />
                      ویرایش
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeletePanel(panel.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">شناسه:</span>
                      <div className="text-muted-foreground font-mono text-xs mt-1">{panel.id}</div>
                    </div>
                    <div>
                      <span className="font-medium">آدرس پنل:</span>
                      <div className="text-muted-foreground mt-1">/panel/{panel.slug}</div>
                    </div>
                  </div>
                  
                  {panel.description && (
                    <div>
                      <span className="font-medium">توضیحات:</span>
                      <div className="text-muted-foreground mt-1">{panel.description}</div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">تاریخ ایجاد:</span>
                      {/* <div className="text-muted-foreground mt-1">{formatDate(panel.createdAt)}</div> */}
                    </div>
                    <div>
                      <span className="font-medium">آخرین بروزرسانی:</span>
                      {/* <div className="text-muted-foreground mt-1">{formatDate(panel.updatedAt)}</div> */}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}