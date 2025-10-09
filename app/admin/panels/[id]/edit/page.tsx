// app/panels/[id]/edit/page.tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { UserType } from "@/lib/types"
import { useSnack } from "@/hooks/use-notification"
import { ArrowLeft, Save, Users, UserPlus, File } from "lucide-react"

interface Panel {
  id: string
  name: string
  description: string | null
  slug: string
  isActive: boolean
  adminId?: string
  contract?: {
    id: string
  }
  user?: {
    id: string
  }
  panelUser?: {
    userId: string
  }[]
  createdAt: string
  updatedAt: string
}

interface Contract {
    id: string
    title: string
    organizationName: string
    description?: string
}

export default function EditPanelPage() {
  const params = useParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [panel, setPanel] = useState<Panel | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    slug: "",
    isActive: true,
  })
  const [users, setUsers] = useState<UserType[] | null>(null)
  const [candidate, setCandidate] = useState<UserType | null>(null)
  const [foundedUsers, setFoundedUsers] = useState<UserType[] | null>(null)
  const [contracts, setContracts] = useState<Contract[] | null>(null)
  const [foundedContracts, setFoundedContracts] = useState<Contract[] | null>(null)
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null)
  const { success, error } = useSnack()
  
  useEffect(() => {
    if (params.id) {
      fetchPanel()
      fetchUsers()
      fetchContracts()
    }
  }, [params.id])

  const fetchPanel = async () => {
    try {
      const res = await fetch(`/api/panels/${params.id}`)
      if (res.ok) {
        const data = await res.json()
        setPanel(data.panel)
        setFormData({
          name: data.panel.name || "",
          description: data.panel.description || "",
          slug: data.panel.slug || "",
          isActive: data.panel.isActive,
        })
      }
    } catch (err) {
      console.error("Error fetching panel:", err)
      error("خطا در دریافت اطلاعات پنل")
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const { users } = await res.json()
      setUsers(users)
    } catch (err) {
      console.error("Error fetching users:", err)
      error("خطا در دریافت لیست کاربران")
    }
  }

  const fetchContracts = async () => {
    try {
        const res = await fetch('/api/admin/contracts')
        const data = await res.json()
        if (!res.ok) {
            error("خطا در برقراری ارتباط با سرور")
        }
        console.log(data)
        setContracts(data.contracts)
    } catch (err) {
        console.error("Error fetching contracts", err)
        error("خطا در دریاقت لیست قرارداد ها")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch(`/api/panels/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        success("پنل با موفقیت بروزرسانی شد")
        router.push("/panels")
      } else {
        const errorData = await res.json()
        error("خطا در بروزرسانی پنل: " + (errorData.message || "خطای ناشناخته"))
      }
    } catch (err) {
      console.error("Error updating panel:", err)
      error("خطا در بروزرسانی پنل")
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
    const value = e.target.value.toLowerCase()
    if (users) {
      const filtered = users.filter(user => 
        user.email?.toLowerCase().includes(value) ||
        user.phone?.includes(value) ||
        user.firstName?.toLowerCase().includes(value) ||
        user.lastName?.toLowerCase().includes(value)
      )
      setFoundedUsers(filtered)
    }
  }

  const handleContractSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase()
    if (contracts) {
        const filtered = contracts.filter(contract => 
            contract.title?.toLowerCase().includes(value) ||
            contract.id?.includes(value) ||
            contract.organizationName?.toLowerCase().includes(value)
        )
        setFoundedContracts(filtered)
    }
  }

  const handleSelectAdmin = async () => {
    if (!candidate) {
      error("ابتدا کاندیدای مدیریت را انتخاب کنید")
      return
    }

    try {
      const res = await fetch(`/api/panels/${params.id}`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(candidate)
      })

      if (res.ok) {
        success("با موفقیت کاربر به عنوان مدیر انتخاب شد")
        setCandidate(null)
      } else {
        error("مشکلی در انتخاب کاربر به عنوان مدیر پیش آمد")
      }
    } catch (err) {
      console.error("Error selecting admin:", err)
      error("خطا در انتخاب مدیر")
    }
  }

  const getUserDisplayName = (user: UserType) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`
    }
    return user.email || user.phone || "کاربر ناشناس"
  }

  const handleSelectContract = async () => {
    if (!selectedContract) {
        error("ابتدا یک قرار داد را انتخاب کنید")
    }

    try {
        const res = await fetch(`/api/panels/${panel?.id}/contract`, {
            method: 'POST',
            headers: {
              "Content-Type": "application/json"
            }, 
            body: JSON.stringify(selectedContract)
        })

        if (!res.ok) {
          error("مشکلی در ثبت قرارداد مربوطه از سمت سرور پیش آمد")
        }

        success("قرارداد مربوطه ثبت شد")
    } catch {
      error("خطایی در ثبت قرارداد مربوطه پیش آمد")
    }
  }

  useEffect(() => {
    if (panel) {
      const _contract = contracts?.find(contract => 
        panel.contract && contract.id == panel.contract.id
      )
      if (_contract)
        setSelectedContract(_contract)
      const _user = users?.find(user => 
        panel.panelUser?.find(panelUser => panelUser.userId == user.id)
      )
      // console.log(_user)
      if (_user)
        setCandidate(_user)
    }
  }, [contracts, users])

  if (!panel) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">در حال بارگذاری...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.push("/admin/panels")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">ویرایش پنل</h1>
            <p className="text-muted-foreground">مدیریت اطلاعات پنل و انتخاب مدیر</p>
          </div>
        </div>
        <Badge variant={panel.isActive ? "default" : "secondary"}>
          {panel.isActive ? "فعال" : "غیرفعال"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Save className="h-5 w-5" />
              اطلاعات پنل
            </CardTitle>
            <CardDescription>
              اطلاعات اصلی پنل را ویرایش کنید
            </CardDescription>
          </CardHeader>
          <CardContent>
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

              <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted rounded-lg">
                <div className="flex justify-between">
                  <span>تاریخ ایجاد:</span>
                  <span>{new Date(panel.createdAt).toLocaleDateString('fa-IR')}</span>
                </div>
                <div className="flex justify-between">
                  <span>آخرین بروزرسانی:</span>
                  <span>{new Date(panel.updatedAt).toLocaleDateString('fa-IR')}</span>
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Save className="h-4 w-4 ml-2" />
                {loading ? "در حال بروزرسانی..." : "بروزرسانی پنل"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Admin Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              انتخاب مدیر
            </CardTitle>
            <CardDescription>
              کاربر مورد نظر را به عنوان مدیر این پنل انتخاب کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="user-search">جستجوی کاربر</Label>
              <Input
                id="user-search"
                onChange={handleUserSearch}
                placeholder="ایمیل، شماره تماس یا نام کاربر را وارد کنید"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(foundedUsers || users)?.map(user => (
                <div
                  key={user.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    candidate?.id === user.id 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setCandidate(user)}
                >
                  <div className="font-medium">{getUserDisplayName(user)}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {user.email && <div>ایمیل: {user.email}</div>}
                    {user.phone && <div>شماره: {user.phone}</div>}
                  </div>
                </div>
              ))}
            </div>

            {candidate && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">کاربر انتخاب شده:</div>
                <div className="text-sm mt-1">{getUserDisplayName(candidate)}</div>
                {candidate.email && <div className="text-xs text-muted-foreground">ایمیل: {candidate.email}</div>}
                {candidate.phone && <div className="text-xs text-muted-foreground">شماره: {candidate.phone}</div>}
              </div>
            )}

            <Button 
              onClick={handleSelectAdmin} 
              disabled={!candidate}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 ml-2" />
              افزودن مدیر
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              انتخاب قرارداد    
            </CardTitle>
            <CardDescription>
                برای پنل خود قراردادی انتخاب کنید
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="user-search">جستجوی قرارداد</Label>
              <Input
                id="user-search"
                onChange={handleContractSearch}
                placeholder="جستجو با آیدی ، عنوان قرارداد یا نام سازمان"
              />
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(contracts || foundedContracts)?.map(contract => (
                <div
                  key={contract.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedContract?.id === contract.id 
                      ? "bg-primary text-primary-foreground border-primary" 
                      : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedContract(contract)}
                >
                  <div className="font-medium">{contract.title}</div>
                  <div className="text-xs opacity-75 mt-1">
                    {
                        contract.description
                    }
                  </div>
                </div>
              ))}
            </div>

            {selectedContract && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="font-medium">قرارداد انتخاب شده:</div>
                <div className="text-sm mt-1">{selectedContract.title}</div>
              </div>
            )}

            <Button 
              onClick={handleSelectContract} 
              disabled={!selectedContract}
              className="w-full"
            >
              <File className="h-4 w-4 ml-2" />
              افزودن قرارداد مرتبط
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}