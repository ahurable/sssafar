"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Upload, Save, ArrowRight, FileText, Download, Trash2 } from "lucide-react"

interface File {
  id: string
  filename: string
  mimetype: string
  size: number
  path: string
  createdAt: string
}

interface Contract {
  id: string
  title: string
  description?: string
  organizationName: string
  status: "DRAFT" | "ACTIVE" | "CLOSED"
  files: File[]
  closeReason?: string
  createdAt: string
  updatedAt: string
  userId: string
}

export default function EditContractPage() {
  const params = useParams()
  const router = useRouter()
  const [contract, setContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    organizationName: "",
    status: "DRAFT" as "DRAFT" | "ACTIVE" | "CLOSED",
    closeReason: ""
  })

  useEffect(() => {
    if (params.id) {
      fetchContract()
    }
  }, [params.id])

  const fetchContract = async () => {
    try {
      const res = await fetch(`/api/admin/contracts/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setContract(data.contract)
        setFormData({
          title: data.contract.title,
          description: data.contract.description || "",
          organizationName: data.contract.organizationName,
          status: data.contract.status,
          closeReason: data.contract.closeReason || ""
        })
      } else {
        console.error("Failed to fetch contract")
      }
    } catch (error) {
      console.error("Error fetching contract:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!contract) return
    
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/contracts/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const result = await res.json()
        setContract(result.contract)
        alert("تغییرات با موفقیت ذخیره شد")
      } else {
        throw new Error("Failed to update contract")
      }
    } catch (error) {
      console.error("Error updating contract:", error)
      alert("خطا در ذخیره تغییرات")
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0 || !contract) return

    setUploading(true)
    const formData = new FormData()
    
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i])
    }

    try {
      const res = await fetch(`/api/admin/contracts/${params.id}/files`, {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        const result = await res.json()
        // Update contract with new files
        setContract(prev => prev ? {
          ...prev,
          files: [...prev.files, ...result.files]
        } : null)
        e.target.value = "" // Reset file input
        alert("فایل‌ها با موفقیت آپلود شدند")
      } else {
        throw new Error("Failed to upload files")
      }
    } catch (error) {
      console.error("Error uploading files:", error)
      alert("خطا در آپلود فایل‌ها")
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (fileId: string, filename: string) => {
    if (!confirm(`آیا از حذف فایل "${filename}" اطمینان دارید؟`)) return

    try {
      const res = await fetch(`/api/contracts/${params.id}/files`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fileId }),
      })

      if (res.ok) {
        // Remove file from local state
        setContract(prev => prev ? {
          ...prev,
          files: prev.files.filter(file => file.id !== fileId)
        } : null)
        alert("فایل با موفقیت حذف شد")
      } else {
        throw new Error("Failed to delete file")
      }
    } catch (error) {
      console.error("Error deleting file:", error)
      alert("خطا در حذف فایل")
    }
  }

  const handleDownloadFile = async (file: File) => {
    try {
      // Extract filename from path
      const filename = file.path.split('/').pop() || file.filename
      const res = await fetch(`/api/files/${filename}`)
      
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = file.filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        throw new Error("Failed to download file")
      }
    } catch (error) {
      console.error("Error downloading file:", error)
      alert("خطا در دانلود فایل")
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: "پیش‌نویس", variant: "secondary" as const },
      ACTIVE: { label: "فعال", variant: "default" as const },
      CLOSED: { label: "بسته شده", variant: "destructive" as const }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>
  }

  if (!contract) {
    return <div className="text-center py-8">قرارداد یافت نشد</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">ویرایش قرارداد</h1>
          {getStatusBadge(contract.status)}
        </div>
        <Button onClick={() => router.push("/contracts")}>
          <ArrowRight className="h-4 w-4 ml-2" />
          بازگشت به لیست
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contract Details */}
        <Card>
          <CardHeader>
            <CardTitle>مشخصات قرارداد</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">عنوان قرارداد</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="organizationName">سازمان طرف قرارداد</Label>
              <Input
                id="organizationName"
                value={formData.organizationName}
                onChange={(e) => setFormData(prev => ({ ...prev, organizationName: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.status === "ACTIVE"}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ 
                    ...prev, 
                    status: checked ? "ACTIVE" : "DRAFT" 
                  }))
                }
              />
              <Label>قرارداد فعال</Label>
            </div>

            {formData.status === "CLOSED" && (
              <div>
                <Label htmlFor="closeReason">دلیل بستن قرارداد</Label>
                <Textarea
                  id="closeReason"
                  value={formData.closeReason}
                  onChange={(e) => setFormData(prev => ({ ...prev, closeReason: e.target.value }))}
                  rows={3}
                  placeholder="علت بستن قرارداد را وارد کنید..."
                />
              </div>
            )}

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="h-4 w-4 ml-2" />
              {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
            </Button>

            <Button 
              variant={formData.status === "CLOSED" ? "default" : "destructive"}
              onClick={() => setFormData(prev => ({ 
                ...prev, 
                status: prev.status === "CLOSED" ? "DRAFT" : "CLOSED" 
              }))}
              className="w-full"
            >
              {formData.status === "CLOSED" ? "بازگشت از حالت بسته" : "بستن قرارداد"}
            </Button>
          </CardContent>
        </Card>

        {/* File Management */}
        <Card>
          <CardHeader>
            <CardTitle>مدیریت فایل‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="file-upload">آپلود فایل‌های قرارداد (PDF, Images, Documents)</Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                onChange={handleFileUpload}
                disabled={uploading}
                className="mt-2"
              />
              {uploading && <p className="text-sm text-muted-foreground mt-2">در حال آپلود...</p>}
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">فایل‌های آپلود شده:</h3>
              {contract.files.length === 0 ? (
                <p className="text-sm text-muted-foreground">هیچ فایلی آپلود نشده است</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {contract.files.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{file.filename}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatFileSize(file.size)} • {new Date(file.createdAt).toLocaleDateString('fa-IR')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadFile(file)}
                          title="دانلود فایل"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteFile(file.id, file.filename)}
                          title="حذف فایل"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}