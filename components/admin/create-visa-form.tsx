// components/admin/create-visa-form.tsx
"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Trash2, ArrowRight, Upload, X, Image as ImageIcon } from "lucide-react"
import { toast } from "sonner"


interface PriceTable {
  id: string
  title: string
  columns: string[]
  rows: PriceTableRow[]
}

interface PriceTableRow {
  id: string
  label: string
  values: string[]
}

export function CreateVisaForm() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image: "",
    country: "",
    city: "",
    price: "",
    currency: "ریال",
    processingTime: "",
    validity: "",
    entryType: "تک ورود",
    features: [""],
    requirements: [""],
    documents: [""],
    priority: "0",
    priceTables: [] as PriceTable[],
    published: false,
    featured: false
  })

  const countries = [
    "امارات متحده عربی", "ترکیه", "تایلند", "مالزی", "ارمنستان", "گرجستان",
    "روسیه", "چین", "هند", "کانادا", "انگلیس", "فرانسه", "آلمان", "ایتالیا", "اسپانیا"
  ]

  const entryTypes = [
    "تک ورود", "دوبار ورود", "چندبار ورود", "ترانزیت"
  ]

  const handleImageUpload = async (file: File) => {
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/visa/upload/image", {
        method: "POST",
        body: formData,
      })

      const result = await response.json()

      if (response.ok) {
        setFormData(prev => ({ ...prev, image: result.url }))
        setImagePreview(result.url)
        toast.success("تصویر با موفقیت آپلود شد")
      } else {
        toast.error(result.error || "خطا در آپلود تصویر")
      }
    } catch (error) {
      console.error("Upload error:", error)
      toast.error("خطا در آپلود تصویر")
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const previewUrl = URL.createObjectURL(file)
      setImagePreview(previewUrl)
      handleImageUpload(file)
    }
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: "" }))
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.country || !formData.city) {
      toast.error("لطفا کشور و شهر را وارد کنید")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/visa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description || undefined,
          image: formData.image || undefined,
          country: formData.country,
          city: formData.city,
          price: formData.price ? parseFloat(formData.price) : undefined,
          currency: formData.currency,
          processingTime: formData.processingTime || undefined,
          validity: formData.validity || undefined,
          entryType: formData.entryType,
          features: formData.features.filter(f => f.trim()),
          requirements: formData.requirements.filter(f => f.trim()),
          documents: formData.documents.filter(f => f.trim()),
          priority: parseInt(formData.priority),
          published: formData.published,
          featured: formData.featured,
        }),
      })

      const result = await response.json()

      if (response.ok) {
        toast.success("خدمت ویزا با موفقیت ایجاد شد")
        router.push("/admin/visa")
        router.refresh()
      } else {
        toast.error(result.error || "خطا در ایجاد خدمت ویزا")
      }
    } catch (error) {
      console.error("Error creating visa service:", error)
      toast.error("خطا در ایجاد خدمت ویزا")
    } finally {
      setLoading(false)
    }
  }

  const addItem = (field: "features" | "requirements" | "documents") => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ""]
    }))
  }

  const removeItem = (field: "features" | "requirements" | "documents", index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const updateItem = (field: "features" | "requirements" | "documents", index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((f, i) => i === index ? value : f)
    }))
  }

  // Add these helper functions to the CreateVisaForm component

  const addPriceTable = () => {
    const newTable: PriceTable = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'جدول قیمتی جدید',
      columns: ['14 روزه', '1 ماهه'],
      rows: [
        {
          id: Math.random().toString(36).substr(2, 9),
          label: 'عادی',
          values: ['', '']
        }
      ]
    }

    setFormData(prev => ({
      ...prev,
      priceTables: [...prev.priceTables, newTable]
    }))
  }

  const removePriceTable = (tableIndex: number) => {
    setFormData(prev => ({
      ...prev,
      priceTables: prev.priceTables.filter((_, i) => i !== tableIndex)
    }))
  }

  const updatePriceTableTitle = (tableIndex: number, title: string) => {
    setFormData(prev => ({
      ...prev,
      priceTables: prev.priceTables.map((table, i) =>
        i === tableIndex ? { ...table, title } : table
      )
    }))
  }

  const addPriceTableColumn = (tableIndex: number) => {
    setFormData(prev => ({
      ...prev,
      priceTables: prev.priceTables.map((table, i) =>
        i === tableIndex ? {
          ...table,
          columns: [...table.columns, 'دوره جدید'],
          rows: table.rows.map(row => ({
            ...row,
            values: [...row.values, '']
          }))
        } : table
      )
    }))
  }

  const removePriceTableColumn = (tableIndex: number, columnIndex: number) => {
    setFormData(prev => ({
      ...prev,
      priceTables: prev.priceTables.map((table, i) =>
        i === tableIndex ? {
          ...table,
          columns: table.columns.filter((_, j) => j !== columnIndex),
          rows: table.rows.map(row => ({
            ...row,
            values: row.values.filter((_, j) => j !== columnIndex)
          }))
        } : table
      )
    }))
  }

  const updatePriceTableColumn = (tableIndex: number, columnIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      priceTables: prev.priceTables.map((table, i) =>
        i === tableIndex ? {
          ...table,
          columns: table.columns.map((col, j) => j === columnIndex ? value : col)
        } : table
      )
    }))
  }

  const addPriceTableRow = (tableIndex: number) => {
    const newRow: PriceTableRow = {
      id: Math.random().toString(36).substr(2, 9),
      label: 'نوع جدید',
      values: Array(formData.priceTables[tableIndex].columns.length).fill('')
    }

    setFormData(prev => ({
      ...prev,
      priceTables: prev.priceTables.map((table, i) =>
        i === tableIndex ? {
          ...table,
          rows: [...table.rows, newRow]
        } : table
      )
    }))
  }

  const removePriceTableRow = (tableIndex: number, rowIndex: number) => {
    setFormData(prev => ({
      ...prev,
      priceTables: prev.priceTables.map((table, i) =>
        i === tableIndex ? {
          ...table,
          rows: table.rows.filter((_, j) => j !== rowIndex)
        } : table
      )
    }))
  }

  const updatePriceTableRowLabel = (tableIndex: number, rowIndex: number, label: string) => {
    setFormData(prev => ({
      ...prev,
      priceTables: prev.priceTables.map((table, i) =>
        i === tableIndex ? {
          ...table,
          rows: table.rows.map((row, j) =>
            j === rowIndex ? { ...row, label } : row
          )
        } : table
      )
    }))
  }

  const updatePriceTableRowValue = (tableIndex: number, rowIndex: number, valueIndex: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      priceTables: prev.priceTables.map((table, i) =>
        i === tableIndex ? {
          ...table,
          rows: table.rows.map((row, j) =>
            j === rowIndex ? {
              ...row,
              values: row.values.map((val, k) => k === valueIndex ? value : val)
            } : row
          )
        } : table
      )
    }))
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* اطلاعات اصلی */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>اطلاعات اصلی ویزا</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">عنوان خدمت ویزا *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  placeholder="مثلا: ویزای توریستی دبی"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">کشور مقصد *</Label>
                <Select value={formData.country} onValueChange={(value) => setFormData(prev => ({ ...prev, country: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="انتخاب کشور" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country} value={country}>
                        {country}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">شهر *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                  placeholder="مثلا: دبی"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="entryType">نوع ورود</Label>
                <Select value={formData.entryType} onValueChange={(value) => setFormData(prev => ({ ...prev, entryType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {entryTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات کوتاه</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                placeholder="توضیح مختصر درباره ویزا..."
              />
            </div>

            {/* Image Upload Section */}
            <div className="space-y-4">
              <Label>تصویر ویزا</Label>

              {imagePreview ? (
                <div className="relative inline-block">
                  <div className="w-64 h-48 rounded-lg border-2 border-dashed border-blue-900 overflow-hidden">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={removeImage}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label
                    htmlFor="image-upload"
                    className={`flex flex-col items-center justify-center w-64 h-32 border-2 border-dashed border-blue-900 rounded-lg cursor-pointer hover:border-gray-400 transition-colors ${uploading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                  >
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      {uploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-1 text-sm text-gray-500">
                            <span className="font-semibold">کلیک کنید برای آپلود</span>
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, GIF (حداکثر ۵MB)</p>
                        </>
                      )}
                    </div>
                    <input
                      id="image-upload"
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileChange}
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="image-url">یا آدرس تصویر</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, image: e.target.value }))
                      setImagePreview(e.target.value)
                    }}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.image && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setImagePreview(formData.image)
                        toast.success("تصویر از آدرس بارگذاری شد")
                      }}
                    >
                      <ImageIcon className="h-4 w-4 ml-1" />
                      بارگذاری
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جزئیات ویزا */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>جزئیات ویزا</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">قیمت (ریال)</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="1000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="processingTime">زمان پردازش</Label>
                <Input
                  id="processingTime"
                  value={formData.processingTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, processingTime: e.target.value }))}
                  placeholder="5 تا 7 روز کاری"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validity">مدت اعتبار</Label>
                <Input
                  id="validity"
                  value={formData.validity}
                  onChange={(e) => setFormData(prev => ({ ...prev, validity: e.target.value }))}
                  placeholder="3 ماه"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">واحد پول</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ریال">ریال</SelectItem>
                    <SelectItem value="تومان">تومان</SelectItem>
                    <SelectItem value="دلار">دلار</SelectItem>
                    <SelectItem value="یورو">یورو</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">اولویت نمایش</Label>
                <Input
                  id="priority"
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                  min="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ویژگی‌ها */}
        <Card className="py-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>ویژگی‌های ویزا</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addItem("features")}
              >
                <Plus className="h-4 w-4 ml-1" />
                افزودن ویژگی
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={feature}
                    onChange={(e) => updateItem("features", index, e.target.value)}
                    placeholder="ویژگی ویزا (مثلا: امکان تمدید)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem("features", index)}
                    disabled={formData.features.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* مدارک مورد نیاز */}
        <Card className="py-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>مدارک مورد نیاز</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addItem("documents")}
              >
                <Plus className="h-4 w-4 ml-1" />
                افزودن مدرک
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.documents.map((document, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={document}
                    onChange={(e) => updateItem("documents", index, e.target.value)}
                    placeholder="مدرک مورد نیاز (مثلا: گذرنامه معتبر)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem("documents", index)}
                    disabled={formData.documents.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* شرایط و ضوابط */}
        <Card className="py-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>شرایط و ضوابط</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addItem("requirements")}
              >
                <Plus className="h-4 w-4 ml-1" />
                افزودن شرط
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => updateItem("requirements", index, e.target.value)}
                    placeholder="شرط مورد نیاز (مثلا: حداقل 6 ماه اعتبار گذرنامه)"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem("requirements", index)}
                    disabled={formData.requirements.length === 1}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* تنظیمات */}
        <Card className="py-6">
          <CardHeader>
            <CardTitle>تنظیمات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="published" className="text-base">خدمت فعال</Label>
                  <p className="text-sm text-muted-foreground">
                    نمایش این خدمت در سایت برای کاربران
                  </p>
                </div>
                <Switch
                  id="published"
                  checked={formData.published}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, published: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="featured" className="text-base">خدمت ویژه</Label>
                  <p className="text-sm text-muted-foreground">
                    نشان دادن این خدمت به عنوان خدمت ویژه
                  </p>
                </div>
                <Switch
                  id="featured"
                  checked={formData.featured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="py-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>جدول‌های قیمت</CardTitle>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addPriceTable}
              >
                <Plus className="h-4 w-4 ml-1" />
                افزودن جدول قیمت
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {formData.priceTables.map((table, tableIndex) => (
                <div key={table.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <Label>عنوان جدول</Label>
                      <Input
                        value={table.title}
                        onChange={(e) => updatePriceTableTitle(tableIndex, e.target.value)}
                        placeholder="مثلا: جدول قیمتی بزرگسال"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePriceTable(tableIndex)}
                      className="mr-2"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Columns */}
                  <div className="mb-4">
                    <Label>ستون‌ها (دوره‌های زمانی)</Label>
                    <div className="flex gap-2 mt-1">
                      {table.columns.map((column, columnIndex) => (
                        <div key={columnIndex} className="flex gap-1">
                          <Input
                            value={column}
                            onChange={(e) => updatePriceTableColumn(tableIndex, columnIndex, e.target.value)}
                            placeholder="مثلا: 14 روزه"
                            className="w-32"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removePriceTableColumn(tableIndex, columnIndex)}
                            disabled={table.columns.length <= 1}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => addPriceTableColumn(tableIndex)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Rows */}
                  <div className="space-y-2">
                    <Label>ردیف‌ها (انواع ویزا)</Label>
                    {table.rows.map((row, rowIndex) => (
                      <div key={row.id} className="flex items-center gap-2">
                        <Input
                          value={row.label}
                          onChange={(e) => updatePriceTableRowLabel(tableIndex, rowIndex, e.target.value)}
                          placeholder="مثلا: عادی"
                          className="w-32"
                        />
                        <div className="flex gap-1 flex-1">
                          {row.values.map((value, valueIndex) => (
                            <Input
                              key={valueIndex}
                              value={value}
                              onChange={(e) => updatePriceTableRowValue(tableIndex, rowIndex, valueIndex, e.target.value)}
                              placeholder="قیمت"
                              className="w-24"
                            />
                          ))}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removePriceTableRow(tableIndex, rowIndex)}
                          disabled={table.rows.length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addPriceTableRow(tableIndex)}
                    >
                      <Plus className="h-4 w-4 ml-1" />
                      افزودن ردیف
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* دکمه‌های اقدام */}
        <div className="flex gap-4 justify-end pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/visa")}
          >
            انصراف
          </Button>
          <Button type="submit" disabled={loading || uploading} className="min-w-32">
            {loading ? (
              "در حال ایجاد..."
            ) : (
              <>
                ایجاد خدمت ویزا
                <ArrowRight className="h-4 w-4 mr-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}