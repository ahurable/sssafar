"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, User, Plane, Hotel, Train, LayoutDashboardIcon } from "lucide-react"
import { UserType } from "@/lib/types"


export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserType|null>()
  useEffect(() => {
    const handleAsync = async () => {
      const res = await fetch('api/auth/me', {
        method: 'get'
      })
      const data = await res.json()
      if (res.ok) {
        setUser(data.user)
      }
    }
    handleAsync()
  }, [])
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Plane className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-primary">سفرتودی</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/hotels"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Hotel className="h-4 w-4" />
              هتل
            </Link>
            <Link
              href="/flights"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Plane className="h-4 w-4" />
              پرواز
            </Link>
            <Link
              href="/trains"
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary"
            >
              <Train className="h-4 w-4" />
              قطار
            </Link>
            <Link href="/blog" className="text-sm font-medium transition-colors hover:text-primary">
              وبلاگ
            </Link>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden items-center gap-3 md:flex">
            {
              user ?
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/dashboard">
                    <LayoutDashboardIcon className="ml-2 h-4 w-4" />
                    داشبورد
                  </Link>
                </Button>
                { user.role == "ADMIN" && 
                <Button size="sm" asChild>
                  <Link href="/admin">مدیریت</Link>
                </Button> }
              </> :
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/auth/signin">
                    <User className="ml-2 h-4 w-4" />
                    ورود
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">ثبت‌نام</Link>
                </Button>
              </>
            }
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="border-t py-4 md:hidden">
            <nav className="flex flex-col gap-4">
              <Link href="/hotels" className="flex items-center gap-2 text-sm font-medium">
                <Hotel className="h-4 w-4" />
                هتل
              </Link>
              <Link href="/flights" className="flex items-center gap-2 text-sm font-medium">
                <Plane className="h-4 w-4" />
                پرواز
              </Link>
              <Link href="/trains" className="flex items-center gap-2 text-sm font-medium">
                <Train className="h-4 w-4" />
                قطار
              </Link>
              <Link href="/blog" className="text-sm font-medium">
                وبلاگ
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t">
                <Button variant="outline" size="sm" asChild>
                  <Link href="/auth/signin">
                    <User className="ml-2 h-4 w-4" />
                    ورود
                  </Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/auth/signup">ثبت‌نام</Link>
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
