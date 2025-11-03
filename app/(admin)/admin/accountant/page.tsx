"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, Download, Plus, Eye } from "lucide-react"
import persian from "react-date-object/calendars/persian"
import DatePicker from "react-multi-date-picker"
import persian_fa from "react-date-object/locales/persian_fa"
import { DateObject } from "react-multi-date-picker"

interface FinancialTransaction {
  id: string
  type: "INCREAMENT" | "DECREAMENT" | "INITIAL"
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED"
  amount: number
  requestedBy: string
  user: {
    firstName: string
    lastName: string
    email: string
  }
  createdAt: string
  approvals: {
    panelUser: {
      user: {
        firstName: string
        lastName: string
        email: string
      }
    }
    status: "PENDING" | "APPROVED" | "REJECTED"
  }[]
}

interface Panel {
  id: string
  name: string
  totalCredit: number
  _count: {
    panelUser: number
    members: number
  }
}

export default function FinancialManagement() {
  const [panels, setPanels] = useState<Panel[]>([])
  const [selectedPanel, setSelectedPanel] = useState<string>("")
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([])
  const [filteredTransactions, setFilteredTransactions] = useState<FinancialTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [fromDate, setFromDate] = useState<DateObject | null>(null)
  const [toDate, setToDate] = useState<DateObject | null>(null)

  // Fetch panels
  const fetchPanels = async () => {
    try {
      const res = await fetch("/api/panels")
      const data = await res.json()
      setPanels(data.panels || [])
    } catch (error) {
      console.error("Error fetching panels:", error)
    }
  }

  // Fetch transactions for selected panel
  const fetchTransactions = async (panelId: string) => {
    if (!panelId) return
    
    setLoading(true)
    try {
      const res = await fetch(`/api/panels/${panelId}/transactions`)
      const data = await res.json()
      console.log(data)
      setTransactions(data.transactions || [])
      setFilteredTransactions(data || [])
    } catch (error) {
      console.error("Error fetching transactions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPanels()
  }, [])

  useEffect(() => {
    if (selectedPanel) {
      fetchTransactions(selectedPanel)
    }
  }, [selectedPanel])

  // Handle date changes for filtering
  const handleFromDateChange = (date: DateObject | null) => {
    setFromDate(date)
  }

  const handleToDateChange = (date: DateObject | null) => {
    setToDate(date)
  }

  // Apply filters
  useEffect(() => {
    let filtered = transactions

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(transaction => transaction.type === typeFilter)
    }

    // Date range filter
    if (fromDate) {
      const fromGregorian = fromDate.convert(persian, "gregorian").toDate()
      fromGregorian.setHours(0, 0, 0, 0) // Start of day
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt)
        return transactionDate >= fromGregorian
      })
    }

    if (toDate) {
      const toGregorian = toDate.convert(persian, "gregorian").toDate()
      toGregorian.setHours(23, 59, 59, 999) // End of day
      
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.createdAt)
        return transactionDate <= toGregorian
      })
    }

    setFilteredTransactions(filtered)
  }, [searchTerm, statusFilter, typeFilter, fromDate, toDate, transactions])

  const getStatusBadge = (status: string) => {
    const variants = {
      PENDING: "bg-yellow-100 text-yellow-800",
      APPROVED: "bg-green-100 text-green-800",
      REJECTED: "bg-red-100 text-red-800",
      CANCELLED: "bg-gray-100 text-gray-800"
    }
    return <Badge className={variants[status as keyof typeof variants]}>{status}</Badge>
  }

  const getTypeBadge = (type: string) => {
    const variants = {
      INCREAMENT: "bg-blue-100 text-blue-800",
      DECREAMENT: "bg-orange-100 text-orange-800",
      INITIAL: "bg-purple-100 text-purple-800"
    }
    const labels = {
      INCREAMENT: "افزایش اعتبار",
      DECREAMENT: "کاهش اعتبار",
      INITIAL: "اعتبار اولیه"
    }
    return <Badge className={variants[type as keyof typeof variants]}>{labels[type as keyof typeof labels]}</Badge>
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + " ریال"
  }

  const handleExport = () => {
    // Export functionality would go here
    console.log("Exporting transactions...")
  }

  const clearFilters = () => {
    setFromDate(null)
    setToDate(null)
    setStatusFilter("all")
    setTypeFilter("all")
    setSearchTerm("")
  }

  const selectedPanelData = panels.find(panel => panel.id === selectedPanel)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center p-6">
        <div>
          <h1 className="text-3xl font-bold">مدیریت مالی</h1>
          <p className="text-muted-foreground">مدیریت تراکنش‌های مالی و اعتباری پنل‌ها</p>
        </div>
        <Button onClick={handleExport}>
          <Download className="h-4 w-4 ml-2" />
          خروجی Excel
        </Button>
      </div>

      {/* Panels Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
        <Card className="py-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تعداد پنل‌ها</CardTitle>
            <div className="h-4 w-4 bg-blue-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{panels.length}</div>
            <p className="text-xs text-muted-foreground">پنل فعال در سیستم</p>
          </CardContent>
        </Card>

        <Card className="py-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">اعتبار کل</CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(panels.reduce((sum, panel) => sum + panel.totalCredit, 0))}
            </div>
            <p className="text-xs text-muted-foreground">مجموع اعتبار تمام پنل‌ها</p>
          </CardContent>
        </Card>

        <Card className="py-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تراکنش‌های امروز</CardTitle>
            <div className="h-4 w-4 bg-orange-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {transactions.filter(t => new Date(t.createdAt).toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-xs text-muted-foreground">تراکنش‌های ثبت‌شده در امروز</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Controls */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>فیلترها و جستجو</CardTitle>
          <CardDescription>پنل و تراکنش‌های مورد نظر خود را انتخاب کنید</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select value={selectedPanel} onValueChange={setSelectedPanel}>
              <SelectTrigger>
                <SelectValue placeholder="انتخاب پنل" />
              </SelectTrigger>
              <SelectContent>
                {panels.map(panel => (
                  <SelectItem key={panel.id} value={panel.id}>
                    {panel.name} ({formatCurrency(panel.totalCredit)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="وضعیت تراکنش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                <SelectItem value="PENDING">در انتظار</SelectItem>
                <SelectItem value="APPROVED">تایید شده</SelectItem>
                <SelectItem value="REJECTED">رد شده</SelectItem>
                <SelectItem value="CANCELLED">لغو شده</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="نوع تراکنش" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه انواع</SelectItem>
                <SelectItem value="INCREAMENT">افزایش اعتبار</SelectItem>
                <SelectItem value="DECREAMENT">کاهش اعتبار</SelectItem>
                <SelectItem value="INITIAL">اعتبار اولیه</SelectItem>
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="جستجو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">از تاریخ:</label>
              <DatePicker
                value={fromDate}
                onChange={handleFromDateChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                render={(value, openCalendar) => (
                  <div className="relative">
                    <input
                      className="w-full h-10 px-3 pr-10 border rounded-md text-sm bg-background border-input"
                      placeholder="از تاریخ"
                      value={value || ""}
                      onClick={openCalendar}
                      readOnly
                    />
                  </div>
                )}
              />
            </div>
            
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">تا تاریخ:</label>
              <DatePicker
                value={toDate}
                onChange={handleToDateChange}
                calendar={persian}
                locale={persian_fa}
                calendarPosition="bottom-right"
                render={(value, openCalendar) => (
                  <div className="relative">
                    <input
                      className="w-full h-10 px-3 pr-10 border rounded-md text-sm bg-background border-input"
                      placeholder="تا تاریخ"
                      value={value || ""}
                      onClick={openCalendar}
                      readOnly
                    />
                  </div>
                )}
              />
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={clearFilters}
                className="h-10"
              >
                <Filter className="h-4 w-4 ml-2" />
                پاک کردن فیلترها
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transactions Table */}
      <Card className="py-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>تراکنش‌های مالی</CardTitle>
              <CardDescription>
                {selectedPanelData ? `پنل: ${selectedPanelData.name} - اعتبار فعلی: ${formatCurrency(selectedPanelData.totalCredit)}` : "لطفاً یک پنل انتخاب کنید"}
              </CardDescription>
            </div>
            {selectedPanel && (
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                تراکنش جدید
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">در حال بارگذاری تراکنش‌ها...</div>
          ) : !selectedPanel ? (
            <div className="text-center py-8 text-muted-foreground">
              لطفاً یک پنل را از لیست بالا انتخاب کنید
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              هیچ تراکنشی یافت نشد
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>شناسه تراکنش</TableHead>
                  <TableHead>کاربر</TableHead>
                  <TableHead>نوع</TableHead>
                  <TableHead>مبلغ</TableHead>
                  <TableHead>وضعیت</TableHead>
                  <TableHead>تاییدکنندگان</TableHead>
                  <TableHead>تاریخ</TableHead>
                  <TableHead>عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono text-sm">
                      {transaction.id.slice(-8)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {transaction.user.firstName} {transaction.user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {transaction.user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(transaction.type)}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(Number(transaction.amount))}
                    </TableCell>
                    <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {transaction.approvals.map((approval, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <Badge variant="outline" className={
                              approval.status === "APPROVED" ? "bg-green-50" :
                              approval.status === "REJECTED" ? "bg-red-50" : "bg-yellow-50"
                            }>
                              {approval.status}
                            </Badge>
                            <span>
                              {approval.panelUser.user.firstName} {approval.panelUser.user.lastName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString("fa-IR")}
                    </TableCell>
                    <TableCell>
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 ml-1" />
                        مشاهده
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}