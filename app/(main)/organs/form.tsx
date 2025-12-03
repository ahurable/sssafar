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

        const formDataObject: any = {}
        for (let [key, value] of formData.entries()) {
            formDataObject[key] = value
        }

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
                e.currentTarget.reset()
            } else {
                error(result.error || 'خطایی در ارسال فرم رخ داده است.')
            }
        } catch (err) {
            error('خطای شبکه. لطفا مجددا تلاش کنید.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                        نام کامل شرکت <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="companyName"
                        name="companyName"
                        type="text"
                        placeholder="نام کامل شرکت به فارسی"
                        className="h-11"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="companyType" className="block text-sm font-medium text-gray-700 mb-2">
                        نوع فعالیت شرکت <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="companyType"
                        name="companyType"
                        type="text"
                        placeholder="مانند: بازرگانی، تولیدی، خدماتی"
                        className="h-11"
                        required
                    />
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        ایمیل رسمی شرکت <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="email@company.com"
                        className="h-11"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        تلفن تماس شرکت <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="شماره تلفن ثابت شرکت"
                        className="h-11"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    آدرس کامل شرکت <span className="text-red-500">*</span>
                </label>
                <Textarea
                    id="address"
                    name="address"
                    placeholder="آدرس کامل شرکت به همراه کد پستی"
                    rows={3}
                    className="bg-white"
                    required
                />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                        شخص رابط <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="contactPerson"
                        name="contactPerson"
                        type="text"
                        placeholder="نام و نام خانوادگی شخص رابط"
                        className="h-11"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="employeeCount" className="block text-sm font-medium text-gray-700 mb-2">
                        تعداد کارکنان <span className="text-red-500">*</span>
                    </label>
                    <Input
                        id="employeeCount"
                        name="employeeCount"
                        type="number"
                        placeholder="تعداد تقریبی کارکنان"
                        min="1"
                        className="h-11"
                        required
                    />
                </div>
            </div>

            <div>
                <label htmlFor="needs" className="block text-sm font-medium text-gray-700 mb-2">
                    نیازهای سفر شرکت
                </label>
                <Textarea
                    id="needs"
                    name="needs"
                    placeholder="نیازهای سفر شرکت خود را شرح دهید"
                    rows={3}
                    className="bg-white"
                />
            </div>

            <div className="flex items-start p-3 bg-gray-50 rounded-lg border border-blue-900">
                <input
                    id="agreement"
                    name="agreement"
                    type="checkbox"
                    className="h-4 w-4 text-blue-900 border-blue-900 rounded ml-2 mt-1"
                    required
                />
                <label htmlFor="agreement" className="text-sm text-gray-700 leading-relaxed">
                    با شرایط و قوانین استفاده از پنل سازمانی موافقم. می‌پذیرم که اطلاعات ارائه شده
                    توسط کارشناسان ما بررسی شده و برای فعال‌سازی پنل، نیاز به انعقاد قرارداد رسمی می‌باشد.
                </label>
            </div>

            <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-900 hover:bg-blue-800 text-white py-3 font-medium h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isSubmitting ? (
                    <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                        در حال ارسال...
                    </>
                ) : (
                    <>
                        <FileText className="ml-2 h-4 w-4" />
                        ارسال درخواست
                    </>
                )}
            </Button>
        </form>
    )
}

export default RequestCorporateForm