import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <Link
            href="/auth/signin"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-6 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            بازگشت به ورود
          </Link>
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">بازیابی رمز عبور</h1>
            <p className="text-muted-foreground">ایمیل یا شماره موبایل خود را وارد کنید</p>
          </div>
          <ForgotPasswordForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}
