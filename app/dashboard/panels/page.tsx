"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { PanelManagement } from "@/components/dashboard/panel-management"
import { useEffect, useState } from "react"
import { useSnack } from "@/hooks/use-notification"
import { UserType } from "@/lib/types"

export default function PanelsPage() {


  const { error } = useSnack()
  const [ me, setMe ] = useState<UserType | null>()
  useEffect(() => {

    const handleAsync = async () => {
        const res = await fetch(
            '/api/profile'
        )
        const data = await res.json()
        if (!res.ok) {
            error("خطا در دریافت اطلاعات")
        }
        setMe(data.user)
    }
    handleAsync()
  }, [])
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">داشبورد کاربری</h1>
            <p className="text-muted-foreground">مدیریت پنل‌های ایجاد شده</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <DashboardNav />
            </aside>
            <div className="lg:col-span-3">
              {
                me && me.panelUser != null && me.panelUser.length > 0 && me?.panelUser.map(panel => [
                    
                <PanelManagement panelId={panel.id}  />
                ])
              }
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}