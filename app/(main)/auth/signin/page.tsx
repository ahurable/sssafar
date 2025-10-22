import { SignInForm } from "@/components/auth/signin-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function SignInPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">خوش آمدید</h1>
            <p className="text-muted-foreground">برای ادامه وارد حساب کاربری خود شوید</p>
          </div>
          <SignInForm />
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">حساب کاربری ندارید؟ </span>
            <Link href="/auth/signup" className="font-medium text-primary hover:underline">
              ثبت‌نام کنید
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
