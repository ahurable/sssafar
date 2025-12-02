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
    description: "وارد کردن اطلاعات هویت",
    href: "/dashboard",
    icon: User,
  },
  {
    title: "رزروهای من",
    description: "مشاهده وضعیت رزرو های شما",
    href: "/dashboard/bookings",
    icon: Ticket,
  },
  {
    title: "تنظیمات",
    description: "تغییر رمز عبور",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "صورت حساب ها",
    description: "وضعیت خرید های  شما",
    href: "/dashboard/invoices",
    icon: File
  }
]

export function DashboardNav() {
  const pathname = usePathname()
  const { error } = useSnack()
  const [me, setMe] = useState<UserType | null>()
  const [loading, setLoading] = useState<boolean>(true)
  const [lastupdate, setLastupdate] = useState<string | null>()

  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth) return 0

    const birthDate = new Date(dateOfBirth)
    const today = new Date()

    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()

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

  useEffect(() => {
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
      // console.log(toPersianDate)
      setLastupdate(toPersianDate);
    }
  }, [me])

  return (
    <div className="sticky top-20">
      <Card className="text-center p-4 border border-gray-300 bg-[#fffefe]">
        <span className="text-black">
          اعتبار کیف پول
        </span>
        <span className="text-3xl font-black text-black">
          {me?.userCredit.balance.toLocaleString('fa-IR')} ریال
        </span>
        <span className="text-black">
          آخرین بروزرسانی در: {lastupdate}
        </span>
        <Link href={'/dashboard/charge'} className="p-4 block">
          <Button className="bg-blue-600 w-full text-xl p-6 font-bold text-white hover:bg-blue-700">
            شارژ اعتبار
          </Button>
        </Link>
      </Card>
      <div className="mt-4 bg-[#fffefe]">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex gap-3 px-3 items-center py-4 border text-sm font-medium  border-gray-300 rounded-lg",
                  isActive
                    ? "text-blue-950 border-2 border-blue-950 bg-blue-50 font-bold"
                    : "text-black hover:bg-gray-100",
                )}
              >
                <Icon className="h-4 w-4" />
                <div>
                  <p className="block font-bold">
                    {item.title}
                  </p>
                  <span className="text-xs font-medium">{item.description}</span>
                </div>
              </Link>
            )
          })}
          {
            loading == false && me && me.panelUser != undefined && me.panelUser.length > 0 &&
            <Link
              href="/dashboard/panels"
              className={cn(
                "flex items-center gap-3 px-3 py-4 text-sm font-medium border border-gray-300 rounded-lg",
                pathname == "/dashboard/panels"
                  ? "text-blue-950 border-2 border-blue-950 bg-blue-50 font-bold"
                  : "text-black hover:bg-gray-100",
              )}
            >
              <PanelBottom className="h-4 w-4" />
              <div>
                <p className="block font-bold">
                  پنل ها
                </p>
                <span className="text-xs font-medium">مشاهده پنل های سازمانی</span>
              </div>
            </Link>
          }
          {
            me && me.dateOfBirth && calculateAge(me.dateOfBirth) > 18 &&
            <Link
              href="/dashboard/travelers"
              className={cn(
                "flex items-center gap-3 px-3 py-4 text-sm font-medium border border-gray-300 rounded-lg",
                pathname == "/dashboard/travelers"
                  ? "text-blue-800 border-2 border-blue-800 font-bold"
                  : "text-black hover:bg-gray-100",
              )}
            >
              <Users className="h-4 w-4" />
              <div>
                <p className="block font-bold">افزودن مسافران</p>
                <span className="text-xs font-medium">اطلاعات مسافران را وارد کنید همیشه استفاده کنید</span>
              </div>
            </Link>
          }
          <button className="flex w-full border-2 items-center gap-3 px-3 py-4 text-sm font-bold text-red-800 bg-red-50 border-red-800  hover:bg-gray-100 rounded-lg">
            <LogOut className="h-4 w-4" />
            خروج از حساب
          </button>
        </nav>
      </div>
    </div>
  )
}