"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { UserType } from "@/lib/types"
import { useSnack } from "@/hooks/use-notification"

interface Panel {
  id: string
  name: string
  description: string | null
  slug: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface EditPanelDialogProps {
  panel: Panel
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditPanelDialog({ panel, open, onOpenChange, onSuccess }: EditPanelDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    isActive: true,
  })
  const [users, setUsers] = useState<UserType[] | null>() 
  const [candidate, setCandidate] = useState<UserType | null>()
  const [ foundedUsers, setFoundedUsers ] = useState<UserType[] | null>()
  const { success , error } = useSnack()

  useEffect(() => {
    const getUsers = async () => {
        const res = await fetch(
            '/api/admin/users'
        )
        const { users, total } = await res.json()
        setUsers(users)
    }
    const getPanelUsers = async () => {
        const res = await fetch(
            `/api/panels/${panel.id}`
        )
        const data = await res.json()
        // console.log(data)
    }
    getPanelUsers()
    getUsers()
    if (panel) {
      setFormData({
        name: panel.name || "",
        description: panel.description || "",
        slug: panel.slug || "",
        isActive: panel.isActive,
      })
    }
  }, [panel])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/panels/${panel.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        onSuccess()
        onOpenChange(false)
      } else {
        const error = await res.json()
        console.error("[v0] Error updating panel:", error)
        alert("خطا در بروزرسانی پنل: " + (error.message || "خطای ناشناخته"))
      }
    } catch (error) {
      console.error("[v0] Error updating panel:", error)
      alert("خطا در بروزرسانی پنل")
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

  const handleUserSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFoundedUsers(users?.filter( user => user.email?.toLowerCase().includes(value)))
    // console.log(foundedUsers)
  }

  const handleSelectAdmin = async () => {
    // console.log(candidate)
    if(candidate) {
        const res = await fetch( 
            `/api/panels/${panel.id}`,
            {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(candidate)
            }
        )
        if (res.ok) {
            success("با موفقیت کاربر به عنوان مدیر انتخاب شد")
        } else {
            error("مشکلی در انتخاب کاربر به عنوان مدیر پیش آمد")
        }
    } else {
        error("ابتدا کاندیدای مدیریت را انتخاب کنید")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ویرایش پنل</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">نام پنل</Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={handleNameChange}
              required
              placeholder="نام نمایشی پنل"
            />
          </div>

          <div>
            <Label htmlFor="edit-slug">شناسه پنل (Slug)</Label>
            <Input
              id="edit-slug"
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
            <Label htmlFor="edit-description">توضیحات</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              placeholder="توضیحات مربوط به پنل"
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="edit-isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked as boolean })}
            />
            <Label htmlFor="edit-isActive">پنل فعال باشد</Label>
          </div>


          <div className="text-xs text-muted-foreground space-y-1">
            <div>تاریخ ایجاد: {new Date(panel.createdAt).toLocaleDateString('fa-IR')}</div>
            <div>آخرین بروزرسانی: {new Date(panel.updatedAt).toLocaleDateString('fa-IR')}</div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              لغو
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "در حال بروزرسانی..." : "بروزرسانی پنل"}
            </Button>
          </div>
        </form>
        <hr />
          <div>
            <span className="text-xl py-4 block">انتخاب مدیر</span>
            <div>
                <Label htmlFor="edit-description">جستجوی کاربر</Label>
                <Input
                id="edit-description"
                onChange={handleUserSearch}
                placeholder="شماره یا ایمیل کاربر را وارد کنید"
                />
            </div>
            <div>
                {
                    foundedUsers ?
                        foundedUsers?.map(user => [
                        <div key={user.id} className={candidate && candidate.id == user.id && "w-full text-white bg-black p-4" || "w-full rounded border p-4"} onClick={( ) => setCandidate(user)}>
                            { user.firstName && user.lastName && user.firstName + " " + user.lastName || user.email && user.email || user.phone && user.phone }
                        </div>
                    ])
                    :
                    users?.map(user => [
                        <div key={user.id} className={candidate && candidate.id == user.id && "w-full text-white bg-black p-4" || "w-full rounded border p-4"} onClick={( ) => setCandidate(user)}>
                            { user.firstName && user.lastName && user.firstName + " " + user.lastName || user.email && user.email || user.phone && user.phone }
                        </div>
                    ])
                }
                <div className="mt-4">
                {
                    candidate ? 
                    
                    <Button type="submit" disabled={loading} onClick={handleSelectAdmin}>
                    {loading ? "در حال بروزرسانی..." : "افزودن مدیر"}
                    </Button>
                    :
                    
                    <Button type="submit" disabled={true} onClick={handleSelectAdmin}>
                    {loading ? "در حال بروزرسانی..." : "افزودن مدیر"}
                    </Button>
                }
                </div>
            </div>
            
          </div>
      </DialogContent>
    </Dialog>
  )
}