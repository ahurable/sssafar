"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Trash2, Search } from "lucide-react"

interface User {
  id: string
  email: string | null
  phone: string | null
  role: string
  firstName: string | null
  lastName: string | null
  emailVerified: boolean
  phoneVerified: boolean
  createdAt: string
  _count: {
    bookings: number
    posts: number
  }
}

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchUsers = (searchQuery = "") => {
    setLoading(true)
    const url = searchQuery ? `/api/admin/users?search=${searchQuery}` : "/api/admin/users"
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error fetching users:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchUsers(search)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این کاربر اطمینان دارید؟")) return

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchUsers(search)
      }
    } catch (error) {
      console.error("[v0] Error deleting user:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>
  }

  return (
    <div>
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="جستجو بر اساس نام، ایمیل یا شماره تلفن..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
        </div>
        <Button type="submit">جستجو</Button>
      </form>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card key={user.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">
                      {user.firstName && user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.email || user.phone}
                    </h3>
                    <Badge className={user.role === "ADMIN" ? "bg-purple-500" : "bg-blue-500"}>
                      {user.role === "ADMIN" ? "مدیر" : "کاربر"}
                    </Badge>
                  </div>
                  <div className="space-y-1 text-sm text-muted-foreground">
                    {user.email && <p>ایمیل: {user.email}</p>}
                    {user.phone && <p>تلفن: {user.phone}</p>}
                    <p>
                      رزروها: {user._count.bookings.toLocaleString("fa-IR")} | پست‌ها:{" "}
                      {user._count.posts.toLocaleString("fa-IR")}
                    </p>
                  </div>
                </div>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
