import type React from "react"
import "./globals.css"
import localFont from "next/font/local"
import { NotificationProvider } from "@/contexts/notification/NotificationContext"
import { NotificationContainer } from "@/contexts/notification/NotificationContainer"


const dana = localFont({
    src: [
        {
        path: '../assets/font/dana-thin.woff',
        weight: '300',
        style: 'normal'
        },
        {
        path: '../assets/font/dana-light.woff',
        weight: '400',
        style: 'normal'
        },
        {
        path: '../assets/font/dana-regular.woff',
        weight: '500',
        style: 'normal'
        },
        {
        path: '../assets/font/dana-demibold.woff',
        weight: '600',
        style: 'normal'
        },
        {
        path: '../assets/font/dana-bold.woff',
        weight: '700',
        style: 'normal'
        },
        {
        path: '../assets/font/dana-ultrabold.woff',
        weight: '800',
        style: 'normal'
        },
        {
        path: '../assets/font/dana-extrabold.woff',
        weight: '900',
        style: 'normal'
        },
        {
        path: '../assets/font/dana-black.woff',
        weight: '950',
        style: 'normal'
        }
    ]
    })



export const metadata = {
  title: "سفرتودی - رزرو هتل، بلیط هواپیما و قطار",
  description: "رزرو آنلاین هتل، بلیط هواپیما و قطار با بهترین قیمت",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fa" dir="rtl" className={`${dana.className}`}>
      <body>
        <NotificationProvider>
          {children}
          <NotificationContainer/>
        </NotificationProvider>
      </body>
    </html>
  )
}
