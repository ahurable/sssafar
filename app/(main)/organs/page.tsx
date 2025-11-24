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
    // Only run GSAP on client side
    if (typeof window === 'undefined') return;

    const loadGSAP = async () => {
      const gsap = (await import('gsap')).default;
      const ScrollTrigger = (await import('gsap/ScrollTrigger')).default;
      
      gsap.registerPlugin(ScrollTrigger);

      // Mobile detection
      const isMobile = window.innerWidth < 768;

      // Hero animation - safe for mobile
      gsap.fromTo('.hero-content', 
        { y: isMobile ? 30 : 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 1, 
          ease: 'power3.out',
          // Prevent horizontal movement
          x: 0 
        }
      )

      // Services animation - mobile safe
      gsap.fromTo('.service-card', 
        { 
          y: isMobile ? 20 : 30, 
          opacity: 0,
          x: 0 // Ensure no horizontal movement
        },
        {
          y: 0,
          opacity: 1,
          x: 0, // Lock X position
          duration: 0.8,
          stagger: 0.2,
          scrollTrigger: {
            trigger: servicesRef.current,
            start: 'top 80%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            // Mobile-specific settings
            markers: false, // Remove in production
            invalidateOnRefresh: true // Recalculate on resize
          }
        }
      )

      // Process steps animation - mobile optimized
      gsap.fromTo('.process-step', 
        { 
          y: isMobile ? 20 : 30, 
          opacity: 0,
          x: 0 // No horizontal movement
        },
        {
          y: 0,
          opacity: 1,
          x: 0, // Lock X position
          duration: 0.8,
          stagger: isMobile ? 0.4 : 0.3, // Slower stagger on mobile
          scrollTrigger: {
            trigger: processRef.current,
            start: isMobile ? 'top 90%' : 'top 70%',
            end: 'bottom 20%',
            toggleActions: 'play none none reverse',
            invalidateOnRefresh: true
          }
        }
      )

      // Benefits animation - mobile safe
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

      // Floating animation - reduced movement on mobile
      gsap.to('.floating-element', {
        y: isMobile ? -5 : -10, // Less movement on mobile
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut'
      })

      // Cleanup function to kill ScrollTriggers on unmount
      return () => {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
      };
    }

    loadGSAP();

    // Additional mobile-specific CSS fixes
    const preventHorizontalScroll = () => {
      document.body.style.overflowX = 'hidden';
      document.documentElement.style.overflowX = 'hidden';
    }

    preventHorizontalScroll();

    // Re-run on resize
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
      <section ref={heroRef} className="relative bg-gradient-to-l from-blue-900 via-blue-800 to-blue-600 text-white py-24 overflow-hidden" dir="rtl">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 floating-element">
            <Plane className="h-16 w-16" />
          </div>
          <div className="absolute bottom-20 right-20 floating-element" style={{ animationDelay: '1s' }}>
            <Building className="h-16 w-16" />
          </div>
          <div className="absolute top-1/2 left-1/3 floating-element" style={{ animationDelay: '0.5s' }}>
            <Users className="h-12 w-12" />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="hero-content max-w-5xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-500 hover:bg-blue-600 text-white text-lg py-2 px-4">
              پنل سازمانی اختصاصی
            </Badge>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              مدیریت هوشمند
              <span className="block text-blue-200">سفرهای سازمانی</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-95 leading-relaxed">
              پنل اختصاصی برای شرکت‌ها و سازمان‌ها | اعتبار سفر برای کارکنان | 
              <span className="block">رزرو بلیط هواپیما، هتل، CIP و تور با بهترین قیمت‌ها</span>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-700 hover:bg-gray-100 font-semibold text-lg py-3 px-8"
                onClick={scrollToForm}
              >
                درخواست پنل سازمانی
                <FileText className="mr-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-blue-800 text-lg py-3 px-8"
              >
                اطلاعات بیشتر
                <ArrowLeft className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-white border-b" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">۵۰۰+</div>
              <div className="text-gray-600">شرکت فعال</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">۵۰,۰۰۰+</div>
              <div className="text-gray-600">کارمند تحت پوشش</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">۱۵۰M+</div>
              <div className="text-gray-600">اعتبار مدیریت شده</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-600 mb-2">۹۸%</div>
              <div className="text-gray-600">رضایت مشتریان</div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section ref={servicesRef} className="py-20 bg-gray-50" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">خدمات کامل سفر برای سازمان شما</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              تمام خدمات سفر و اقامت با بهترین قیمت و کیفیت در اختیار کارکنان شرکت شما قرار می‌گیرد
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="service-card text-center p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plane className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">پرواز داخلی و خارجی</h3>
              <p className="text-gray-600 leading-relaxed">
                رزرو بلیط تمامی خطوط هوایی داخلی و بین‌المللی با بهترین قیمت و شرایط
              </p>
            </Card>

            <Card className="service-card text-center p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Hotel className="h-10 w-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">رزرو هتل در سراسر جهان</h3>
              <p className="text-gray-600 leading-relaxed">
                رزرو هتل در ایران و سراسر جهان با گارانتی بهترین قیمت و کیفیت
              </p>
            </Card>

            <Card className="service-card text-center p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <div className="bg-purple-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">خدمات فرودگاهی VIP</h3>
              <p className="text-gray-600 leading-relaxed">
                خدمات CIP و فرودگاهی VIP برای مدیران و کارکنان با بالاترین استانداردها
              </p>
            </Card>

            <Card className="service-card text-center p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <div className="bg-orange-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">تورهای سازمانی</h3>
              <p className="text-gray-600 leading-relaxed">
                تورهای داخلی و خارجی، گشت‌های شهری و برنامه‌های تفریحی برای سازمان‌ها
              </p>
            </Card>

            <Card className="service-card text-center p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <CreditCardIcon className="h-10 w-10 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">اعتبار سفر اختصاصی</h3>
              <p className="text-gray-600 leading-relaxed">
                سیستم اعتباردهی هوشمند برای مدیریت هزینه‌های سفر کارکنان
              </p>
            </Card>

            <Card className="service-card text-center p-8 hover:shadow-xl transition-all duration-300 border-0 bg-white">
              <div className="bg-indigo-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-2xl font-bold mb-4">گزارش‌گیری پیشرفته</h3>
              <p className="text-gray-600 leading-relaxed">
                سیستم گزارش‌گیری جامع برای تحلیل هزینه‌ها و بهینه‌سازی سفرها
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section ref={processRef} className="py-20 bg-white" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">فرآیند فعال‌سازی پنل سازمانی</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              در ۶ مرحله ساده، پنل اختصاصی شرکت خود را فعال کنید و از مزایای آن بهره‌مند شوید
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="process-step text-center p-6">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                ۱
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl">
                <FileText className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">ثبت درخواست</h3>
                <p className="text-gray-600 leading-relaxed">
                  فرم درخواست پنل سازمانی را تکمیل کنید تا کارشناسان ما با شما تماس بگیرند
                </p>
              </div>
            </div>

            <div className="process-step text-center p-6">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                ۲
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl">
                <PhoneCall className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">مشاوره تخصصی</h3>
                <p className="text-gray-600 leading-relaxed">
                  کارشناسان ما با شما تماس گرفته و راهنمایی کامل ارائه می‌دهند
                </p>
              </div>
            </div>

            <div className="process-step text-center p-6">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                ۳
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl">
                <CreditCard className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">انعقاد قرارداد</h3>
                <p className="text-gray-600 leading-relaxed">
                  قرارداد همکاری امضا شده و مبلغ اعتبار اولیه واریز می‌شود
                </p>
              </div>
            </div>

            <div className="process-step text-center p-6">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                ۴
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl">
                <Building className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">فعال‌سازی پنل</h3>
                <p className="text-gray-600 leading-relaxed">
                  پنل سازمانی در داشبورد شما فعال شده و مدیران دسترسی دریافت می‌کنند
                </p>
              </div>
            </div>

            <div className="process-step text-center p-6">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                ۵
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl">
                <UserCheck className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">افزودن کارکنان</h3>
                <p className="text-gray-600 leading-relaxed">
                  مدیر با جستجوی شماره یا نام، کارکنان را پیدا کرده و اعتبار اختصاص می‌دهد
                </p>
              </div>
            </div>

            <div className="process-step text-center p-6">
              <div className="bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold shadow-lg">
                ۶
              </div>
              <div className="bg-blue-50 p-6 rounded-2xl">
                <CheckCircle className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-3">شروع استفاده</h3>
                <p className="text-gray-600 leading-relaxed">
                  پس از تایید مدیر مالی، کارکنان از اعتبار برای رزرو خدمات استفاده می‌کنند
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section ref={benefitsRef} className="py-20 bg-gradient-to-l from-gray-50 to-blue-50" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">مزایای پنل سازمانی برای شرکت شما</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="benefit-item bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 p-3 rounded-xl ml-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">مدیریت متمرکز هزینه‌های سفر</h3>
                    <p className="text-gray-600 leading-relaxed">
                      تمامی هزینه‌های سفر کارکنان در یک پنل یکپارچه مدیریت می‌شود. 
                      امکان تعیین سقف اعتبار، مشاهده تاریخچه تراکنش‌ها و کنترل کامل 
                      بر هزینه‌ها در اختیار مدیران مالی قرار می‌گیرد.
                    </p>
                  </div>
                </div>
              </div>

              <div className="benefit-item bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 p-3 rounded-xl ml-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">تخفیف‌های ویژه سازمانی</h3>
                    <p className="text-gray-600 leading-relaxed">
                      بهره‌مندی از تخفیف‌های انحصاری برای سازمان‌ها تا ۲۰٪ نسبت به 
                      قیمت‌های عمومی. قیمت‌های ویژه برای پرواز، هتل و خدمات CIP 
                      که فقط برای شرکت‌های عضو قابل دسترسی است.
                    </p>
                  </div>
                </div>
              </div>

              <div className="benefit-item bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 p-3 rounded-xl ml-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">سیستم چندلایه تایید</h3>
                    <p className="text-gray-600 leading-relaxed">
                      سیستم هوشمند تایید چندمرحله‌ای: مدیر مستقیم → مدیر مالی → حسابدار.
                      هر تراکنش تنها پس از تایید تمام سطوح مجاز، برای کارمند قابل استفاده خواهد بود.
                    </p>
                  </div>
                </div>
              </div>

              <div className="benefit-item bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 p-3 rounded-xl ml-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">گزارش‌گیری دقیق و آنلاین</h3>
                    <p className="text-gray-600 leading-relaxed">
                      گزارش‌های دقیق و لحظه‌ای از هزینه‌ها، سفرها و الگوی مصرف هر کارمند.
                      امکان خروجی Excel و PDF برای تحلیل‌های مالی و حسابداری پیشرفته.
                    </p>
                  </div>
                </div>
              </div>

              <div className="benefit-item bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 p-3 rounded-xl ml-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">پشتیبانی اختصاصی ۲۴/۷</h3>
                    <p className="text-gray-600 leading-relaxed">
                      پشتیبانی تلفنی و آنلاین ۲۴ ساعته برای سازمان‌های عضو.
                      کارشناسان اختصاصی برای پاسخگویی به سوالات فنی و مالی شرکت شما.
                    </p>
                  </div>
                </div>
              </div>

              <div className="benefit-item bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
                <div className="flex items-start mb-4">
                  <div className="bg-green-100 p-3 rounded-xl ml-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">رزرو آسان و سریع</h3>
                    <p className="text-gray-600 leading-relaxed">
                      رابط کاربری ساده و intuitive برای رزرو تمام خدمات تنها با چند کلیک.
                      جستجوی هوشمند، مقایسه قیمت و امکان رزرو گروهی برای سفرهای تیمی.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section ref={formRef} className="py-20 bg-white" dir="rtl">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8 shadow-2xl border-0 bg-gradient-to-l from-white to-blue-50">
              <div className="text-center mb-10">
                <Badge className="mb-4 bg-blue-600 text-white text-lg py-2 px-4">
                  درخواست پنل سازمانی
                </Badge>
                <h2 className="text-4xl font-bold text-gray-900 mb-4">فرم درخواست پنل سازمانی</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                  فرم زیر را تکمیل کنید تا کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس بگیرند
                  و راهنمایی کامل برای فعال‌سازی پنل سازمانی ارائه دهند
                </p>
              </div>

              <RequestCorporateForm />
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-l from-blue-600 to-blue-800 text-white" dir="rtl">
        <div className="container mx-auto px-4 text-center">
          <HeadphonesIcon className="h-20 w-20 mx-auto mb-6 opacity-90" />
          <h2 className="text-4xl font-bold mb-6">آماده ایجاد پنل سازمانی هستید؟</h2>
          <p className="text-xl mb-8 max-w-3xl mx-auto opacity-95 leading-relaxed">
            همین امروز درخواست خود را ثبت کنید. کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس گرفته 
            و راهنمایی کامل برای فعال‌سازی پنل سازمانی و بهره‌مندی از مزایای ویژه سازمانی ارائه می‌دهند.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold text-lg py-4 px-10"
              onClick={scrollToForm}
            >
              <FileText className="mr-2 h-6 w-6" />
              ثبت درخواست پنل سازمانی
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-blue-700 text-lg py-4 px-10"
            >
              <PhoneCall className="mr-2 h-6 w-6" />
              تماس با پشتیبانی
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </>
  )
}