"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, Lock, Eye, EyeOff, User, ArrowLeft, LogIn } from "lucide-react"
import Link from "next/link"
import { useSnack } from "@/hooks/use-notification"

export function SignInForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  })
  const { success, error } = useSnack()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // console.log("Starting signin request...")
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: 'include'
      })

      // console.log("Response status:", res.status)
      const data = await res.json()
      // console.log("Response data:", data)
      
      if (res.ok) {
        success('وارد حساب کاربری شدید', '', 1000)
        
        // Wait a bit for the cookie to be processed
        setTimeout(() => {
          // console.log("Redirecting to:", data.user.role === "ADMIN" ? "/admin" : "/dashboard")
          // Use window.location for full page reload to ensure middleware runs properly
          window.location.href = data.user.role === "ADMIN" ? "/admin" : "/dashboard"
        }, 1000)
      } else {
        error(data.error || "خطا در ورود")
      }
    } catch (err) {
      console.error("[v0] Signin error:", err)
      error("خطا در برقراری ارتباط با سرور")
    } finally {
      setLoading(false)
    }
  }

  // Clear identifier when switching tabs
  const handleTabChange = (value: string) => {
    setLoginMethod(value as "email" | "phone")
    setFormData(prev => ({ ...prev, identifier: "" }))
  }

  return (
    <Card className="border shadow-sm bg-fffefe">
      <CardContent className="p-8">
        <div className="text-center mb-2">
          <div className="mx-auto w-16 h-16 bg-blue-900 flex items-center justify-center shadow mb-4">
            <LogIn className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-blue-900">
            ورود به حساب کاربری
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          <Tabs value={loginMethod} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100 p-1">
              <TabsTrigger 
                value="email" 
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all duration-300"
              >
                <Mail className="h-4 w-4 ml-2" />
                ایمیل
              </TabsTrigger>
              <TabsTrigger 
                value="phone"
                className="data-[state=active]:bg-blue-900 data-[state=active]:text-white transition-all duration-300"
              >
                <Phone className="h-4 w-4 ml-2" />
                موبایل
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 rtl animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-gray-700 float-right">
                  آدرس ایمیل
                </Label>
                <div className="relative">
                  <Mail className="absolute right-4 top-11 h-5 w-5 text-gray-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    className="pr-12 h-12 border border-gray-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all duration-300 bg-[#fffefe]"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    required
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4 rtl animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 float-right">
                  شماره موبایل
                </Label>
                <div className="relative">
                  <Phone className="absolute right-4 top-11 h-5 w-5 text-gray-500" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="09123456789"
                    className="pr-12 h-12 border border-gray-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all duration-300 bg-[#fffefe]"
                    value={formData.identifier}
                    onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
                    required
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-3">
            <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
              رمز عبور
            </Label>
            <div className="relative">
              <Lock className="absolute right-4 top-3 h-5 w-5 text-gray-500" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="رمز عبور خود را وارد کنید"
                className="pr-12 pl-12 h-12 border border-gray-300 focus:border-blue-900 focus:ring-1 focus:ring-blue-900 transition-all duration-300 bg-[#fffefe]"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-3 text-gray-400 hover:text-blue-900 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 border border-gray-300 checked:border-blue-900 checked:bg-blue-900 transition-all duration-200 appearance-none checked:before:content-['✓'] checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center" 
                />
              </div>
              <span className="text-gray-600 group-hover:text-gray-800 transition-colors">مرا به خاطر بسپار</span>
            </label>
            <Link 
              href="/auth/forgot-password" 
              className="text-blue-900 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              فراموشی رمز عبور؟
            </Link>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 bg-blue-900 hover:bg-blue-800 shadow hover:shadow-md transition-all duration-300 text-white font-bold text-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin" />
                در حال ورود...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-5 w-5" />
                ورود به حساب
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-sm">حساب کاربری ندارید؟</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
          <Link 
            href="/auth/signup" 
            className="inline-flex items-center gap-2 text-blue-900 hover:text-blue-800 font-medium transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            ایجاد حساب کاربری جدید
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}