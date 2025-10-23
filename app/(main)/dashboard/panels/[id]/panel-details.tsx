"use client"

import type React from "react"

import { useState, useEffect, FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Plus, Trash2, Users, AlertCircle, CheckCircle2, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { useSnack } from "@/hooks/use-notification"

interface User {
  id: string
  email: string
  phone: string | null
  firstName: string | null
  lastName: string | null
}

interface Panel {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  slug: string
  panelUser?: {
    userId: string
    role: string
  }[]
  members?: {
    userId: string
  }[]
  description: string | null
  isActive: boolean
  adminId: string | null
}

interface panelMember {
    credit: number
    id: string
    isActive: boolean
    joinedAt: string
    lastLogin: null
    panelId: string
    user: 
    {
        id: string, 
        email: string | null, 
        phone: string | null,
        firstName?: string
        lastName?: string
    }
    userId: string
}

interface MembersOnPanel {
  id: string
  userId: string
  user: User
  credit: number
  isActive: boolean
  joinedAt: string
}

interface PanelCreditTransaction {
  id: string
  amount: number
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED'
  type: 'INITIAL' | 'INCREAMENT' | 'DECREAMENT'
  panelId: string
  userId: string
  requestedBy: string
  createdAt: string
  updatedAt: string
  approvals: {
    id: string
    status: 'PENDING' | 'APPROVED' | 'REJECTED'
    role: 'ADMIN' | 'ECO' | 'ACC'
    panelUser: {
      user: {
        id: string
        firstName: string | null
        lastName: string | null
      }
    }
  }[]
  user: {
    firstName: string | null
    lastName: string | null
    email: string
  }
}

interface PanelUserRole {
  role: 'ADMIN' | 'ECO' | 'ACC'
  userId: string
}


export function AddPanelMembersForm( {panel} : {panel:Panel} ) {

  const { error } = useSnack()
  const [panelRole, setPanelRole] = useState<PanelUserRole | null>()


  const fetchPanelUser = async () => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/panels/${panel.id}/user`)
    const data = await response.json()
    console.log(data)
    if (!response.ok)
      error('خطا در صحت سنجی دسترسی کاربر')
    setPanelRole(data)
  }

  useEffect(() => {
    fetchPanelUser()
  }, [])



  return (
    panel && panelRole && <AddMemberForm _panel={panel} userRole={panelRole} />
  )

}




export function AddMemberForm({_panel, userRole}:{_panel:Panel, userRole: PanelUserRole}) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [panel, setPanel] = useState(_panel)
  // Data states
  const [users, setUsers] = useState<User[]>([])
  const [existingMembers, setExistingMembers] = useState<{panelMember:panelMember[]}[]|null>()
  const [transactions, setTransactions] = useState<PanelCreditTransaction[]>([])
  
  // Form states
  const [selectedPanel, setSelectedPanel] = useState(panel.id)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [initialCredit, setInitialCredit] = useState(0)

  const handleUserSearch = async (e:FormEvent<HTMLInputElement>) => {
      try {
        e.preventDefault()
        const usersRes = await fetch(`/api/admin/users?search=${e.currentTarget.value}`)
        const usersData = await usersRes.json()
        
        if (usersRes.ok) {
          setUsers(usersData.users || [])
          console.log(usersData)
        }

      } catch (err) {
        console.error("Error loading initial data:", err)
        setError("خطا در بارگذاری اطلاعات")
      } finally {
        setLoading(false)
      }
    }

  // Load existing members when panel changes
  useEffect(() => {
    console.log(selectedPanel)
    if (selectedPanel) {
      loadExistingMembers(selectedPanel)
      loadTransactions(selectedPanel)
    } else {
      setExistingMembers(null)
      setTransactions([])
    }
  }, [selectedPanel])

  useEffect(() => {
    console.log(panel)
    setLoading(false)
  } , [panel])

  const loadExistingMembers = async (panelId: string) => {
    try {
      const res = await fetch(`/api/panels/${panelId}/members`)
      const data = await res.json()
      console.log(data)
      if (res.ok) {
        setExistingMembers(data.members || [])
      }
    } catch (err) {
      console.error("Error loading members:", err)
    }
  }

  const loadTransactions = async (panelId: string) => {
    try {
      const res = await fetch(`/api/panels/${panelId}/transactions`)
      const data = await res.json()
      if (res.ok) {
        setTransactions(data.transactions || [])
      }
    } catch (err) {
      console.error("Error loading transactions:", err)
    }
  }

  const handleApproveTransaction = async (transactionId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/transactions/${transactionId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved })
      })

      if (res.ok) {
        await loadTransactions(selectedPanel)
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const data = await res.json()
        setError(data.error || "خطا در تایید تراکنش")
      }
    } catch (err) {
      console.error("Error approving transaction:", err)
      setError("خطا در برقراری ارتباط با سرور")
    }
  }

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true
    
    const query = searchQuery.toLowerCase()
    return (
      user.email.toLowerCase().includes(query) ||
      (user.phone && user.phone.includes(query)) ||
      (user.firstName && user.firstName.toLowerCase().includes(query)) ||
      (user.lastName && user.lastName.toLowerCase().includes(query))
    )
  })

  // Filter out already added users
  const availableUsers = filteredUsers.filter(user => 
    !selectedUsers.includes(user.id) && 
    existingMembers &&
    !existingMembers.some(member => member.panelMember.find(_u => _u.id === user.id))
  )

  const handleAddUser = (userId: string) => {
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers(prev => [...prev, userId])
      setSearchQuery("") // Clear search after adding
    }
  }

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(prev => prev.filter(id => id !== userId))
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!selectedPanel) {
      errors.panel = "انتخاب پنل الزامی است"
    }

    if (selectedUsers.length === 0) {
      errors.users = "حداقل یک کاربر باید انتخاب شود"
    }

    if (initialCredit < 0) {
      errors.credit = "اعتبار اولیه نمی‌تواند منفی باشد"
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      setError("لطفا اطلاعات فرم را به درستی تکمیل کنید")
      return
    }
    
    setSaving(true)
    setError("")
    setSuccess(false)

    try {
      const submitData = {
        panelId: selectedPanel,
        userIds: selectedUsers,
        initialCredit: initialCredit
      }

      const res = await fetch(`/api/panels/${panel.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      })

      const data = await res.json()

      if (res.ok) {
        setSuccess(true)
        setSelectedUsers([])
        setInitialCredit(0)
        setSearchQuery("")
        await loadExistingMembers(selectedPanel)
        await loadTransactions(selectedPanel)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(data.error || "خطا در افزودن اعضا به پنل")
      }
    } catch (err) {
      console.error("Error adding panel members:", err)
      setError("خطا در برقراری ارتباط با سرور")
    } finally {
      setSaving(false)
    }
  }

  const getSelectedUsersData = () => {
    return selectedUsers.map(userId => 
      users.find(user => user.id === userId)
    ).filter(Boolean) as User[]
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { variant: "secondary" as const, icon: Clock, text: "در انتظار", color: "text-yellow-600" },
      APPROVED: { variant: "default" as const, icon: CheckCircle, text: "تایید شده", color: "text-green-600" },
      REJECTED: { variant: "destructive" as const, icon: XCircle, text: "رد شده", color: "text-red-600" },
      CANCELLED: { variant: "outline" as const, icon: XCircle, text: "لغو شده", color: "text-gray-600" }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDING
    const IconComponent = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <IconComponent className={`h-3 w-3 ${config.color}`} />
        {config.text}
      </Badge>
    )
  }

  const getApprovalStatus = (transaction: PanelCreditTransaction) => {
    const userApproval = transaction.approvals.find(approval => 
      approval.panelUser.user.id === userRole.userId
    )
    return userApproval?.status || 'PENDING'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">در حال بارگذاری...</div>
        </CardContent>
      </Card>
    )
  }

  // Render for ECO and ACC roles - Show only transactions
  if (userRole.role === 'ECO' || userRole.role === 'ACC') {
    return (
      <Card className="py-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            تراکنش‌های اعتبار پنل
          </CardTitle>
          <CardDescription>
            مدیریت و تایید تراکنش‌های اعتبار اعضای پنل
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-4 w-4" />
              عملیات با موفقیت انجام شد
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Transactions List */}
          <div className="space-y-4">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                هیچ تراکنشی یافت نشد
              </div>
            ) : (
              transactions.map(transaction => {
                const userApprovalStatus = getApprovalStatus(transaction)
                const canApprove = userApprovalStatus === 'PENDING' && transaction.status === 'PENDING'

                return (
                  <div key={transaction.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {transaction.user.firstName && transaction.user.lastName 
                            ? `${transaction.user.firstName} ${transaction.user.lastName}`
                            : transaction.user.email
                          }
                          <Badge variant="outline">
                            {transaction.type === 'INITIAL' ? 'اعتبار اولیه' : 
                             transaction.type === 'INCREAMENT' ? 'افزایش اعتبار' : 'کاهش اعتبار'}
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          مبلغ: {transaction.amount.toLocaleString()} تومان
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          تاریخ درخواست: {new Date(transaction.createdAt).toLocaleDateString('fa-IR')}
                        </div>
                      </div>
                      {getStatusBadge(transaction.status)}
                    </div>

                    {/* Approvals Status */}
                    <div className="mb-3">
                      <div className="text-sm font-medium mb-2">وضعیت تاییدها:</div>
                      <div className="flex gap-2 flex-wrap">
                        {transaction.approvals.map(approval => (
                          <Badge 
                            key={approval.id} 
                            variant={approval.status === 'APPROVED' ? 'default' : 'outline'}
                            className="text-xs"
                          >
                            {approval.role}: {approval.status === 'APPROVED' ? 'تایید' : 
                                            approval.status === 'REJECTED' ? 'رد' : 'در انتظار'}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {transaction.status === 'PENDING' && (
                      <div className="flex gap-2 justify-end">
                        <div className="text-xs text-muted-foreground">
                          وضعیت شما: {userApprovalStatus === 'APPROVED' ? 'تایید کرده‌اید' : 
                                    userApprovalStatus === 'REJECTED' ? 'رد کرده‌اید' : 'در انتظار'}
                        </div>
                        {canApprove && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleApproveTransaction(transaction.id, false)}
                              className="text-red-600 border-red-200 hover:bg-red-50"
                            >
                              <XCircle className="h-4 w-4 ml-1" />
                              رد
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApproveTransaction(transaction.id, true)}
                            >
                              <CheckCircle className="h-4 w-4 ml-1" />
                              تایید
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Render for ADMIN role - Show full form
  return (
    <Card className="py-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          افزودن عضو به پنل
        </CardTitle>
        <CardDescription>
          کاربران را به پنل مورد نظر اضافه کنید و اعتبار اولیه تعیین کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              اعضا با موفقیت به پنل اضافه شدند
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          {/* Panel Selection */}
          <div className="space-y-2">
            <Label htmlFor="panel">
                 پنل
            </Label>
            <Select value={selectedPanel} disabled onValueChange={setSelectedPanel}>
              <SelectTrigger className={`w-full ${formErrors.panel ? "border-red-500" : ""}`}>
                <SelectValue placeholder="یک پنل انتخاب کنید" />
              </SelectTrigger>
              <SelectContent>
                 <SelectItem value={panel.id}>
                    {panel.name} 
                  </SelectItem>
              </SelectContent>
            </Select>
            {formErrors.panel && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.panel}
              </p>
            )}
          </div>

          {/* User Search and Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userSearch">
                جستجوی کاربران
              </Label>
              <div className="relative">
                <User className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="userSearch"
                  placeholder="جستجو بر اساس ایمیل، شماره تلفن یا نام..."
                  onChange={ handleUserSearch}
                  className="pr-10"
                />
              </div>
            </div>

            {/* Available Users List */}
            {users.length > 0 && (
              <div className="border rounded-lg p-3 max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {users.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleAddUser(user.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : "کاربر بدون نام"
                            }
                          </div>
                          <div className="text-sm text-muted-foreground flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {user.email}
                            {user.phone && (
                              <>
                                <Phone className="h-3 w-3" />
                                {user.phone}
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button type="button" size="sm" variant="outline">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Selected Users */}
            {selectedUsers.length > 0 && (
              <div className="space-y-2">
                <Label>کاربران انتخاب شده ({selectedUsers.length})</Label>
                <div className="border rounded-lg p-3 space-y-2">
                  {getSelectedUsersData().map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-2 bg-primary/5 rounded"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {user.firstName && user.lastName 
                              ? `${user.firstName} ${user.lastName}`
                              : "کاربر بدون نام"
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email}
                          </div>
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemoveUser(user.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formErrors.users && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.users}
              </p>
            )}
          </div>

          {/* Initial Credit */}
          <div className="space-y-2">
            <Label htmlFor="initialCredit">
              اعتبار اولیه (اختیاری)
            </Label>
            <Input
              id="initialCredit"
              type="number"
              placeholder="مقدار اعتبار اولیه"
              value={initialCredit}
              onChange={(e) => setInitialCredit(Number(e.target.value))}
              min="0"
              className={formErrors.credit ? "border-red-500" : ""}
            />
            {formErrors.credit && (
              <p className="text-red-500 text-xs flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.credit}
              </p>
            )}
          </div>

          {/* Existing Members Preview */}
          {existingMembers && existingMembers.length > 0 && (
            <div className="border-t pt-4">
              <Label>اعضای فعلی پنل ({existingMembers.length})</Label>
              <div className="mt-2 space-y-2 max-h-32 overflow-y-auto">
                {existingMembers.map(_member => _member.panelMember.map(member =>  (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 text-sm border rounded"
                  >
                    <div className="flex items-center gap-2">
                      <span>
                        {member.user?.firstName && member.user?.lastName 
                          ? `${member.user.firstName} ${member.user.lastName}`
                          : member.user?.email || member.user?.phone
                        }
                      </span>
                      <Badge variant={member.isActive ? "default" : "secondary"}>
                        {member.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </div>
                    <span className="text-muted-foreground">
                      {member.credit} اعتبار
                    </span>
                  </div>
                )))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => {
                setSelectedUsers([])
                setSearchQuery("")
                setInitialCredit(0)
              }}
            >
              پاک کردن
            </Button>
            <Button 
              type="submit" 
              disabled={saving || selectedUsers.length === 0 || !selectedPanel}
            >
              <Plus className="ml-2 h-4 w-4" />
              {saving ? "در حال افزودن..." : `افزودن ${selectedUsers.length} عضو`}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}