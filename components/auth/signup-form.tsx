"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, Lock, Eye, EyeOff } from "lucide-react"
import { useNotification } from "@/contexts/notification/NotificationContext"
import { useSnack } from "@/hooks/use-notification"

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

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
          )}

          <Tabs value={signupMethod} onValueChange={(v) => setSignupMethod(v as "email" | "phone")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email">ایمیل</TabsTrigger>
              <TabsTrigger value="phone">موبایل</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">ایمیل</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="example@email.com"
                    className="pr-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required={signupMethod === "email"}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-phone">شماره موبایل</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="09123456789"
                    className="pr-10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    required={signupMethod === "phone"}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="signup-password">رمز عبور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                placeholder="حداقل 8 کاراکتر"
                className="pr-10 pl-10"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">تکرار رمز عبور</Label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="رمز عبور را دوباره وارد کنید"
                className="pr-10 pl-10"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 rounded border-gray-300" required />
            <span className="text-muted-foreground leading-relaxed">
              با ثبت‌نام، شما{" "}
              <a href="/terms" className="text-primary hover:underline">
                قوانین و مقررات
              </a>{" "}
              و{" "}
              <a href="/privacy" className="text-primary hover:underline">
                حریم خصوصی
              </a>{" "}
              را می‌پذیرید
            </span>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "در حال ثبت‌نام..." : "ثبت‌نام"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
