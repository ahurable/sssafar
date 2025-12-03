'use client'

import { useEffect, useRef } from 'react'
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Plane,
  Hotel,
  Shield,
  Users,
  CreditCard,
  Building,
  CheckCircle,
  ArrowLeft,
  PhoneCall,
  FileText,
  UserCheck,
  CreditCardIcon,
  BarChart3,
  HeadphonesIcon
} from "lucide-react"
import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import RequestCorporateForm from './form'

export default function CorporateLandingPage() {
  const formRef = useRef(null)
  const heroRef = useRef(null)
  const servicesRef = useRef(null)
  const processRef = useRef(null)
  const benefitsRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadGSAP = async () => {
      const gsap = (await import('gsap')).default;
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).default;

      gsap.registerPlugin(ScrollTrigger);

      const isMobile = window.innerWidth < 768;

      // Hero animation
      gsap.fromTo('.hero-content',
        { y: isMobile ? 30 : 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: 'power3.out',
          x: 0
        }
      )

      // Services animation
      gsap.fromTo('.service-card',
        {
          y: isMobile ? 20 : 30,
          opacity: 0,
          x: 0
        },
        {
          y: 0,
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            markers: false,
            invalidateOnRefresh: true
          }
        }
      )

      // Process steps animation
      gsap.fromTo('.process-step',
        {
          y: isMobile ? 20 : 30,
          opacity: 0,
          x: 0
        },
        {
          y: 0,
          opacity: 1,
          x: 0,
          duration: 0.8,
          stagger: isMobile ? 0.4 : 0.3,
          scrollTrigger: {
            trigger: processRef.current,
            start: isMobile ? 'top 90%' : 'top 70%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true
          }
        }
      )

      // Benefits animation
      gsap.fromTo('.benefit-item',
        {
          y: isMobile ? 15 : 30,
          opacity: 0,
          x: 0
        },
        {
          y: 0,
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: isMobile ? 0.15 : 0.1,
          scrollTrigger: {
            trigger: benefitsRef.current,
            start: isMobile ? 'top 90%' : 'top 70%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true
          }
        }
      )

      // Floating animation
      gsap.to('.floating-element', {
        y: isMobile ? -5 : -10,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }

    loadGSAP();

    const preventHorizontalScroll = () => {
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    }

    preventHorizontalScroll();
    window.addEventListener('resize', preventHorizontalScroll);

    return () => {
      window.removeEventListener('resize', preventHorizontalScroll);
      document.body.style.overflowX = '';
      document.documentElement.style.overflowX = '';
    }
  }, [])

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section ref={heroRef} className="relative bg-[#fffefe] text-gray-900 py-20 overflow-hidden border-b border-blue-900" dir="rtl">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          {/* Top Row */}
          <div className="absolute top-16 left-16 floating-element">
            <Plane className="h-12 w-12 text-blue-900/40" />
          </div>
          <div className="absolute top-24 right-1/4 floating-element" style={{ animationDelay: '0.3s' }}>
            <Hotel className="h-10 w-10 text-blue-900/40" />
          </div>
          <div className="absolute top-32 left-1/3 floating-element" style={{ animationDelay: '0.6s' }}>
            <Shield className="h-8 w-8 text-blue-900/40" />
          </div>

          {/* Middle Row */}
          <div className="absolute top-1/2 left-20 floating-element" style={{ animationDelay: '0.9s' }}>
            <Users className="h-14 w-14 text-blue-900/40" />
          </div>
          <div className="absolute top-1/2 right-32 floating-element" style={{ animationDelay: '0.2s' }}>
            <CreditCard className="h-12 w-12 text-blue-900/40" />
          </div>
          <div className="absolute top-2/5 left-2/4 floating-element" style={{ animationDelay: '0.5s' }}>
            <Building className="h-16 w-16 text-blue-900/40" />
          </div>

          {/* Bottom Row */}
          <div className="absolute bottom-32 left-24 floating-element" style={{ animationDelay: '0.7s' }}>
            <BarChart3 className="h-10 w-10 text-blue-900/40" />
          </div>
          <div className="absolute bottom-24 right-16 floating-element" style={{ animationDelay: '1.1s' }}>
            <FileText className="h-12 w-12 text-blue-900/40" />
          </div>
          <div className="absolute bottom-36 right-1/3 floating-element" style={{ animationDelay: '0.4s' }}>
            <UserCheck className="h-9 w-9 text-blue-900/40" />
          </div>

          {/* Additional floating elements for more density */}
          <div className="absolute top-40 right-40 floating-element" style={{ animationDelay: '1.3s' }}>
            <HeadphonesIcon className="h-7 w-7 text-blue-900/40" />
          </div>
          <div className="absolute bottom-44 left-44 floating-element" style={{ animationDelay: '0.8s' }}>
            <PhoneCall className="h-11 w-11 text-blue-900/40" />
          </div>
          <div className="absolute top-1/3 right-52 floating-element" style={{ animationDelay: '1.5s' }}>
            <CheckCircle className="h-8 w-8 text-blue-900/40" />
          </div>
        </div>

        {/* Animated dots background */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-blue-900/10 floating-element"
              style={{
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 8 + 4}px`,
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${Math.random() * 3 + 2}s`
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="hero-content max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-900 text-white text-sm py-1.5 px-4 border-0 floating-element" style={{ animationDelay: '0.2s' }}>
              پنل سازمانی اختصاصی
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
              مدیریت هوشمند
              <span className="block text-blue-900">سفرهای سازمانی</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 text-gray-600 leading-relaxed">
              پنل اختصاصی برای شرکت‌ها و سازمان‌ها | اعتبار سفر برای کارکنان |
              <span className="block">رزرو بلیط هواپیما، هتل، CIP و تور</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-blue-900 text-white hover:bg-blue-800 font-medium text-base py-2.5 px-6 floating-element"
                style={{ animationDelay: '0.4s' }}
                onClick={scrollToForm}
              >
                درخواست پنل سازمانی
                <FileText className="mr-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-16 bg-[#fffefe]" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">خدمات کامل سفر</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              تمام خدمات سفر و اقامت با بهترین قیمت و کیفیت
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Plane, title: "پرواز داخلی و خارجی", desc: "رزرو بلیط تمامی خطوط هوایی داخلی و بین‌المللی" },
              { icon: Hotel, title: "رزرو هتل در سراسر جهان", desc: "رزرو هتل در ایران و سراسر جهان با گارانتی بهترین قیمت" },
              { icon: Shield, title: "خدمات فرودگاهی VIP", desc: "خدمات CIP و فرودگاهی VIP برای مدیران و کارکنان" },
              { icon: Users, title: "تورهای سازمانی", desc: "تورهای داخلی و خارجی، گشت‌های شهری برای سازمان‌ها" },
              { icon: CreditCardIcon, title: "اعتبار سفر اختصاصی", desc: "سیستم اعتباردهی هوشمند برای مدیریت هزینه‌های سفر" },
              { icon: BarChart3, title: "گزارش‌گیری پیشرفته", desc: "سیستم گزارش‌گیری جامع برای تحلیل هزینه‌ها" }
            ].map((service, index) => (
              <Card key={index} className="service-card p-6 hover:shadow-lg transition-all duration-300 border border-blue-900 bg-white">
                <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <service.icon className="h-8 w-8 text-blue-900" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{service.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {service.desc}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={processRef} className="py-16 bg-[#fffefe] border-t border-blue-900" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">فرآیند فعال‌سازی</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              در ۶ مرحله ساده، پنل اختصاصی شرکت خود را فعال کنید
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { icon: FileText, title: "ثبت درخواست", desc: "فرم درخواست پنل سازمانی را تکمیل کنید" },
              { icon: PhoneCall, title: "مشاوره تخصصی", desc: "کارشناسان ما با شما تماس گرفته و راهنمایی کامل ارائه می‌دهند" },
              { icon: CreditCard, title: "انعقاد قرارداد", desc: "قرارداد همکاری امضا شده و مبلغ اعتبار اولیه واریز می‌شود" },
              { icon: Building, title: "فعال‌سازی پنل", desc: "پنل سازمانی در داشبورد شما فعال شده و مدیران دسترسی دریافت می‌کنند" },
              { icon: UserCheck, title: "افزودن کارکنان", desc: "مدیر با جستجوی شماره یا نام، کارکنان را پیدا کرده و اعتبار اختصاص می‌دهد" },
              { icon: CheckCircle, title: "شروع استفاده", desc: "پس از تایید مدیر مالی، کارکنان از اعتبار برای رزرو خدمات استفاده می‌کنند" }
            ].map((step, index) => (
              <div key={index} className="process-step text-center p-4">
                <div className="bg-blue-900 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-medium">
                  {index + 1}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-blue-900">
                  <step.icon className="h-8 w-8 text-blue-900 mx-auto mb-3" />
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-16 bg-[#fffefe] border-t border-blue-900" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">مزایای پنل سازمانی</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                "مدیریت متمرکز هزینه‌های سفر کارکنان در یک پنل یکپارچه",
                "تخفیف‌های ویژه سازمانی تا ۲۰٪ نسبت به قیمت‌های عمومی",
                "سیستم هوشمند تایید چندمرحله‌ای برای تراکنش‌ها",
                "گزارش‌های دقیق و لحظه‌ای از هزینه‌ها و سفرها",
                "پشتیبانی تلفنی و آنلاین ۲۴ ساعته برای سازمان‌های عضو",
                "رابط کاربری ساده برای رزرو تمام خدمات تنها با چند کلیک"
              ].map((benefit, index) => (
                <div key={index} className="benefit-item bg-white p-4 rounded-lg border border-blue-900">
                  <div className="flex items-start">
                    <div className="bg-blue-900 p-2 rounded-lg ml-3">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {benefit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section ref={formRef} className="py-16 bg-[#fffefe] border-t border-blue-900" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="p-6 border border-blue-900">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">فرم درخواست پنل سازمانی</h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                  فرم زیر را تکمیل کنید تا کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس بگیرند
                </p>
              </div>

              <RequestCorporateForm />
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 bg-gray-50 border-t border-blue-900" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <HeadphonesIcon className="h-12 w-12 mx-auto mb-4 text-blue-900" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">آماده ایجاد پنل سازمانی هستید؟</h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            همین امروز درخواست خود را ثبت کنید. کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس خواهند گرفت.
          </p>
          <Button
            size="lg"
            className="bg-blue-900 text-white hover:bg-blue-800 font-medium py-2.5 px-8"
            onClick={scrollToForm}
          >
            <FileText className="mr-2 h-4 w-4" />
            ثبت درخواست پنل سازمانی
          </Button>
        </div>
      </section>

      <Footer />
    </>
  )
}