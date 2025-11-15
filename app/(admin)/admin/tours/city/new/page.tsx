import { CreateTourCityForm } from "@/components/admin/create-tour-city-form"

export default function CreateTourCityPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">ایجاد شهر تور جدید</h1>
        <p className="text-muted-foreground mt-2">
          شهرهای تور را ایجاد کنید تا در هنگام ساخت تور جدید از آنها استفاده کنید
        </p>
      </div>
      
      <CreateTourCityForm />
    </div>
  )
}