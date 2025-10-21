"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, FileText, Settings, LogOut, PanelRightIcon, PlusSquare, File, Plane } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  {
    title: "داشبورد",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "کاربران",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "پست‌ها",
    href: "/admin/posts",
    icon: PlusSquare,
  },
  {
    title: "پنل ها",
    href: "/admin/panels",
    icon: PanelRightIcon
  },
  {
    title: "تور ها",
    href: "/admin/tours",
    icon: Plane
  },
  {
    title: "تنظیمات",
    href: "/admin/settings",
    icon: Settings,
  },
  {
    title: "قرارداد ها",
    href: "/admin/contracts",
    icon: File,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    window.location.href = "/"
  }

  return (
    <aside className="w-64 bg-card border-l border-border">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary">پنل مدیریت</h2>
      </div>

      <nav className="space-y-1 px-3">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="absolute bottom-0 w-64 p-3">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <LogOut className="h-5 w-5" />
          خروج
        </button>
      </div>
    </aside>
  )
}
