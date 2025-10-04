"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface CreatePanelDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreatePanelDialog({ open, onOpenChange, onSuccess }: CreatePanelDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    isActive: true,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch("/api/panels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess()
        onOpenChange(false)
        setFormData({
          name: "",
          description: "",
          slug: "",
          isActive: true,
        })
      } else {
        const error = await res.json()
        console.error("[v0] Error creating panel:", error)
        alert("خطا در ایجاد پنل: " + (error.message || "خطای ناشناخته"))
      }
    } catch (error) {
      console.error("[v0] Error creating panel:", error)
      alert("خطا در ایجاد پنل")
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\u0600-\u06FF]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: generateSlug(name)
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ایجاد پنل جدید</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">نام پنل</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={handleNameChange}
              required
              placeholder="نام نمایشی پنل"
            />
          </div>

          <div>
            <Label htmlFor="slug">شناسه پنل (Slug)</Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              required
              placeholder="شناسه یکتا برای پنل"
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground mt-1">
              این شناسه در آدرس پنل استفاده می‌شود و باید یکتا باشد
            </p>
          </div>

          <div>
            <Label htmlFor="description">توضیحات</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="توضیحات مربوط به پنل"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
            />
            <Label htmlFor="isActive">پنل فعال باشد</Label>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              لغو
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "در حال ایجاد..." : "ایجاد پنل"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}