"use client"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { ProfileForm } from "@/components/dashboard/profile-form"
import { TravelerForm } from "@/components/dashboard/traveler-form"
import { useEffect } from "react"

export default function DashboardPage() {
    useEffect(() => {
        const handleAsync = async () => {
            const res = await fetch(
            '/api/travelers'
            )
            const data = await res.json()
            console.log(data)
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
            <p className="text-muted-foreground">مدیریت اطلاعات و رزروهای خود</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-4">
            <aside className="lg:col-span-1">
              <DashboardNav />
            </aside>
            <div className="lg:col-span-3">
              <TravelerForm mode="dashboard" />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
