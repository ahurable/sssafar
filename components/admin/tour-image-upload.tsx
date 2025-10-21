// components/admin/tour-image-upload.tsx
"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Image, Upload, X, Star, StarOff } from "lucide-react"
import { toast } from "sonner"

interface TourImage {
  id: string
  filename: string
  path: string
  altText?: string
  isPrimary: boolean
  order: number
}

interface TourImageUploadProps {
  tourId: string
  images: TourImage[]
  onImagesChange: (images: TourImage[]) => void
}

export function TourImageUpload({ tourId, images, onImagesChange }: TourImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('images', file)
        formData.append('altText', '') // Default empty alt text
      })

      const response = await fetch(`/api/admin/tours/${tourId}/images`, {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        onImagesChange([...images, ...data.images])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        toast.success("تصاویر با موفقیت آپلود شدند")
      } else {
        toast.error(data.error || 'خطا در آپلود تصاویر')
      }
    } catch (error) {
      console.error('Error uploading images:', error)
      toast.error('خطا در آپلود تصاویر')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm("آیا از حذف این تصویر اطمینان دارید؟")) return

    try {
      const response = await fetch(`/api/admin/tours/${tourId}/images/${imageId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        onImagesChange(images.filter(img => img.id !== imageId))
        toast.success("تصویر با موفقیت حذف شد")
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطا در حذف تصویر')
      }
    } catch (error) {
      console.error('Error deleting image:', error)
      toast.error('خطا در حذف تصویر')
    }
  }

  const handleSetPrimary = async (imageId: string) => {
    try {
      const response = await fetch(`/api/admin/tours/${tourId}/images/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPrimary: true })
      })

      if (response.ok) {
        const updatedImages = images.map(img => ({
          ...img,
          isPrimary: img.id === imageId
        }))
        onImagesChange(updatedImages)
        toast.success("تصویر اصلی تنظیم شد")
      } else {
        const data = await response.json()
        toast.error(data.error || 'خطا در تنظیم تصویر اصلی')
      }
    } catch (error) {
      console.error('Error setting primary image:', error)
      toast.error('خطا در تنظیم تصویر اصلی')
    }
  }

  const handleUpdateAltText = async (imageId: string, altText: string) => {
    try {
      const response = await fetch(`/api/admin/tours/${tourId}/images/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ altText })
      })

      if (response.ok) {
        const updatedImages = images.map(img =>
          img.id === imageId ? { ...img, altText } : img
        )
        onImagesChange(updatedImages)
      }
    } catch (error) {
      console.error('Error updating alt text:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>مدیریت تصاویر تور</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            id="tour-images"
          />
          <Label htmlFor="tour-images" className="cursor-pointer">
            <div className="flex flex-col items-center gap-2">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">آپلود تصاویر تور</p>
                <p className="text-sm text-muted-foreground">
                  PNG, JPG, JPEG تا ۵MB
                </p>
              </div>
              <Button type="button" variant="outline" disabled={uploading}>
                {uploading ? "در حال آپلود..." : "انتخاب تصاویر"}
              </Button>
            </div>
          </Label>
        </div>

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div key={image.id} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden border bg-gray-100">
                  <img
                    src={image.path}
                    alt={image.altText || image.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                
                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="sm"
                    variant={image.isPrimary ? "default" : "outline"}
                    onClick={() => handleSetPrimary(image.id)}
                    className="text-white border-white hover:bg-white hover:text-black"
                  >
                    {image.isPrimary ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteImage(image.id)}
                    className="text-white border-white hover:bg-red-600 hover:border-red-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-2 left-2">
                    <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      اصلی
                    </div>
                  </div>
                )}

                {/* Alt Text Input */}
                <div className="mt-2">
                  <Input
                    placeholder="متن جایگزین تصویر"
                    value={image.altText || ''}
                    onChange={(e) => handleUpdateAltText(image.id, e.target.value)}
                    className="text-xs h-8"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {images.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Image className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>هنوز تصویری آپلود نکرده‌اید</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}