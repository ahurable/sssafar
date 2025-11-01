"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { faIR } from "date-fns/locale"
import { Users, Mail, Phone } from "lucide-react"

interface User {
  id: string
  email: string | null
  phone: string | null
  firstName: string | null
  lastName: string | null
  role: string
  createdAt: string
  emailVerified: boolean
  phoneVerified: boolean
}

export function RecentUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.recentUsers || [])
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error fetching recent users:", error)
        setLoading(false)
      })
  }, [])

  const getRoleBadge = (role: string) => {
    const roles: { [key: string]: { label: string; variant: "default" | "secondary" | "destructive" | "outline" } } = {
      USER: { label: "کاربر", variant: "default" },
      ADMIN: { label: "مدیر", variant: "destructive" },
      ACCOUNTANT: { label: "حسابدار", variant: "secondary" },
      ROTO: { label: "سازمان", variant: "outline" },
      ORGAN: { label: "ارگان", variant: "outline" }
    }
    return roles[role] || { label: role, variant: "outline" }
  }

  if (loading) {
    return (
      <Card className="py-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            کاربران اخیر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div>
                    <div className="h-4 bg-muted rounded w-24 mb-1"></div>
                    <div className="h-3 bg-muted rounded w-32"></div>
                  </div>
                </div>
                <div className="h-3 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          کاربران اخیر
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.slice(0, 5).map((user) => {
            const roleBadge = getRoleBadge(user.role)
            return (
              <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    {user.firstName ? user.firstName[0] : user.email ? user.email[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">
                        {user.firstName && user.lastName 
                          ? `${user.firstName} ${user.lastName}`
                          : user.email || user.phone || "کاربر ناشناس"
                        }
                      </p>
                      <Badge variant={roleBadge.variant} className="text-xs">
                        {roleBadge.label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      {user.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span>{user.email}</span>
                          {user.emailVerified && (
                            <Badge variant="outline" className="text-xs px-1">تأیید</Badge>
                          )}
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>{user.phone}</span>
                          {user.phoneVerified && (
                            <Badge variant="outline" className="text-xs px-1">تأیید</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-left">
                  {formatDistanceToNow(new Date(user.createdAt), {
                    addSuffix: true,
                    locale: faIR,
                  })}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}