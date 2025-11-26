"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { PanelManagement } from "@/components/dashboard/panel-management"
import { useEffect, useState } from "react"
import { useSnack } from "@/hooks/use-notification"
import { UserType } from "@/lib/types"
import { AddPanelMembersForm } from "./panel-details"

interface Panel {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  slug: string
  panelUser?: {
    userId: string
    role: string
  }[]
  members?: {
    userId: string
  }[]
  description: string | null
  isActive: boolean
  adminId: string | null
}




export default function Page( { params } : { params : { id: string } } ) {


  const { error } = useSnack()
  const [ me, setMe ] = useState<UserType | null>()
  const [ panel, setPanel ] = useState<Panel | null>()
  useEffect(() => {

    
    getUser()
    getPanel()
  }, [])


    const getUser = async () => {
        const res = await fetch(
            '/api/profile'
        )
        const data = await res.json()
        if (!res.ok) {
            error("خطا در دریافت اطلاعات")
        }
        setMe(data.user)
    }


    const getPanel = async () => {
        const res = await fetch(
            `/api/panels/${params.id}`
        )
        const data = await res.json()
        // console.log(data)
        if (res.ok) {
            setPanel(data.panel)
        }
    }

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
                me && me.panelUser != null && me.panelUser.length > 0 && panel &&
                <AddPanelMembersForm panel={panel} />
              }
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}