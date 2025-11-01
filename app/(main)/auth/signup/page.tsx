import { SignUpForm } from "@/components/auth/signup-form"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-red-50 via-pink-50 to-purple-50">
      <Header />
      <main className="flex-1 flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black mb-4 bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              به خانواده سفرتودی بپیوندید
            </h1>
            <p className="text-gray-600 text-lg">حساب کاربری جدید ایجاد کنید و از خدمات ما بهره‌مند شوید</p>
          </div>
          <SignUpForm />
        </div>
      </main>
      <Footer />
    </div>
  )
}