"use client"
import { useState } from 'react';
import Link from 'next/link';
import {
  Plane,
  Hotel,
  Shield,
  Users,
  Globe,
  Building,
  CreditCard,
  BarChart3
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ServiceCardsSection = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const services = [
    {
      icon: Plane,
      title: "پرواز",
      description: "رزرو بلیط تمامی خطوط هوایی با بهترین قیمت",
      href: "/flights",
      delay: 0
    },
    {
      icon: Users,
      title: "تورهای گروهی",
      description: "تورهای داخلی و خارجی برای سازمان‌ها و گروه‌ها",
      href: "/tours",
      delay: 0.3
    },
    {
      icon: Globe,
      title: "ویزا و گذرنامه",
      description: "مشاوره و خدمات اخذ ویزای کشورهای مختلف",
      href: "/visa",
      delay: 0.4
    },
    {
      icon: Building,
      title: "پنل سازمانی",
      description: "تعریف اعتبار سفر کارکنان سازمان",
      href: "/organs",
      delay: 0.5
    },
  ];

  return (
    <section className="py-16 bg-[#fffefe] border-blue-950/20" dir="rtl">
      <div className="container mx-auto px-2 lg:px-0">

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((service, index) => (
            <Link key={index} href={service.href} className="block">
              <Card
                className={`
                  relative overflow-hidden border-2 border-blue-950/20 bg-white
                  transition-all duration-500 ease-out
                  hover:border-blue-950 hover:shadow-2xl
                  ${hoveredCard === index ? 'scale-105' : 'scale-100'}
                  cursor-pointer
                `}
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  animationDelay: `${service.delay}s`
                }}
              >
                <CardContent className="p-4 flex gap-2 items-center">
                  {/* Icon Container */}
                  <div className={`
                    inline-flex items-center justify-center w-16 h-16
                    transition-all duration-500 ease-out rounded-full
                    ${hoveredCard === index ? 'scale-110 bg-[#d0181f]' : 'scale-100'}
                  `}>
                    <service.icon className={`
                      w-8 h-8 text-[#d0181f]
                      transition-transform duration-700 ease-out
                      ${hoveredCard === index ? 'rotate-12 scale-110 text-white' : 'rotate-0 scale-100 '}
                    `} />
                  </div>

                  <div>
                    {/* Title */}
                    <h3 className={`
                        font-bold text-blue-950
                        transition-all duration-500
                        ${hoveredCard === index ? 'text-blue-900' : ''}
                    `}>
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className={`
                        text-xs text-blue-950/70 leading-relaxed
                        transition-all duration-500
                        ${hoveredCard === index ? 'text-blue-900/80' : ''}
                    `}>
                      {service.description}
                    </p>
                  </div>
                  {/* Hover Border Effect */}
                  <div className={`
                    absolute bottom-0 right-0 w-full h-0.5 bg-blue-950
                    transition-all duration-500 ease-out
                    ${hoveredCard === index ? 'w-full opacity-100' : 'w-0 opacity-0'}
                  `} />

                  {/* Subtle Background Effect on Hover */}
                  <div className={`
                    absolute inset-0 bg-gradient-to-br from-blue-950/5 to-transparent
                    transition-opacity duration-500
                    ${hoveredCard === index ? 'opacity-100' : 'opacity-0'}
                  `} />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServiceCardsSection;