"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { User, Ticket, Settings, LogOut } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "اطلاعات شخصی",
    href: "/dashboard",
    icon: User,
  },
  {
    title: "رزروهای من",
    href: "/dashboard/bookings",
    icon: Ticket,
  },
  {
    title: "تنظیمات",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <Card className="sticky top-20">
      <CardContent className="p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.title}
              </Link>
            )
          })}
          <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
            <LogOut className="h-4 w-4" />
            خروج از حساب
          </button>
        </nav>
      </CardContent>
    </Card>
  )
}
