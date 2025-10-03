"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatDistanceToNow } from "date-fns"
import { faIR } from "date-fns/locale"

interface User {
  id: string
  email: string | null
  phone: string | null
  firstName: string | null
  lastName: string | null
  createdAt: string
}

export function RecentUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.recentUsers)
        setLoading(false)
      })
      .catch((error) => {
        console.error("[v0] Error fetching recent users:", error)
        setLoading(false)
      })
      console.log(users)
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>کاربران اخیر</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">در حال بارگذاری...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>کاربران اخیر</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* {users.map((user) => (
            <div key={user.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div>
                <p className="font-medium">
                  {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email || user.phone}
                </p>
                <p className="text-sm text-muted-foreground">{user.email || user.phone}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(user.createdAt), {
                  addSuffix: true,
                  locale: faIR,
                })}
              </p>
            </div>
          ))} */}
        </div>
      </CardContent>
    </Card>
  )
}
