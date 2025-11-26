// components/admin/settings/airports-settings.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Plane, Check, X } from "lucide-react"

interface Airport {
  id: string
  name: string
  airportIata: string
  airportCity: string
  createdAt: string
}

export function AirportsSettings() {
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", airportIata: "", airportCity: "" })

  const [formData, setFormData] = useState({
    airportName: "",
    airportIata: "",
    airportCity: ""
  })

  // Fetch airports on component mount
  useEffect(() => {
    fetchAirports()
  }, [])

  const fetchAirports = async () => {
    try {
      setFetchLoading(true)
      const response = await fetch('/api/admin/settings/airports')
      
      if (response.ok) {
        const data = await response.json()
        // console.log(data)
        setAirports(Array.isArray(data) ? data : [])
      } else {
        console.error('Failed to fetch airports')
      }
    } catch (error) {
      console.error('Error fetching airports:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEditInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/admin/settings/airports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        // Reset form
        setFormData({
          airportName: "",
          airportIata: "",
          airportCity: ""
        })
        // Refresh airports list
        fetchAirports()
        alert(data.message || "فرودگاه با موفقیت اضافه شد")
      } else {
        alert(data.message || "خطا در افزودن فرودگاه")
      }
    } catch (error) {
      console.error('Error adding airport:', error)
      alert("خطا در افزودن فرودگاه")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (airport: Airport) => {
    setEditingId(airport.id)
    setEditForm({
      name: airport.name,
      airportIata: airport.airportIata,
      airportCity: airport.airportCity
    })
  }

  const handleSaveEdit = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/settings/airports/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        setEditingId(null)
        fetchAirports()
        alert("فرودگاه با موفقیت ویرایش شد")
      } else {
        const data = await response.json()
        alert(data.message || "خطا در ویرایش فرودگاه")
      }
    } catch (error) {
      console.error('Error updating airport:', error)
      alert("خطا در ویرایش فرودگاه")
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ name: "", airportIata: "", airportCity: "" })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("آیا از حذف این فرودگاه اطمینان دارید؟")) return

    try {
      const response = await fetch(`/api/admin/settigns/airports/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchAirports()
        alert("فرودگاه با موفقیت حذف شد")
      } else {
        const data = await response.json()
        alert(data.message || "خطا در حذف فرودگاه")
      }
    } catch (error) {
      console.error('Error deleting airport:', error)
      alert("خطا در حذف فرودگاه")
    }
  }

  return (
    <div className="space-y-6">
      {/* Add Airport Form */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5" />
            افزودن فرودگاه جدید
          </CardTitle>
          <CardDescription>
            اطلاعات فرودگاه جدید را وارد کنید
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="airportName">نام فرودگاه *</Label>
                <Input
                  id="airportName"
                  value={formData.airportName}
                  onChange={(e) => handleInputChange("airportName", e.target.value)}
                  required
                  placeholder="مثلا: فرودگاه بین‌المللی امام خمینی"
                />
              </div>

              <div>
                <Label htmlFor="airportIata">کد IATA *</Label>
                <Input
                  id="airportIata"
                  value={formData.airportIata}
                  onChange={(e) => handleInputChange("airportIata", e.target.value.toUpperCase())}
                  required
                  maxLength={3}
                  placeholder="مثلا: IKA"
                  className="uppercase"
                />
              </div>

              <div>
                <Label htmlFor="airportCity">شهر *</Label>
                <Input
                  id="airportCity"
                  value={formData.airportCity}
                  onChange={(e) => handleInputChange("airportCity", e.target.value)}
                  required
                  placeholder="مثلا: تهران"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full md:w-auto">
              <Plus className="h-4 w-4 ml-2" />
              {loading ? "در حال افزودن..." : "افزودن فرودگاه"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Airports List */}
      <Card className="py-6">
        <CardHeader>
          <CardTitle>لیست فرودگاه‌ها</CardTitle>
          <CardDescription>
            مدیریت و ویرایش فرودگاه‌های موجود
          </CardDescription>
        </CardHeader>
        <CardContent>
          {fetchLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-2">در حال بارگذاری فرودگاه‌ها...</p>
            </div>
          ) : airports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Plane className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>هنوز فرودگاهی اضافه نکرده‌اید</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>نام فرودگاه</TableHead>
                    <TableHead>کد IATA</TableHead>
                    <TableHead>شهر</TableHead>
                    <TableHead>تاریخ ایجاد</TableHead>
                    <TableHead>عملیات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {airports.map((airport) => (
                    <TableRow key={airport.id}>
                      <TableCell className="font-medium">
                        {editingId === airport.id ? (
                          <Input
                            value={editForm.name}
                            onChange={(e) => handleEditInputChange("name", e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          airport.name
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === airport.id ? (
                          <Input
                            value={editForm.airportIata}
                            onChange={(e) => handleEditInputChange("airportIata", e.target.value.toUpperCase())}
                            className="w-20 uppercase"
                            maxLength={3}
                          />
                        ) : (
                          <span className="font-mono bg-gray-100 px-2 py-1 rounded text-sm">
                            {airport.airportIata}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === airport.id ? (
                          <Input
                            value={editForm.airportCity}
                            onChange={(e) => handleEditInputChange("airportCity", e.target.value)}
                            className="w-full"
                          />
                        ) : (
                          airport.airportCity
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(airport.createdAt).toLocaleDateString('fa-IR')}
                      </TableCell>
                      <TableCell>
                        {editingId === airport.id ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleSaveEdit(airport.id)}
                            >
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(airport)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(airport.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {airports.length > 0 && (
            <div className="mt-4 text-sm text-muted-foreground">
              تعداد: {airports.length} فرودگاه
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}