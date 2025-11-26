"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, CheckCircle } from "lucide-react"

export function ForgotPasswordForm() {
  const [resetMethod, setResetMethod] = useState<"email" | "phone">("email")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle forgot password logic here
    // console.log("[v0] Forgot password form submitted")
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <h3 className="mb-2 text-xl font-bold">لینک بازیابی ارسال شد</h3>
          <p className="text-muted-foreground leading-relaxed">
            لینک بازیابی رمز عبور به {resetMethod === "email" ? "ایمیل" : "شماره موبایل"} شما ارسال شد. لطفاً پیام‌های خود
            را بررسی کنید.
          </p>
          <Button className="mt-6 w-full" onClick={() => setSubmitted(false)}>
            ارسال مجدد
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={resetMethod} onValueChange={(v) => setResetMethod(v as "email" | "phone")}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="email">ایمیل</TabsTrigger>
              <TabsTrigger value="phone">موبایل</TabsTrigger>
            </TabsList>

            <TabsContent value="email" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email">ایمیل</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="reset-email" type="email" placeholder="example@email.com" className="pr-10" required />
                </div>
                <p className="text-xs text-muted-foreground">لینک بازیابی رمز عبور به ایمیل شما ارسال خواهد شد</p>
              </div>
            </TabsContent>

            <TabsContent value="phone" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-phone">شماره موبایل</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="reset-phone" type="tel" placeholder="09123456789" className="pr-10" required />
                </div>
                <p className="text-xs text-muted-foreground">کد بازیابی به شماره موبایل شما ارسال خواهد شد</p>
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="w-full" size="lg">
            ارسال لینک بازیابی
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
