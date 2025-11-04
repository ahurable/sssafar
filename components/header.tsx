"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { User, Plane, LayoutDashboardIcon, LogOut, Settings, CreditCard, Menu, X, Globe, Shield } from "lucide-react"
import { UserType } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Header() {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
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
            <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gradient-to-l from-red-50 to-pink-50 border border-red-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white text-sm font-bold shadow-md">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-gray-800 truncate">{user.name || 'کاربر'}</p>
                <p className="text-xs text-gray-600 truncate">{user.email}</p>
              </div>
            </div>

            {user.userCredit && (
              <div className="px-3 py-3 mb-2 text-sm rounded-xl bg-gradient-to-l from-red-500 to-pink-500 text-white text-center">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{user.userCredit.balance}</span>
                  <span className="text-red-100">تومان</span>
                </div>
                <div className="text-xs text-pink-100 mt-1">اعتبار کیف پول</div>
              </div>
            )}

            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-xl transition-all hover:bg-red-50 hover:text-red-600 text-right font-medium"
                onClick={() => setProfileMenuOpen(false)}
              >
                <LayoutDashboardIcon className="h-5 w-5" />
                <span className="flex-1">داشبورد</span>
              </Link>

              <Link
                href="/dashboard/charge"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-xl transition-all hover:bg-pink-50 hover:text-pink-600 text-right font-medium"
                onClick={() => setProfileMenuOpen(false)}
              >
                <CreditCard className="h-5 w-5" />
                <span className="flex-1">شارژ اعتبار</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-xl transition-all hover:bg-purple-50 hover:text-purple-600 text-right font-medium"
                onClick={() => setProfileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span className="flex-1">تنظیمات</span>
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 w-full px-3 py-3 text-sm rounded-xl transition-all bg-red-50 hover:bg-red-100 text-red-700 text-right font-medium border border-red-200"
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
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all bg-gradient-to-l from-red-500 to-pink-500 text-white rounded-xl hover:from-red-600 hover:to-pink-600 shadow-md text-right"
              onClick={() => setProfileMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span className="font-bold">ورود به حساب کاربری</span>
            </Link>
            <Link
              href="/auth/signup"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all border-2 border-red-500 text-red-500 rounded-xl hover:bg-red-50 text-right font-bold"
              onClick={() => setProfileMenuOpen(false)}
            >
              <span>ایجاد حساب جدید</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  const MobileMenu = () => (
    <div className="fixed inset-0 z-40 h-[100vh] lg:hidden">
      {/* Menu Panel - Full Screen */}
      <div 
        ref={mobileMenuRef}
        className="absolute inset-0 bg-gradient-to-br from-red-50 via-pink-50 to-purple-50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 shadow-lg">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                سفرتودی
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-6 h-full bg-white/10 backdrop-blur-md backdrop-filter">
            {/* Main Navigation */}
            <div className="space-y-4 mb-8">
              <h3 className="text-right text-lg font-bold text-gray-700 mb-4">منوی اصلی</h3>
              
              <Link
                href="/tours"
                className="flex items-center gap-4 w-full px-6 py-5 text-right rounded-2xl transition-all bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:shadow-lg hover:border-red-200 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-pink-500 shadow-md group-hover:scale-110 transition-transform">
                  <Globe className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-800">تورها</div>
                  <div className="text-sm text-gray-600 mt-1">مشاهده و رزرو تورهای مسافرتی</div>
                </div>
              </Link>

              <Link
                href="/cip"
                className="flex items-center gap-4 w-full px-6 py-5 text-right rounded-2xl transition-all bg-white/80 backdrop-blur-sm border border-gray-200 hover:bg-white hover:shadow-lg hover:border-pink-200 group"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-500 shadow-md group-hover:scale-110 transition-transform">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold text-gray-800">خدمات CIP</div>
                  <div className="text-sm text-gray-600 mt-1">خدمات فرودگاهی و VIP</div>
                </div>
              </Link>
            </div>

            {/* Secondary Navigation */}
            <div className="space-y-3 border-t border-gray-200 pt-6">
              <h3 className="text-right text-lg font-bold text-gray-700 mb-4">صفحات دیگر</h3>
              
              <Link
                href="/"
                className="flex items-center gap-4 w-full px-6 py-4 text-right rounded-xl transition-all text-gray-700 hover:bg-white/80 hover:text-red-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span className="flex-1 text-lg">صفحه اصلی</span>
              </Link>
              {     user ?

                <Link
                href="/dashboard"
                className="flex items-center gap-4 w-full px-6 py-4 text-right rounded-xl transition-all text-gray-700 hover:bg-white/80 hover:text-pink-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <span className="flex-1 text-lg">داشبورد کاربر</span>
              </Link>
              :
              <>
              <Link
                href="/auth/signin"
                className="flex items-center gap-4 w-full px-6 py-4 text-right rounded-xl transition-all text-gray-700 hover:bg-white/80 hover:text-pink-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <span className="flex-1 text-lg">ورود به حساب</span>
              </Link>
              <Link
                href="/auth/signup"
                className="flex items-center gap-4 w-full px-6 py-4 text-right rounded-xl transition-all text-gray-700 hover:bg-white/80 hover:text-pink-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 rounded-full bg-pink-500"></div>
                <span className="flex-1 text-lg">ایجاد حساب</span>
              </Link>
              </>
              }

              <Link
                href="/blog"
                className="flex items-center gap-4 w-full px-6 py-4 text-right rounded-xl transition-all text-gray-700 hover:bg-white/80 hover:text-purple-600"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                <span className="flex-1 text-lg">بلاگ</span>
              </Link>
            </div>

            {/* Quick Actions */}
            {!user && (
              <div className="fixed bottom-6 left-6 right-6 space-y-3">
                <Link
                  href="/auth/signin"
                  className="flex w-full items-center justify-center gap-3 px-6 py-4 text-lg font-bold transition-all bg-gradient-to-l from-red-500 to-pink-500 text-white rounded-2xl hover:from-red-600 hover:to-pink-600 shadow-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-6 w-6" />
                  <span>ورود به حساب کاربری</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b border-red-200 bg-gradient-to-r from-red-50 via-pink-50 to-purple-50 backdrop-blur-xl supports-[backdrop-filter]:bg-gradient-to-r supports-[backdrop-filter]:from-red-50/95 supports-[backdrop-filter]:via-pink-50/95 supports-[backdrop-filter]:to-purple-50/95">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button - Behind Logo */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-white shadow-md border border-gray-200 hover:shadow-lg transition-all z-10"
            >
              <Menu className="h-5 w-5 text-gray-600" />
            </button>

            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2 transition-transform hover:scale-105 active:scale-95 relative"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 via-pink-500 to-purple-500 shadow-lg">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-black bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                سفرتودی
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/tours"
              className="px-6 py-2 text-black rounded-full bg-gradient-to-l transition-all hover:scale-105 font-bold"
            >
              تورها
            </Link>
            <Link
              href="/cip"
              className="px-6 py-2 text-black rounded-full transition-all hover:scale-105 font-bold"
            >
              خدمات CIP
            </Link>
          </div>

          {/* Profile Menu */}
          <div className="flex items-center gap-2 relative" ref={profileMenuRef}>
            <Link 
              href="/tours"
              className="hidden md:block px-6 py-2 text-white lg:hidden from-red-600 via-pink-600 to-purple-600 rounded-full bg-gradient-to-l transition-all hover:scale-105 font-bold"
            >
              مشاهده تور ها
            </Link>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={cn(
                "flex items-center justify-center rounded-full p-1 transition-all duration-200 bg-white shadow-md border border-gray-200",
                profileMenuOpen 
                  ? "ring-2 ring-red-400 shadow-lg" 
                  : "hover:shadow-lg hover:scale-105 active:scale-95"
              )}
            >
              {loading ? (
                <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
              ) : user ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-pink-500 text-white text-sm font-bold shadow-inner">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-pink-400">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </button>

            {profileMenuOpen && <ProfileMenu />}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && <MobileMenu />}
    </header>
  )
}