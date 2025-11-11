"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save, Trash2, Calendar, MapPin, User, CreditCard, FileText, Mail, Phone, IdCard } from "lucide-react"
import { toast } from "sonner"

interface User {
  id: string
  email: string | null
  phone: string | null
  role: string
  firstName: string | null
  lastName: string | null
  nationalId: string | null
  address: string | null
  postalCode: string | null
  city: string | null
  province: string | null
  dateOfBirth: string | null
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  updatedAt: string
  bookings: Booking[]
  posts: Post[]
}

interface Booking {
  id: string
  type: string
  status: string
  bookingCode: string
  totalPrice: number
  currency: string
  createdAt: string
}

interface Post {
  id: string
  title: string
  slug: string
  published: boolean
  featured: boolean
  views: number
  createdAt: string
}

export function UserDetailView({ userId }: { userId: string }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState("info")
  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    role: "",
    firstName: "",
    lastName: "",
    nationalId: "",
    address: "",
    postalCode: "",
    city: "",
    province: "",
    dateOfBirth: "",
    emailVerified: false,
    phoneVerified: false,
  })

  const fetchUser = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users/${userId}`)
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setFormData({
          email: data.user.email || "",
          phone: data.user.phone || "",
          role: data.user.role,
          firstName: data.user.firstName || "",
          lastName: data.user.lastName || "",
          nationalId: data.user.nationalId || "",
          address: data.user.address || "",
          postalCode: data.user.postalCode || "",
          city: data.user.city || "",
          province: data.user.province || "",
          dateOfBirth: data.user.dateOfBirth ? data.user.dateOfBirth.split('T')[0] : "",
          emailVerified: data.user.emailVerified,
          phoneVerified: data.user.phoneVerified,
        })
      } else {
        toast.error("خطا در دریافت اطلاعات کاربر")
      }
    } catch (error) {
      console.error("[v0] Error fetching user:", error)
      toast.error("خطا در دریافت اطلاعات کاربر")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [userId])

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        setEditing(false)
        toast.success("تغییرات با موفقیت ذخیره شد")
        fetchUser() // Refresh data to get updated user info
      } else {
        const error = await res.json()
        toast.error(error.error || "خطا در ذخیره تغییرات")
      }
    } catch (error) {
      console.error("[v0] Error updating user:", error)
      toast.error("خطا در ذخیره تغییرات")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟ این عمل غیرقابل بازگشت است.")) return

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        toast.success("کاربر با موفقیت حذف شد")
        router.push("/admin/users")
      } else {
        const error = await res.json()
        toast.error(error.error || "خطا در حذف کاربر")
      }
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
      toast.error("خطا در حذف کاربر")
    }
  }

  const getRoleBadge = (role: string) => {
    const roles = {
      USER: { label: "کاربر", color: "bg-blue-500" },
      ADMIN: { label: "مدیر", color: "bg-purple-500" },
      ACCOUNTANT: { label: "حسابدار", color: "bg-green-500" },
      ROTO: { label: "نماینده سازمان", color: "bg-blue-500" },
      ORGAN: { label: "ارگان", color: "bg-red-500" },
    }
    return roles[role as keyof typeof roles] || { label: role, color: "bg-gray-500" }
  }

  const getStatusBadge = (status: string) => {
    const statuses = {
      PENDING: { label: "در انتظار", color: "bg-yellow-500" },
      CONFIRMED: { label: "تأیید شده", color: "bg-green-500" },
      CANCELLED: { label: "لغو شده", color: "bg-red-500" },
      COMPLETED: { label: "تکمیل شده", color: "bg-blue-500" },
    }
    return statuses[status as keyof typeof statuses] || { label: status, color: "bg-gray-500" }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">در حال بارگذاری اطلاعات کاربر...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">کاربر یافت نشد</p>
        <Button onClick={() => router.push("/admin/users")} className="mt-4">
          بازگشت به لیست کاربران
        </Button>
      </div>
    )
  }

  const roleBadge = getRoleBadge(user.role)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/users")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-bold text-foreground">
              {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : "کاربر بدون نام"}
            </h1>
            <p className="text-muted-foreground mt-1">مشاهده و مدیریت اطلاعات کاربر</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {editing ? (
            <>
              <Button variant="outline" onClick={() => { setEditing(false); fetchUser(); }} disabled={saving}>
                انصراف
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "در حال ذخیره..." : "ذخیره تغییرات"}
                <Save className="h-4 w-4 ml-2" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="destructive" onClick={handleDelete}>
                <Trash2 className="h-4 w-4 ml-2" />
                حذف کاربر
              </Button>
              <Button onClick={() => setEditing(true)}>ویرایش کاربر</Button>
            </>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir="rtl">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            اطلاعات کاربر
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            رزروها ({user.bookings.length})
          </TabsTrigger>
          <TabsTrigger value="posts" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            پست‌ها ({user.posts.length})
          </TabsTrigger>
        </TabsList>

        {/* User Info Tab */}
        <TabsContent value="info" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="text-right">اطلاعات پایه</CardTitle>
                <CardDescription className="text-right">اطلاعات اصلی و نقش کاربر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="role" className="text-right">نقش کاربر</Label>
                  {editing ? (
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger className="w-40 text-right">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USER">کاربر</SelectItem>
                        <SelectItem value="ADMIN">مدیر</SelectItem>
                        <SelectItem value="ACCOUNTANT">حسابدار</SelectItem>
                        <SelectItem value="ROTO">نماینده سازمان</SelectItem>
                        <SelectItem value="ORGAN">ارگان</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge className={roleBadge.color}>{roleBadge.label}</Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-right">تأیید ایمیل</Label>
                  {editing ? (
                    <Switch
                      checked={formData.emailVerified}
                      onCheckedChange={(checked) => setFormData({ ...formData, emailVerified: checked })}
                    />
                  ) : (
                    <Badge variant={user.emailVerified ? "default" : "secondary"}>
                      {user.emailVerified ? "تأیید شده" : "تأیید نشده"}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-right">تأیید تلفن</Label>
                  {editing ? (
                    <Switch
                      checked={formData.phoneVerified}
                      onCheckedChange={(checked) => setFormData({ ...formData, phoneVerified: checked })}
                    />
                  ) : (
                    <Badge variant={user.phoneVerified ? "default" : "secondary"}>
                      {user.phoneVerified ? "تأیید شده" : "تأیید نشده"}
                    </Badge>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground justify-end">
                    <Calendar className="h-4 w-4" />
                    <span>تاریخ ایجاد: {new Date(user.createdAt).toLocaleDateString("fa-IR")}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1 justify-end">
                    <Calendar className="h-4 w-4" />
                    <span>آخرین به‌روزرسانی: {new Date(user.updatedAt).toLocaleDateString("fa-IR")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-end">
                  <Mail className="h-5 w-5" />
                  اطلاعات تماس
                </CardTitle>
                <CardDescription className="text-right">راه‌های ارتباطی کاربر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm text-muted-foreground text-right block mb-2">ایمیل</Label>
                  {editing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="text-right"
                      placeholder="example@email.com"
                    />
                  ) : (
                    <p className="text-right">{user.email || "ثبت نشده"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm text-muted-foreground text-right block mb-2">شماره تلفن</Label>
                  {editing ? (
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="text-right"
                      placeholder="09123456789"
                    />
                  ) : (
                    <p className="text-right">{user.phone || "ثبت نشده"}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="nationalId" className="text-sm text-muted-foreground text-right block mb-2">کد ملی</Label>
                  {editing ? (
                    <Input
                      id="nationalId"
                      value={formData.nationalId}
                      onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                      className="text-right"
                      placeholder="0012345678"
                    />
                  ) : (
                    <p className="text-right">{user.nationalId || "ثبت نشده"}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Personal Information */}
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-end">
                  <User className="h-5 w-5" />
                  اطلاعات شخصی
                </CardTitle>
                <CardDescription className="text-right">جزئیات پروفایل کاربر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm text-muted-foreground text-right block mb-2">نام</Label>
                    {editing ? (
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="text-right"
                        placeholder="نام"
                      />
                    ) : (
                      <p className="text-right">{user.firstName || "ثبت نشده"}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="lastName" className="text-sm text-muted-foreground text-right block mb-2">نام خانوادگی</Label>
                    {editing ? (
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="text-right"
                        placeholder="نام خانوادگی"
                      />
                    ) : (
                      <p className="text-right">{user.lastName || "ثبت نشده"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="dateOfBirth" className="text-sm text-muted-foreground text-right block mb-2">تاریخ تولد</Label>
                  {editing ? (
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                      className="text-right"
                    />
                  ) : (
                    <p className="text-right">
                      {user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString("fa-IR") : "ثبت نشده"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Address Information */}
            <Card className="py-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-end">
                  <MapPin className="h-5 w-5" />
                  آدرس
                </CardTitle>
                <CardDescription className="text-right">اطلاعات مکانی کاربر</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="address" className="text-sm text-muted-foreground text-right block mb-2">آدرس کامل</Label>
                  {editing ? (
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="text-right"
                      placeholder="آدرس کامل"
                      rows={3}
                    />
                  ) : (
                    <p className="text-right">{user.address || "ثبت نشده"}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm text-muted-foreground text-right block mb-2">شهر</Label>
                    {editing ? (
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="text-right"
                        placeholder="شهر"
                      />
                    ) : (
                      <p className="text-right">{user.city || "ثبت نشده"}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="province" className="text-sm text-muted-foreground text-right block mb-2">استان</Label>
                    {editing ? (
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                        className="text-right"
                        placeholder="استان"
                      />
                    ) : (
                      <p className="text-right">{user.province || "ثبت نشده"}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="postalCode" className="text-sm text-muted-foreground text-right block mb-2">کد پستی</Label>
                  {editing ? (
                    <Input
                      id="postalCode"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="text-right"
                      placeholder="1234567890"
                    />
                  ) : (
                    <p className="text-right">{user.postalCode || "ثبت نشده"}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Bookings Tab - Read Only */}
        <TabsContent value="bookings">
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="text-right">رزروهای کاربر</CardTitle>
              <CardDescription className="text-right">آخرین رزروهای انجام شده توسط کاربر</CardDescription>
            </CardHeader>
            <CardContent>
              {user.bookings.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">هیچ رزروی یافت نشد</p>
              ) : (
                <div className="space-y-4">
                  {user.bookings.map((booking) => {
                    const statusBadge = getStatusBadge(booking.status)
                    return (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <div className="text-right">
                            <p className="font-medium">
                              {booking.type === "HOTEL" && "هتل"}
                              {booking.type === "FLIGHT" && "پرواز"}
                              {booking.type === "TRAIN" && "قطار"}
                            </p>
                            <p className="text-sm text-muted-foreground">کد رزرو: {booking.bookingCode}</p>
                          </div>
                        </div>
                        <div className="text-left">
                          <Badge className={statusBadge.color}>{statusBadge.label}</Badge>
                          <p className="text-sm font-medium mt-1">
                            {booking.totalPrice.toLocaleString("fa-IR")} {booking.currency}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(booking.createdAt).toLocaleDateString("fa-IR")}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Posts Tab - Read Only */}
        <TabsContent value="posts">
          <Card className="py-6">
            <CardHeader>
              <CardTitle className="text-right">پست‌های کاربر</CardTitle>
              <CardDescription className="text-right">مقالات و محتوای ایجاد شده توسط کاربر</CardDescription>
            </CardHeader>
            <CardContent>
              {user.posts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">هیچ پستی یافت نشد</p>
              ) : (
                <div className="space-y-4">
                  {user.posts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="text-right">
                        <p className="font-medium">{post.title}</p>
                        <p className="text-sm text-muted-foreground">اسلاگ: {post.slug}</p>
                        <div className="flex items-center gap-4 mt-2 justify-end">
                          <Badge variant={post.published ? "default" : "secondary"}>
                            {post.published ? "منتشر شده" : "پیش‌نویس"}
                          </Badge>
                          {post.featured && <Badge variant="outline">ویژه</Badge>}
                          <span className="text-xs text-muted-foreground">
                            {post.views.toLocaleString("fa-IR")} بازدید
                          </span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground text-left">
                        {new Date(post.createdAt).toLocaleDateString("fa-IR")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}