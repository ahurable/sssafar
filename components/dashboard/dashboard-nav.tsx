"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { User, Ticket, Settings, LogOut, PanelBottom, Users, File } from "lucide-react"
import { cn } from "@/lib/utils"
import { useSnack } from "@/hooks/use-notification"
import { useEffect, useState } from "react"
import { UserType } from "@/lib/types"
import { Button } from "../ui/button"

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
  {
    title: "صورت حساب ها",
    href: "/dashboard/invoices",
    icon: File
  }
]

export function DashboardNav() {
  const pathname = usePathname()
  const { error } = useSnack()
  const [ me, setMe ] = useState<UserType | null>()
  const [loading, setLoading] = useState<boolean>(true)
  const [lastupdate, setLastupdate] = useState<string | null>()

  // Calculate age from date of birth (Gregorian date string)
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0
    
    const birthDate = new Date(dateOfBirth)
    const today = new Date()
    
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    
    // Adjust age if birthday hasn't occurred this year yet
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    
    return age
  }

  useEffect(() => {
    const handleMe = async () => {
      const res = await fetch(
        '/api/profile'
      )
      const data = await res.json()
      if (!res.ok) {
        error("خطا در دریافت پروفایل")
        return 
      }
      setMe(data.user)
      setLoading(false)
    }
    handleMe()
    
  }, [])

  useEffect(()=>{
    if (me && me.userCredit) {
      const date = new Date(me.userCredit.updatedAt);
      const toPersianDate = date.toLocaleString('fa-IR', {
        timeZone: 'Asia/Tehran',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
      console.log(toPersianDate)
      setLastupdate(toPersianDate);
    }
  },[me])
  return (
    <div className="sticky top-20">
      <Card className="text-center p-4">
        <span>
          اعتبار کیف پول
        </span>
        <span className="text-3xl font-black">
          {me?.userCredit.balance.toLocaleString('fa-IR')} ریال
        </span>
        <span>
          آخرین بروزرسانی در: {lastupdate}
        </span>
        <Link href={'/dashboard/charge'} className="p-4">
          <Button className="bg-green-400 w-full text-2xl p-8 font-bold">
            شارژ اعتبار
          </Button>
        </Link>
      </Card>
      <Card className="mt-4">
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
                      ? "bg-blue-400 text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
            {
              loading == false && me && me.panelUser != undefined && me.panelUser.length > 0 &&
              <Link
                  href="/dashboard/panels"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname == "panels"
                      ? "bg-blue-400 text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <PanelBottom className="h-4 w-4" />
                    پنل ها
              </Link>
            }
            {
              me && me.dateOfBirth && calculateAge(me.dateOfBirth) > 18 &&
              <Link
                  href="/dashboard/travelers"
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname == "panels"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Users className="h-4 w-4" />
                    افزودن مسافران
              </Link>
            }
            <button className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10">
              <LogOut className="h-4 w-4" />
              خروج از حساب
            </button>
          </nav>
        </CardContent>
      </Card>
    </div>
  )
}
