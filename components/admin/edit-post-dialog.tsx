"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface Post {
  id: string
  title: string
  excerpt: string
  category: string
  published: boolean
  featured: boolean
}

interface EditPostDialogProps {
  post: Post
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPostDialog({ post, open, onOpenChange, onSuccess }: EditPostDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: post.title,
    excerpt: post.excerpt,
    category: post.category,
    published: post.published,
    featured: post.featured,
  })

  useEffect(() => {
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      published: post.published,
      featured: post.featured,
    })
  }, [post])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess()
        onOpenChange(false)
      }
    } catch (error) {
      console.error("[v0] Error updating post:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>ویرایش پست</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="excerpt">خلاصه</Label>
            <Textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">دسته‌بندی</Label>
            <Input
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox
                id="published"
                checked={formData.published}
                onCheckedChange={(checked) => setFormData({ ...formData, published: checked as boolean })}
              />
              <Label htmlFor="published">منتشر شود</Label>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="featured"
                checked={formData.featured}
                onCheckedChange={(checked) => setFormData({ ...formData, featured: checked as boolean })}
              />
              <Label htmlFor="featured">پست ویژه</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              لغو
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "در حال به‌روزرسانی..." : "به‌روزرسانی"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
