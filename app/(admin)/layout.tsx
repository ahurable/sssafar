
import type React from "react"
import { AdminNav } from "@/components/admin/admin-nav"
import { getSession } from "@/lib/auth"
import "../(main)/globals.css"
import localFont from "next/font/local"
import { NotificationProvider } from "@/contexts/notification/NotificationContext"
import { redirect } from "next/navigation"


const dana = localFont({
    src: [
        {
        path: '../../assets/font/dana-thin.woff',
        weight: '300',
        style: 'normal'
        },
        {
        path: '../../assets/font/dana-light.woff',
        weight: '400',
        style: 'normal'
        },
        {
        path: '../../assets/font/dana-regular.woff',
        weight: '500',
        style: 'normal'
        },
        {
        path: '../../assets/font/dana-demibold.woff',
        weight: '600',
        style: 'normal'
        },
        {
        path: '../../assets/font/dana-bold.woff',
        weight: '700',
        style: 'normal'
        },
        {
        path: '../../assets/font/dana-ultrabold.woff',
        weight: '800',
        style: 'normal'
        },
        {
        path: '../../assets/font/dana-extrabold.woff',
        weight: '900',
        style: 'normal'
        },
        {
        path: '../../assets/font/dana-black.woff',
        weight: '950',
        style: 'normal'
        }
    ]
    })




export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  
  if (!session)
    redirect('/')
  
  if (session && session.role != "ADMIN" || session && session.role != "ACCOUNTANT")
    redirect('/')
  return (
    <html dir="rtl">
      <body className={dana.className}>
        <NotificationProvider>
          <div className="flex min-h-screen">
            <AdminNav />
            <main className="flex-1">{children}</main>
          </div>
        </NotificationProvider>
      </body>
    </html>
  )
}
