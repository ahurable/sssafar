"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowRight, Plus, Trash2, Upload, ArrowLeft, Image as ImageIcon } from "lucide-react"

interface TableData {
  id: string
  title: string
  content: string
}

interface PostFormData {
  title: string
  excerpt: string
  content: string
  coverImage: string
  images: string[]
  category: string
  tags: string
  published: boolean
  featured: boolean
  readingTime: number
  seoTitle: string
  seoDescription: string
  canonicalUrl: string
}

export default function CreatePostPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [postData, setPostData] = useState<PostFormData>({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
    images: [""],
    category: "",
    tags: "",
    published: false,
    featured: false,
    readingTime: 0,
    seoTitle: "",
    seoDescription: "",
    canonicalUrl: "",
  })
  const [tables, setTables] = useState<TableData[]>([
    { id: "1", title: "", content: "" }
  ])

  const handleImageUpload = async (file: File, field: "coverImage" | "additionalImage", index?: number) => {
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (data.success) {
        if (field === "coverImage") {
          setPostData(prev => ({ ...prev, coverImage: data.url }))
        } else if (field === "additionalImage" && index !== undefined) {
          const newImages = [...postData.images]
          newImages[index] = data.url
          setPostData(prev => ({ ...prev, images: newImages }))
        }
      } else {
        alert(data.error || "خطا در آپلود تصویر")
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("خطا در آپلود تصویر")
    } finally {
      setUploading(false)
    }
  }

  const handleAddImageField = () => {
    setPostData(prev => ({
      ...prev,
      images: [...prev.images, ""]
    }))
  }

  const handleRemoveImageField = (index: number) => {
    setPostData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const handleAddTable = () => {
    setTables(prev => [
      ...prev,
      { id: Date.now().toString(), title: "", content: "" }
    ])
  }

  const handleRemoveTable = (id: string) => {
    if (tables.length > 1) {
      setTables(prev => prev.filter(table => table.id !== id))
    }
  }

  const handleTableChange = (id: string, field: keyof TableData, value: string) => {
    setTables(prev => 
      prev.map(table => 
        table.id === id ? { ...table, [field]: value } : table
      )
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...postData,
        tags: postData.tags.split(",").map(t => t.trim()).filter(t => t),
        images: postData.images.filter(img => img.trim() !== ""),
        tables: tables.filter(table => table.title.trim() !== "" && table.content.trim() !== ""),
        readingTime: Number(postData.readingTime) || 0,
      }

      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await res.json()

      if (res.ok) {
        router.push("/admin/posts")
        router.refresh()
      } else {
        alert(result.error || "خطا در ایجاد پست")
      }
    } catch (error) {
      console.error("[v0] Error creating post:", error)
      alert("خطا در ایجاد پست")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push("/admin/posts")} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            بازگشت
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-bold">ایجاد پست جدید</h1>
            <p className="text-muted-foreground">پست جدید خود را ایجاد و منتشر کنید</p>
          </div>
        </div>
        <Button type="submit" form="post-form" disabled={loading}>
          {loading ? "در حال ایجاد..." : "ایجاد پست"}
        </Button>
      </div>

      <form id="post-form" onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir="rtl">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">اطلاعات پایه</TabsTrigger>
            <TabsTrigger value="content">محتوا</TabsTrigger>
            <TabsTrigger value="media">رسانه</TabsTrigger>
            <TabsTrigger value="seo">سئو</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-6">
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="text-right">اطلاعات اصلی</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="title" className="text-right">عنوان پست *</Label>
                  <Input
                    id="title"
                    value={postData.title}
                    onChange={(e) => setPostData({ ...postData, title: e.target.value })}
                    required
                    placeholder="عنوان جذاب برای پست خود وارد کنید"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="excerpt" className="text-right">خلاصه پست *</Label>
                  <Textarea
                    id="excerpt"
                    value={postData.excerpt}
                    onChange={(e) => setPostData({ ...postData, excerpt: e.target.value })}
                    required
                    placeholder="خلاصه کوتاه از محتوای پست"
                    rows={3}
                    className="text-right"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="category" className="text-right">دسته‌بندی *</Label>
                  <Input
                    id="category"
                    value={postData.category}
                    onChange={(e) => setPostData({ ...postData, category: e.target.value })}
                    required
                    placeholder="مثلاً: برنامه‌نویسی، طراحی، مارکتینگ"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="tags" className="text-right">برچسب‌ها</Label>
                  <Input
                    id="tags"
                    value={postData.tags}
                    onChange={(e) => setPostData({ ...postData, tags: e.target.value })}
                    placeholder="برچسب‌ها را با کاما جدا کنید"
                    className="text-right"
                  />
                </div>

                <div className="flex items-center gap-6 justify-end">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="published" className="cursor-pointer">منتشر شود</Label>
                    <Checkbox
                      id="published"
                      checked={postData.published}
                      onCheckedChange={(checked) => setPostData({ ...postData, published: checked as boolean })}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Label htmlFor="featured" className="cursor-pointer">پست ویژه</Label>
                    <Checkbox
                      id="featured"
                      checked={postData.featured}
                      onCheckedChange={(checked) => setPostData({ ...postData, featured: checked as boolean })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="text-right">محتوا</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="content" className="text-right">محتوا *</Label>
                  <Textarea
                    id="content"
                    value={postData.content}
                    onChange={(e) => setPostData({ ...postData, content: e.target.value })}
                    rows={12}
                    required
                    placeholder="محتوا اصلی پست خود را اینجا بنویسید..."
                    className="text-right"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="readingTime" className="text-right">زمان مطالعه (دقیقه)</Label>
                  <Input
                    id="readingTime"
                    type="number"
                    value={postData.readingTime}
                    onChange={(e) => setPostData({ ...postData, readingTime: Number(e.target.value) })}
                    min="0"
                    className="text-right"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Tables Section */}
            <Card className="py-6">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-right">جداول اطلاعاتی</CardTitle>
                  <Button type="button" variant="outline" onClick={handleAddTable} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    افزودن جدول
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {tables.map((table, index) => (
                  <div key={table.id} className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium text-right">جدول {index + 1}</h4>
                      {tables.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveTable(table.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <Label htmlFor={`table-title-${table.id}`} className="text-right">عنوان جدول</Label>
                      <Input
                        id={`table-title-${table.id}`}
                        value={table.title}
                        onChange={(e) => handleTableChange(table.id, "title", e.target.value)}
                        placeholder="عنوان جدول"
                        className="text-right"
                      />
                    </div>
                    
                    <div className="space-y-2 text-right">
                      <Label htmlFor={`table-content-${table.id}`} className="text-right">محتوای جدول (HTML)</Label>
                      <Textarea
                        id={`table-content-${table.id}`}
                        value={table.content}
                        onChange={(e) => handleTableChange(table.id, "content", e.target.value)}
                        rows={6}
                        placeholder="کد HTML جدول خود را اینجا وارد کنید..."
                        className="text-right font-mono text-sm"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Media Tab */}
          <TabsContent value="media" className="space-y-6">
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="text-right">تصاویر</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="coverImage" className="text-right">تصویر کاور *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="coverImage"
                      value={postData.coverImage}
                      onChange={(e) => setPostData({ ...postData, coverImage: e.target.value })}
                      required
                      placeholder="آدرس تصویر یا با استفاده از دکمه آپلود کنید"
                      className="text-right"
                    />
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleImageUpload(file, "coverImage")
                        }}
                      />
                      <Button type="button" variant="outline" disabled={uploading} className="flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        {uploading ? "در حال آپلود..." : "آپلود"}
                      </Button>
                    </div>
                  </div>
                  {postData.coverImage && (
                    <div className="mt-2">
                      <img 
                        src={postData.coverImage} 
                        alt="Preview" 
                        className="h-32 object-cover rounded border mx-auto"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 text-right">
                  <div className="flex items-center justify-between">
                    <Label className="text-right">تصاویر اضافی</Label>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddImageField} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      افزودن تصویر
                    </Button>
                  </div>
                  
                  {postData.images.map((image, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          value={image}
                          onChange={(e) => {
                            const newImages = [...postData.images]
                            newImages[index] = e.target.value
                            setPostData(prev => ({ ...prev, images: newImages }))
                          }}
                          placeholder="آدرس تصویر یا با استفاده از دکمه آپلود کنید"
                          className="text-right"
                        />
                        <div className="relative">
                          <Input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) handleImageUpload(file, "additionalImage", index)
                            }}
                          />
                          <Button type="button" variant="outline" size="sm" disabled={uploading} className="flex items-center gap-2">
                            <Upload className="h-4 w-4" />
                            آپلود
                          </Button>
                        </div>
                        {postData.images.length > 1 && (
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveImageField(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                      {image && (
                        <div className="text-center">
                          <img 
                            src={image} 
                            alt={`Preview ${index + 1}`} 
                            className="h-24 object-cover rounded border mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-6">
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="text-right">تنظیمات سئو</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-right">
                  <Label htmlFor="seoTitle" className="text-right">عنوان سئو</Label>
                  <Input
                    id="seoTitle"
                    value={postData.seoTitle}
                    onChange={(e) => setPostData({ ...postData, seoTitle: e.target.value })}
                    placeholder="عنوان برای سئو (اختیاری)"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="seoDescription" className="text-right">توضیحات سئو</Label>
                  <Textarea
                    id="seoDescription"
                    value={postData.seoDescription}
                    onChange={(e) => setPostData({ ...postData, seoDescription: e.target.value })}
                    rows={3}
                    placeholder="توضیحات متا برای سئو (اختیاری)"
                    className="text-right"
                  />
                </div>

                <div className="space-y-2 text-right">
                  <Label htmlFor="canonicalUrl" className="text-right">آدرس کانونیکال</Label>
                  <Input
                    id="canonicalUrl"
                    type="url"
                    value={postData.canonicalUrl}
                    onChange={(e) => setPostData({ ...postData, canonicalUrl: e.target.value })}
                    placeholder="https://example.com/canonical-url"
                    className="text-right"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  )
}