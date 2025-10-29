"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, FileText, Building, Calendar } from "lucide-react"
import { CreateContractDialog } from "./create-contract-dialog"
import { useRouter } from "next/navigation"

interface Contract {
  id: string
  title: string
  description?: string
  organization: string
  status?: "active" | "closed" | "draft"
  files?: string[]
  closeReason?: string
  createdAt: string
  updatedAt: string
}
function ContractsManagement() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const router = useRouter()

  const fetchContracts = () => {
    setLoading(true)
    fetch("/api/admin/contracts")
      .then((res) => res.json())
      .then((data) => {
        setContracts(data.contracts)
        setLoading(false)
      })
      .catch((error) => {
        console.error("Error fetching contracts:", error)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchContracts()
  }, [])

  const handleEdit = (contractId: string) => {
    router.push(`/admin/contracts/${contractId}`)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این قرارداد اطمینان دارید؟")) return

    try {
      const res = await fetch(`/api/contracts/${id}`, { method: "DELETE" })
      if (res.ok) {
        fetchContracts()
      }
    } catch (error) {
      console.error("Error deleting contract:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "فعال", color: "bg-green-500" },
      closed: { label: "بسته شده", color: "bg-red-500" },
      draft: { label: "پیش‌نویس", color: "bg-yellow-500" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig]
    return <Badge className={config.color}>{config.label}</Badge>
  }

  if (loading) {
    return <div className="text-center py-8">در حال بارگذاری...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">{contracts && contracts.length} قرارداد</p>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 ml-2" />
          قرارداد جدید
        </Button>
      </div>

      <div className="grid gap-4">
        {contracts && contracts.map((contract) => (
          <Card key={contract.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{contract.title}</h3>
                    {contract.status && getStatusBadge(contract.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {contract.description}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Building className="h-3 w-3" />
                      <span>{contract.organization}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      <span>{contract.files && contract.files.length} فایل</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {new Date(contract.createdAt).toLocaleDateString("fa-IR")}
                      </span>
                    </div>
                  </div>

                  {contract.closeReason && (
                    <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
                      <strong>دلیل بستن:</strong> {contract.closeReason}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleEdit(contract.id)}
                  >
                    ویرایش
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleDelete(contract.id)}
                  >
                    حذف
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateContractDialog 
        open={createOpen} 
        onOpenChange={setCreateOpen} 
        onSuccess={fetchContracts} 
      />
    </div>
  )
}

export default async function ContractPage() {
  

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">مدیریت قرارداد ها</h1>
          <p className="text-muted-foreground mt-2">ایجاد، ویرایش و لغو قرارداد</p>
        </div>

        <ContractsManagement />
      </div>
    </div>
  )
}
