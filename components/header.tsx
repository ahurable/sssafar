"use client"

import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, Plane, LayoutDashboardIcon, LogOut, Settings, CreditCard, Menu, X, Globe, Shield, Hotel, ChevronDown } from "lucide-react"
import { UserType } from "@/lib/types"
import { cn } from "@/lib/utils"

export function Header() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeHoverMenu, setActiveHoverMenu] = useState<string | null>(null)
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null)
  
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const flightMenuRef = useRef<HTMLDivElement>(null)
  const hotelMenuRef = useRef<HTMLDivElement>(null)
  const otherMenuRef = useRef<HTMLDivElement>(null)

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false)
      }
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false)
      }
      if (flightMenuRef.current && !flightMenuRef.current.contains(event.target as Node)) {
        setActiveHoverMenu(null)
      }
      if (hotelMenuRef.current && !hotelMenuRef.current.contains(event.target as Node)) {
        setActiveHoverMenu(null)
      }
      if (otherMenuRef.current && !otherMenuRef.current.contains(event.target as Node)) {
        setActiveHoverMenu(null)
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

  const handleMenuClick = (menuType: string) => {
    // Close mobile menu first
    setMobileMenuOpen(false)
    
    // Check if we're already on home page
    if (window.location.pathname === '/') {
      // If already on home page, just update the URL with search param
      const params = new URLSearchParams(searchParams.toString())
      
      if ( menuType == "flight" || menuType == "domesticFlights" || menuType == "hotel" || menuType == "domesticHotel") {
        params.set('search', menuType)
        router.push(`/?${params.toString()}`, { scroll: false })
      } else {
        router.push(`/${menuType}`)
      }
      
      // Trigger custom event to open modal
      window.dispatchEvent(new CustomEvent('openSearchModal', { detail: menuType }))
    } else {
      const params = new URLSearchParams(searchParams.toString())
      // If not on home page, navigate to home page with search param
      if ( menuType == "flight" || menuType == "domesticFlights" || menuType == "hotel" || menuType == "domesticHotel") {
        params.set('search', menuType)
        router.push(`/?${params.toString()}`, { scroll: false })
      } else {
        console.log(menuType)
        router.push(`/${menuType}`)
      }
    }
  }

  const handleMenuHover = (menuType: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }
    setActiveHoverMenu(menuType)
  }

  const handleMenuLeave = () => {
    const timeout = setTimeout(() => {
      setActiveHoverMenu(null)
    }, 200) // Small delay to allow moving to submenu
    setHoverTimeout(timeout)
  }   

  const ProfileMenu = () => (
    <div className="absolute left-0 lg:left-[-20px] lg:top-[50px] top-full mt-2 w-72 border border-gray-300 bg-[#fffefe] z-50">
      <div className="p-3">
        {user ? (
          // Logged in user menu
          <>
            <div className="flex items-center gap-3 px-3 py-3 mb-2 border border-gray-300 bg-[#fffefe]">
              <div className="flex h-10 w-10 items-center justify-center bg-blue-500 text-white text-sm font-bold">
                {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0 text-right">
                <p className="text-sm font-bold text-black truncate">{user.name || 'کاربر'}</p>
                <p className="text-xs text-black truncate">{user.email}</p>
              </div>
            </div>

            {user.userCredit && (
              <div className="px-3 py-3 mb-2 text-sm bg-blue-500 text-white text-center">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">{user.userCredit.balance}</span>
                  <span className="text-blue-100">تومان</span>
                </div>
                <div className="text-xs text-blue-100 mt-1">اعتبار کیف پول</div>
              </div>
            )}

            <div className="space-y-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm hover:bg-gray-100 text-black text-right font-medium"
                onClick={() => setProfileMenuOpen(false)}
              >
                <LayoutDashboardIcon className="h-5 w-5" />
                <span className="flex-1">داشبورد</span>
              </Link>

              <Link
                href="/dashboard/charge"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm hover:bg-gray-100 text-black text-right font-medium"
                onClick={() => setProfileMenuOpen(false)}
              >
                <CreditCard className="h-5 w-5" />
                <span className="flex-1">شارژ اعتبار</span>
              </Link>

              <Link
                href="/dashboard/settings"
                className="flex items-center gap-3 w-full px-3 py-3 text-sm hover:bg-gray-100 text-black text-right font-medium"
                onClick={() => setProfileMenuOpen(false)}
              >
                <Settings className="h-5 w-5" />
                <span className="flex-1">تنظیمات</span>
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 w-full px-3 py-3 text-sm bg-blue-800 text-white text-right font-medium"
                  onClick={() => setProfileMenuOpen(false)}
                >
                  <Settings className="h-5 w-5" />
                  <span className="flex-1">پنل مدیریت</span>
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 text-sm text-red-600 hover:bg-gray-100 text-right font-medium border border-gray-300 mt-2"
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
              <p className="text-black font-medium">به سفرتودی خوش آمدید</p>
            </div>
            <Link
              href="/auth/signin"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium bg-blue-500 text-white hover:bg-blue-900 text-right"
              onClick={() => setProfileMenuOpen(false)}
            >
              <User className="h-5 w-5" />
              <span className="font-bold">ورود به حساب کاربری</span>
            </Link>
            <Link
              href="/auth/signup"
              className="flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium border border-gray-300 text-black hover:bg-gray-100 text-right font-bold"
              onClick={() => setProfileMenuOpen(false)}
            >
              <span>ایجاد حساب جدید</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  )

  // Desktop Dropdown Menu Component
  const DesktopDropdownMenu = ({ menuRef, isOpen, items, onSubmenuHover, onSubmenuLeave }: any) => {
    if (!isOpen) return null
    console.log(items)
    return (
      <div 
        ref={menuRef}
        className="absolute top-full right-0 mt-0 w-48 bg-[#fffefe] border border-gray-300 shadow-lg z-40"
        onMouseEnter={onSubmenuHover}
        onMouseLeave={onSubmenuLeave}
      >
        {items.map((item: any, index: number) => (
          <button
            key={index}
            onClick={() => {
              handleMenuClick(item.type)
            }}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-right hover:bg-gray-100 text-black border-b border-gray-100 last:border-b-0"
          >
            {item.icon && <item.icon className="h-4 w-4" />}
            <span className="flex-1">{item.label}</span>
          </button>
        ))}
      </div>
    )
  }

   const MobileMenu = () => (
    <div className="fixed inset-0 z-40 h-[100vh] lg:hidden">
      <div 
        ref={mobileMenuRef}
        className="absolute inset-0 bg-[#fffefe]"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-300 bg-[#fffefe]">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center bg-blue-500">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black text-black">
                سفرتودی
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center w-12 h-12 border border-gray-300 bg-[#fffefe] hover:bg-gray-100"
            >
              <X className="h-6 w-6 text-black" />
            </button>
          </div>

          {/* Menu Items */}
          <div className="flex-1 p-4 h-full bg-[#fffefe] overflow-auto">
            {/* Main Navigation */}
            <div className="space-y-2 mb-6">
              <h3 className="text-right text-lg font-bold text-black mb-3">منوی اصلی</h3>
              
              {/* Flight Menu */}
              <div className="border border-gray-300 bg-[#fffefe]">
                <div className="flex items-center gap-4 w-full px-4 py-3 text-right bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-500">
                    <Plane className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-md font-bold text-black">پرواز</div>
                    <div className="text-sm text-black mt-1">پرواز داخلی و خارجی</div>
                  </div>
                </div>
                <div className="border-t border-gray-300">
                  <button
                    onClick={() => handleMenuClick('domesticFlights')}
                    className="flex items-center gap-3 w-full px-4 py-3 text-right hover:bg-gray-100 text-sm text-black border-b border-gray-100"
                  >
                    <Plane className="h-4 w-4" />
                    <span>پرواز داخلی</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick('flight')}
                    className="flex items-center gap-3 w-full px-4 py-3 text-right hover:bg-gray-100 text-sm text-black"
                  >
                    <Plane className="h-4 w-4" />
                    <span>پرواز خارجی</span>
                  </button>
                </div>
              </div>

              {/* Hotel Menu */}
              <div className="border border-gray-300 bg-[#fffefe]">
                <div className="flex items-center gap-4 w-full px-4 py-3 text-right bg-gray-50">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500">
                    <Hotel className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-md font-bold text-black">هتل</div>
                    <div className="text-sm text-black mt-1">هتل داخلی و خارجی</div>
                  </div>
                </div>
                <div className="border-t border-gray-300">
                  <button
                    onClick={() => handleMenuClick('domesticHotel')}
                    className="flex items-center gap-3 w-full px-4 py-3 text-right hover:bg-gray-100 text-sm text-black border-b border-gray-100"
                  >
                    <Hotel className="h-4 w-4" />
                    <span>هتل داخلی</span>
                  </button>
                  <button
                    onClick={() => handleMenuClick('hotel')}
                    className="flex items-center gap-3 w-full px-4 py-3 text-right hover:bg-gray-100 text-sm text-black"
                  >
                    <Hotel className="h-4 w-4" />
                    <span>هتل خارجی</span>
                  </button>
                </div>
              </div>

              {/* Other Services */}
              <button
                onClick={() => handleMenuClick('tour')}
                className="flex items-center gap-4 w-full px-4 py-3 text-right border border-gray-300 bg-[#fffefe] hover:bg-gray-100 group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-md font-bold text-black">تورها</div>
                  <div className="text-sm text-black mt-1">مشاهده و رزرو تورهای مسافرتی</div>
                </div>
              </button>

              <button
                onClick={() => handleMenuClick('cip')}
                className="flex items-center gap-4 w-full px-4 py-3 text-right border border-gray-300 bg-[#fffefe] hover:bg-gray-100 group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-red-500">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-md font-bold text-black">خدمات CIP</div>
                  <div className="text-sm text-black mt-1">خدمات فرودگاهی و VIP</div>
                </div>
              </button>

              <button
                onClick={() => handleMenuClick('visa')}
                className="flex items-center gap-4 w-full px-4 py-3 text-right border border-gray-300 bg-[#fffefe] hover:bg-gray-100 group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-blue-500">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-md font-bold text-black">خدمات ویزا</div>
                  <div className="text-sm text-black mt-1">دریافت ویزای کشورهای مختلف</div>
                </div>
              </button>

              <button
                onClick={() => handleMenuClick('activities')}
                className="flex items-center gap-4 w-full px-4 py-3 text-right border border-gray-300 bg-[#fffefe] hover:bg-gray-100 group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-green-500">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-md font-bold text-black">گشت شهری</div>
                  <div className="text-sm text-black mt-1">تورهای گردشگری درون شهری</div>
                </div>
              </button>

              <button
                onClick={() => handleMenuClick('organs')}
                className="flex items-center gap-4 w-full px-4 py-3 text-right border border-gray-300 bg-[#fffefe] hover:bg-gray-100 group"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-purple-500">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-md font-bold text-black">پنل سازمانی</div>
                  <div className="text-sm text-black mt-1">خدمات ویژه سازمان‌ها و شرکت‌ها</div>
                </div>
              </button>
            </div>

            {/* Secondary Navigation */}
            <div className="space-y-2 border-t border-gray-300 pt-4">
              <h3 className="text-right text-lg font-bold text-black mb-3">صفحات دیگر</h3>
              
              <Link
                href="/"
                className="flex items-center gap-4 w-full px-4 py-3 text-right text-black hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 bg-black"></div>
                <span className="flex-1 text-md">صفحه اصلی</span>
              </Link>
              {user ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-4 w-full px-4 py-3 text-right text-black hover:bg-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="w-2 h-2 bg-black"></div>
                  <span className="flex-1 text-md">داشبورد کاربر</span>
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/signin"
                    className="flex items-center gap-4 w-full px-4 py-3 text-right text-black hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-2 h-2 bg-black"></div>
                    <span className="flex-1 text-md">ورود به حساب</span>
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="flex items-center gap-4 w-full px-4 py-3 text-right text-black hover:bg-gray-100"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="w-2 h-2 bg-black"></div>
                    <span className="flex-1 text-md">ایجاد حساب</span>
                  </Link>
                </>
              )}

              <Link
                href="/blog"
                className="flex items-center gap-4 w-full px-4 py-3 text-right text-black hover:bg-gray-100"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 bg-black"></div>
                <span className="flex-1 text-md">بلاگ</span>
              </Link>
            </div>

            {/* Quick Actions */}
            {!user && (
              <div className="fixed bottom-4 left-4 right-4 space-y-2">
                <Link
                  href="/auth/signin"
                  className="flex w-full items-center justify-center gap-3 px-4 py-3 text-md font-bold bg-blue-500 text-white hover:bg-blue-900"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="h-5 w-5" />
                  <span>ورود به حساب کاربری</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  // Menu configurations
  const flightMenuItems = [
    { label: "پرواز داخلی", type: "domesticFlights", icon: Plane },
    { label: "پرواز خارجی", type: "flight", icon: Plane }
  ]

  const hotelMenuItems = [
    { label: "هتل داخلی", type: "domesticHotel", icon: Hotel },
    { label: "هتل خارجی", type: "hotel", icon: Hotel }
  ]

  const otherMenuItems = [
    { label: "تورها", type: "tours", icon: Globe },
    { label: "خدمات CIP", type: "cip", icon: Shield },
    { label: "خدمات ویزا", type: "visa", icon: Globe },
    { label: "گشت شهری", type: "activities", icon: Globe },
    { label: "پنل سازمانی", type: "organs", icon: Shield }
  ]

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-300 bg-[#fffefe]">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo and Mobile Menu Button */}
          <div className="flex items-center gap-6"> {/* Increased gap to move menus closer to logo */}
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden flex items-center justify-center w-9 h-9 border border-gray-300 bg-[#fffefe] hover:bg-gray-100"
            >
              <Menu className="h-4 w-4 text-black" />
            </button>

            {/* Logo */}
            <Link 
              href="/" 
              className="flex items-center gap-2"
            >
              <div className="flex h-9 w-9 items-center justify-center bg-blue-500">
                <Plane className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-black text-black">
                سفرتودی
              </span>
            </Link>

            {/* Desktop Navigation - Moved closer to logo */}
            <div className="hidden lg:flex items-center gap-1">
              {/* Flight Menu */}
              <div 
                className="relative"
                ref={flightMenuRef}
                onMouseEnter={() => handleMenuHover('flight')}
                onMouseLeave={handleMenuLeave}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-black hover:bg-gray-100 font-bold rounded-none">
                  <Plane className="h-4 w-4" />
                  <span>پرواز</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                <DesktopDropdownMenu
                  menuRef={flightMenuRef}
                  isOpen={activeHoverMenu === 'flight'}
                  items={flightMenuItems}
                  onSubmenuHover={() => handleMenuHover('flight')}
                  onSubmenuLeave={handleMenuLeave}
                />
              </div>

              {/* Hotel Menu */}
              <div 
                className="relative"
                ref={hotelMenuRef}
                onMouseEnter={() => handleMenuHover('hotel')}
                onMouseLeave={handleMenuLeave}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-black hover:bg-gray-100 font-bold rounded-none">
                  <Hotel className="h-4 w-4" />
                  <span>هتل</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                <DesktopDropdownMenu
                  menuRef={hotelMenuRef}
                  isOpen={activeHoverMenu === 'hotel'}
                  items={hotelMenuItems}
                  onSubmenuHover={() => handleMenuHover('hotel')}
                  onSubmenuLeave={handleMenuLeave}
                />
              </div>

              {/* Other Menu */}
              <div 
                className="relative"
                ref={otherMenuRef}
                onMouseEnter={() => handleMenuHover('other')}
                onMouseLeave={handleMenuLeave}
              >
                <button className="flex items-center gap-1 px-3 py-2 text-black hover:bg-gray-100 font-bold rounded-none">
                  <span>سایر</span>
                  <ChevronDown className="h-3 w-3" />
                </button>
                <DesktopDropdownMenu
                  menuRef={otherMenuRef}
                  isOpen={activeHoverMenu === 'other'}
                  items={otherMenuItems}
                  onSubmenuHover={() => handleMenuHover('other')}
                  onSubmenuLeave={handleMenuLeave}
                />
              </div>
            </div>
          </div>

          {/* Profile Menu */}
          <div className="flex items-center gap-2 relative" ref={profileMenuRef}>
            <button
              onClick={() => setProfileMenuOpen(!profileMenuOpen)}
              className={cn(
                "flex items-center justify-center border border-gray-300 bg-[#fffefe]",
                profileMenuOpen && "border-black"
              )}
            >
              {loading ? (
                <div className="h-8 w-8 bg-gray-300 animate-pulse" />
              ) : user ? (
                <div className="flex h-8 w-8 items-center justify-center bg-blue-500 text-white text-sm font-bold">
                  {user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
              ) : (
                <div className="flex h-8 w-8 items-center justify-center bg-blue-500">
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