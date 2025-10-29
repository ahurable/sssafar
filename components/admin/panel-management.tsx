"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, ExternalLink } from "lucide-react"
import { CreatePanelDialog } from "./create-panel-dialog"
import { EditPanelDialog } from "./edit-panel-dialog"
import Link from "next/link"

interface Panel {
  id: string
  name: string
  slug: string
  description: string
  _count: { panelUser: number}
  createdAt: string
  updatedAt: string
  isActive: boolean
}

export function PanelManagement() {
  const [panels, setPanels] = useState<Panel[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [editPanel, setEditPanel] = useState<Panel | null>(null)

  const fetchPanels = () => {
    setLoading(true)
    fetch("/api/panels")
      .then((res) => res.json())
      .then((data) => {
        setPanels(data.panels)
        console.log(data.panels)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error fetching panels:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchPanels()
  }, [])

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این پنل اطمینان دارید؟")) return

    try {
      const res = await fetch(`/api/panels/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchPanels()
      }
    } catch (error) {
      console.error("[v0] Error deleting panel:", error)
    }
  }

  const handleVisitPanel = (panelId: string) => {
    // Navigate to panel page or open panel view
    window.open(`panels/${panelId}/edit`, '_blank')
  }


  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>
  }

  if (!panels) {
    return (
        <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">پنلی وجود ندارد</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          پنل جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        یک پنل جدید ایجاد کنید
      </div>

      <CreatePanelDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={fetchPanels} />
      {/* {editPanel && (
        <EditPanelDialog
          panel={editPanel}
          open={!!editPanel}
          onOpenChange={() => setEditPanel(null)}
          onSuccess={fetchPanels}
        />
      )} */}
    </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{panels.length} پنل</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          پنل جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {panels.map((panel) => {
          return (
            <Card key={panel.id} className="">
              <CardContent className="p-4 h-full flex flex-col">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <h3 className="text-lg font-semibold line-clamp-2">{panel.name}</h3>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                    {panel.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      {/* <Badge className={statusBadge.color}>
                        {statusBadge.label}
                      </Badge>
                      <Badge variant="outline" className={priorityBadge.color}>
                        {priorityBadge.label}
                      </Badge> */}
                    </div>
                    
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>اعضا:</span>
                        <span>{panel._count.panelUser}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>آخرین بروزرسانی:</span>
                        <span className="text-xs">
                          {new Date(panel.updatedAt).toLocaleDateString("fa-IR")}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleVisitPanel(panel.id)}
                  >
                    <ExternalLink className="h-4 w-4 ml-1" />
                    مشاهده پنل
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <CreatePanelDialog open={createOpen} onOpenChange={setCreateOpen} onSuccess={fetchPanels} />
      
    </div>
  )
}