import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useSnack } from "@/hooks/use-notification"
import { FileText } from "lucide-react"
import { useState } from "react"

const RequestCorporateForm = () => {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { error, success } = useSnack()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsSubmitting(true)

        const formData = new FormData(e.currentTarget)
        
        // برای دیباگ می‌توانید ببینید چه داده‌هایی جمع‌آوری شده
        const formDataObject: any = {}
        for (let [key, value] of formData.entries()) {
            formDataObject[key] = value
        }
        console.log('FormData collected:', formDataObject)

        const data = {
            companyName: formData.get('companyName') as string,
            companyType: formData.get('companyType') as string,
            email: formData.get('email') as string,
            phone: formData.get('phone') as string,
            address: formData.get('address') as string,
            contactPerson: formData.get('contactPerson') as string,
            employeeCount: formData.get('employeeCount') as string,
            needs: formData.get('needs') as string
        }

        console.log('Data to send:', data)

        try {
            const response = await fetch('/api/companies/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })

            const result = await response.json()

            if (response.ok) {
                success('درخواست شما با موفقیت ثبت شد. کارشناسان ما در کمتر از ۲۴ ساعت با شما تماس خواهند گرفت.')
                // ریست فرم
                e.currentTarget.reset()
            } else {
                error(result.error || 'خطایی در ارسال فرم رخ داده است.')
            }
        } catch (err) {
            console.log(err)
            error('خطای شبکه. لطفا مجددا تلاش کنید.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className="space-y-8" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <label htmlFor="companyName" className="block text-lg font-semibold text-gray-700 mb-3">
                        نام کامل شرکت <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="companyName"
                        name="companyName" // اضافه کردن name attribute
                        type="text"
                        placeholder="نام کامل شرکت به فارسی"
                        className="h-12 text-lg"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="companyType" className="block text-lg font-semibold text-gray-700 mb-3">
                        نوع فعالیت شرکت <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="companyType"
                        name="companyType" // اضافه کردن name attribute
                        type="text"
                        placeholder="مانند: بازرگانی، تولیدی، خدماتی، استارتاپ و ..."
                        className="h-12 text-lg"
                        required
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <label htmlFor="email" className="block text-lg font-semibold text-gray-700 mb-3">
                        ایمیل رسمی شرکت <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="email"
                        name="email" // اضافه کردن name attribute
                        type="email"
                        placeholder="email@company.com"
                        className="h-12 text-lg"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-lg font-semibold text-gray-700 mb-3">
                        تلفن تماس شرکت <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="phone"
                        name="phone" // اضافه کردن name attribute
                        type="tel"
                        placeholder="شماره تلفن ثابت شرکت"
                        className="h-12 text-lg"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="address" className="block text-lg font-semibold text-gray-700 mb-3">
                    آدرس کامل شرکت <span className="text-red-500">*</span>
                </label>
                <Textarea
                    id="address"
                    name="address" // اضافه کردن name attribute
                    placeholder="آدرس کامل شرکت به همراه کد پستی"
                    rows={3}
                    className="text-lg"
                    required
                />
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <label htmlFor="contactPerson" className="block text-lg font-semibold text-gray-700 mb-3">
                        شخص رابط (مدیر منابع انسانی/مالی) <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="contactPerson"
                        name="contactPerson" // اضافه کردن name attribute
                        type="text"
                        placeholder="نام و نام خانوادگی شخص رابط"
                        className="h-12 text-lg"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="employeeCount" className="block text-lg font-semibold text-gray-700 mb-3">
                        تعداد کارکنان <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="employeeCount"
                        name="employeeCount" // اضافه کردن name attribute
                        type="number"
                        placeholder="تعداد تقریبی کارکنان"
                        min="1"
                        className="h-12 text-lg"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="needs" className="block text-lg font-semibold text-gray-700 mb-3">
                    نیازهای سفر شرکت و انتظارات شما
                </label>
                <Textarea
                    id="needs"
                    name="needs" // اضافه کردن name attribute
                    placeholder="نیازهای سفر شرکت خود را شرح دهید (مانند: سفرهای داخلی، خارجی، تعداد سفرهای ماهانه، خدمات مورد نیاز و ...)"
                    rows={4}
                    className="text-lg"
                />
            </div>

            <div className="flex items-start p-4 bg-blue-50 rounded-xl">
                <input
                    id="agreement"
                    name="agreement" // اضافه کردن name attribute
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 border-gray-300 rounded ml-3 mt-1"
                    required
                />
                <label htmlFor="agreement" className="text-lg text-gray-700 leading-relaxed">
                    با شرایط و قوانین استفاده از پنل سازمانی موافقم. می‌پذیرم که اطلاعات ارائه شده 
                    توسط کارشناسان ما بررسی شده و برای فعال‌سازی پنل، نیاز به انعقاد قرارداد رسمی 
                    و واریز اعتبار اولیه می‌باشد.
                </label>
            </div>

            <Button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-xl font-semibold h-16 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white ml-2"></div>
                        در حال ارسال...
                    </>
                ) : (
                    <>
                        <FileText className="ml-2 h-6 w-6" />
                        ارسال درخواست و تماس کارشناس
                    </>
                )}
            </Button>
        </form>
    )
}

export default RequestCorporateForm