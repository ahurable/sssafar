"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { User, Plane, LayoutDashboardIcon, LogOut, Settings, CreditCard } from "lucide-react"
import { UserType } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Header() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  
  const profileMenuRef = useRef<HTMLDivElement>(null)

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleAsync = async () => {
      try {
        const res = await fetch('/api/auth/me', { method: 'get' })
        const data = await res.json()
        if (res.ok) {
          setUser(data.user)
        }
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }
    handleAsync()
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setProfileMenuOpen(false)
      window.location.reload()
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  const ProfileMenu = () => (
    <div className="absolute left-0 lg:left-[-20px] lg:top-[50px] after:content-[' '] after:top-[-10px] after:z-[-1] after:left-[30px] after:absolute after:w-5 after:h-5 after:bg-white after:rotate-45 top-full mt-2 w-72 rounded-2xl border border-gray-200 bg-white shadow-xl transition-all duration-200 z-50">
      <div className="p-3">
        {user ? (
          // Logged in user menu
          <>
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-blue-50 border border-blue-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500 text-white text-sm font-bold shadow-md">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-gray-800 truncate">{user.name || 'کاربر'}</p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
            </div>

            {user.userCredit && (
              <div className="px-3 py-3 mb-2 text-sm rounded-xl bg-gradient-to-l from-blue-500 to-blue-600 text-white text-center">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{user.userCredit.balance}</span>
                  <span className="text-blue-100">تومان</span>
                </div>
                <div className="text-xs text-blue-200 mt-1">اعتبار کیف پول</div>
              </div>
            )}

            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-xl transition-all hover:bg-blue-50 hover:text-blue-600 text-right font-medium"
                onClick={() => setProfileMenuOpen(false)}
              >
                <LayoutDashboardIcon className="h-5 w-5" />
                <span className="flex-1">داشبورد</span>
              </Link>

              <Link
                href="/dashboard/charge"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-xl transition-all hover:bg-blue-50 hover:text-blue-600 text-right font-medium"
                onClick={() => setProfileMenuOpen(false)}
              >
                <CreditCard className="h-5 w-5" />
                <span className="flex-1">شارژ اعتبار</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-xl transition-all hover:bg-blue-50 hover:text-blue-600 text-right font-medium"
                onClick={() => setProfileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span className="flex-1">تنظیمات</span>
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-xl transition-all bg-yellow-50 hover:bg-yellow-100 text-yellow-700 text-right font-medium border border-yellow-200"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span className="flex-1">پنل مدیریت</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-xl transition-all text-red-600 hover:bg-red-50 text-right font-medium border border-red-100 mt-2"
              >
                <LogOut className="h-5 w-5" />
                <span className="flex-1">خروج از حساب</span>
              </button>
            </div>
          </>
        ) : (
          // Guest user menu
          <div className="space-y-3">
            <div className="text-center py-2">
              <p className="text-gray-700 font-medium">به سفرتودی خوش آمدید</p>
            </div>
            <Link
              href="/auth/signin"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all bg-blue-500 text-white rounded-xl hover:bg-blue-600 shadow-md text-right"
              onClick={() => setProfileMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span className="font-bold">ورود به حساب کاربری</span>
            </Link>
            <Link
              href="/auth/signup"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all border-2 border-blue-500 text-blue-500 rounded-xl hover:bg-blue-50 text-right font-bold"
              onClick={() => setProfileMenuOpen(false)}
            >
              <span>ایجاد حساب جدید</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-blue-200 bg-[#e6f2ff] backdrop-blur-xl supports-[backdrop-filter]:bg-[#e6f2ff]/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link 
            href="/" 
            className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent">
              سفرتودی
            </span>
          </Link>

          {/* Profile Menu */}
          <div className="flex items-center gap-2 relative" ref={profileMenuRef}>
            <Link href="/tours">
              <span className="block px-10 py-2 text-blue-400 rounded-full border border-blue-400"> مشاهده تور ها</span>
            </Link>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={cn(
                "flex items-center justify-center rounded-full p-1 transition-all duration-200 bg-white shadow-md border border-blue-200",
                profileMenuOpen 
                  ? "ring-2 ring-blue-400 shadow-lg" 
                  : "hover:shadow-lg hover:scale-105 active:scale-95"
              )}
            >
              {loading ? (
                <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
              ) : user ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white text-sm font-bold shadow-inner">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-blue-500">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </button>

            {profileMenuOpen && <ProfileMenu />}
          </div>
        </div>
      </div>
    </header>
  )
}