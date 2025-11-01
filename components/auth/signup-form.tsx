"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, Lock, Eye, EyeOff, UserPlus, ArrowRight, CheckCircle } from "lucide-react"
import { useSnack } from "@/hooks/use-notification"
import Link from "next/link"

export function SignUpForm() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [signupMethod, setSignupMethod] = useState<"email" | "phone">("email")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })
  const { success } = useSnack()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("رمز عبور و تکرار آن مطابقت ندارند")
      setLoading(false)
      return
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signupMethod === "email" ? formData.email : "",
          phone: signupMethod === "phone" ? formData.phone : "",
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      })

      const data = await res.json()

      if (res.ok) {
        success(
          'عملیات موفق',
          'حساب کاربری شما ایجاد شد',
          3000
        )
        router.push("/")
        router.refresh()
      } else {
        setError(data.error || "خطا در ثبت‌نام")
      }
    } catch (err) {
      console.error("[v0] Signup error:", err)
      setError("خطا در برقراری ارتباط با سرور")
    } finally {
      setLoading(false)
    }
  }

  // Clear identifier when switching tabs
  const handleTabChange = (value: string) => {
    setSignupMethod(value as "email" | "phone")
    setFormData(prev => ({ ...prev, email: "", phone: "" }))
  }

  return (
    <Card className="border-0 shadow-2xl bg-gradient-to-br from-white to-red-50/50 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="text-center mb-2">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <UserPlus className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-br from-red-600 to-pink-600 bg-clip-text text-transparent">
            ایجاد حساب کاربری
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 mt-6">
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              {error}
            </div>
          )}

          <Tabs value={signupMethod} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100/50 p-1 rounded-2xl">
              <TabsTrigger 
                value="email" 
                className="rounded-xl data-[state=active]:bg-gradient-to-l data-[state=active]:from-red-500 data-[state=active]:to-pink-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Mail className="h-4 w-4 ml-2" />
                ایمیل
              </TabsTrigger>
              <TabsTrigger 
                value="phone"
                className="rounded-xl data-[state=active]:bg-gradient-to-l data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-300"
              >
                <Phone className="h-4 w-4 ml-2" />
                موبایل
              </TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700">
                  آدرس ایمیل
                </Label>
                <div className="relative">
                  <Mail className="absolute right-4 top-3 h-5 w-5 text-red-500" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pr-12 h-12 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 bg-white/80"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required={signupMethod === "email"}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4 animate-in fade-in duration-300">
              <div className="space-y-3">
                <Label htmlFor="signup-phone" className="text-sm font-semibold text-gray-700">
                  شماره موبایل
                </Label>
                <div className="relative">
                  <Phone className="absolute right-4 top-3 h-5 w-5 text-pink-500" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="09123456789"
                    className="pr-12 h-12 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 bg-white/80"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required={signupMethod === "phone"}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-3">
            <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700">
              رمز عبور
            </Label>
            <div className="relative">
              <Lock className="absolute right-4 top-3 h-5 w-5 text-red-500" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="حداقل 8 کاراکتر"
                className="pr-12 pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 bg-white/80"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-3 text-gray-400 hover:text-red-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500">رمز عبور باید حداقل 8 کاراکتر باشد</p>
          </div>

          <div className="space-y-3">
            <Label htmlFor="confirm-password" className="text-sm font-semibold text-gray-700">
              تکرار رمز عبور
            </Label>
            <div className="relative">
              <Lock className="absolute right-4 top-3 h-5 w-5 text-pink-500" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="رمز عبور را دوباره وارد کنید"
                className="pr-12 pl-12 h-12 rounded-xl border-2 border-gray-200 focus:border-pink-500 focus:ring-2 focus:ring-pink-200 transition-all duration-300 bg-white/80"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-4 top-3 text-gray-400 hover:text-pink-600 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 text-sm p-4 bg-gray-50 rounded-xl border border-gray-200">
            <div className="relative flex-shrink-0 mt-0.5">
              <input 
                type="checkbox" 
                className="w-5 h-5 rounded-lg border-2 border-gray-300 checked:border-red-500 checked:bg-red-500 transition-all duration-200 appearance-none checked:before:content-['✓'] checked:before:text-white checked:before:flex checked:before:items-center checked:before:justify-center" 
                required 
              />
            </div>
            <span className="text-gray-600 leading-relaxed">
              با ثبت‌نام، شما{" "}
              <a href="/terms" className="text-red-600 hover:text-red-700 font-medium underline transition-colors">
                قوانین و مقررات
              </a>{" "}
              و{" "}
              <a href="/privacy" className="text-red-600 hover:text-red-700 font-medium underline transition-colors">
                حریم خصوصی
              </a>{" "}
              را می‌پذیرید
            </span>
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl bg-gradient-to-l from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300 text-white font-bold text-lg"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                در حال ثبت‌نام...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                ایجاد حساب کاربری
              </div>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-2 text-gray-600 mb-4">
            <div className="h-px bg-gray-300 flex-1"></div>
            <span className="text-sm">حساب کاربری دارید؟</span>
            <div className="h-px bg-gray-300 flex-1"></div>
          </div>
          <Link 
            href="/auth/signin" 
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors group"
          >
            ورود به حساب کاربری
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}