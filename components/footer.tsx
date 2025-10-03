import Link from "next/link"
import { Phone, Mail, MapPin, Instagram, Twitter } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/50">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* About */}
          <div>
            <h3 className="mb-4 text-lg font-bold">درباره سفرتودی</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              سفرتودی بزرگترین پلتفرم رزرو آنلاین هتل، بلیط هواپیما و قطار در ایران است. ما با ارائه بهترین قیمت‌ها و
              خدمات، سفر شما را راحت‌تر می‌کنیم.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/hotels" className="text-muted-foreground hover:text-primary transition-colors">
                  رزرو هتل
                </Link>
              </li>
              <li>
                <Link href="/flights" className="text-muted-foreground hover:text-primary transition-colors">
                  خرید بلیط هواپیما
                </Link>
              </li>
              <li>
                <Link href="/trains" className="text-muted-foreground hover:text-primary transition-colors">
                  خرید بلیط قطار
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-primary transition-colors">
                  وبلاگ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="mb-4 text-lg font-bold">پشتیبانی</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary transition-colors">
                  سوالات متداول
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary transition-colors">
                  قوانین و مقررات
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary transition-colors">
                  حریم خصوصی
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                  تماس با ما
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-lg font-bold">تماس با ما</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>۰۲۱-۱۲۳۴۵۶۷۸</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@safartody.ir</span>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-1" />
                <span>تهران، خیابان ولیعصر، پلاک ۱۲۳</span>
              </li>
            </ul>
            <div className="mt-4 flex gap-3">
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>© ۱۴۰۳ سفرتودی. تمامی حقوق محفوظ است.</p>
        </div>
      </div>
    </footer>
  )
}
