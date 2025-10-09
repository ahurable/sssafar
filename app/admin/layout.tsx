import type React from "react"
import { AdminNav } from "@/components/admin/admin-nav"
import { getSession } from "@/lib/auth"


export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session)
    document.location.replace('/')
  if (session && session.role != "ADMIN")
    document.location.replace('/')
  return (
    <div className="flex min-h-screen">
      <AdminNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
