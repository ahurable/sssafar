import { SignUpForm } from "@/components/auth/signup-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">ثبت‌نام</h1>
            <p className="text-muted-foreground">حساب کاربری جدید ایجاد کنید</p>
          </div>
          <SignUpForm />
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">قبلاً ثبت‌نام کرده‌اید؟ </span>
            <Link href="/auth/signin" className="font-medium text-primary hover:underline">
              وارد شوید
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
