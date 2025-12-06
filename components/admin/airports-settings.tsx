// components/admin/settings/airports-settings.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit, Plane, Check, X, ChevronDown, ChevronUp } from "lucide-react"

interface Airport {
  id: string
  name: string
  airportIata: string
  airportCity: string
  createdAt: string
}

interface AirportService {
  id: string
  title: string
  airportId: string
  createdAt: string
}

interface AirportWithServices extends Airport {
  services: AirportService[]
  showServices: boolean
}

export function AirportsSettings() {
  const [airports, setAirports] = useState<AirportWithServices[]>([])
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ name: "", airportIata: "", airportCity: "" })
  const [serviceLoading, setServiceLoading] = useState<string | null>(null)
  const [serviceEditId, setServiceEditId] = useState<string | null>(null)
  const [serviceEditForm, setServiceEditForm] = useState({ title: "" })
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
        const airportsWithServices = Array.isArray(data)
          ? data.map((airport: Airport) => ({
            ...airport,
            services: [],
            showServices: false
          }))
          : []
        setAirports(airportsWithServices)
      } else {
        console.error('Failed to fetch airports')
      }
    } catch (error) {
      console.error('Error fetching airports:', error)
    } finally {
      setFetchLoading(false)
    }
  }

  const fetchAirportServices = async (airportId: string) => {
    try {
      const response = await fetch(`/api/admin/settings/airports/${airportId}/service`)

      if (response.ok) {
        const services = await response.json()
        return Array.isArray(services) ? services : []
      }
      return []
    } catch (error) {
      console.error('Error fetching airport services:', error)
      return []
    }
  }

  const toggleServices = async (airportId: string) => {
    setAirports(prev => prev.map(airport => {
      if (airport.id === airportId) {
        const newShowState = !airport.showServices

        // If we're opening the services and they haven't been loaded yet
        if (newShowState && airport.services.length === 0) {
          // Fetch services
          fetchAirportServices(airportId).then(services => {
            setAirports(prev => prev.map(a =>
              a.id === airportId ? { ...a, services } : a
            ))
          })
        }

        return { ...airport, showServices: newShowState }
      }
      return airport
    }))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleEditInputChange = (field: string, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }))
  }

  const handleServiceInputChange = (value: string) => {
    setServiceEditForm({ title: value })
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
      const response = await fetch(`/api/admin/settings/airports/${id}`, {
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

  const handleAddService = async (airportId: string, e: React.FormEvent) => {
    e.preventDefault()
    setServiceLoading(airportId)

    try {
      const response = await fetch(`/api/admin/settings/airports/${airportId}/service`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: serviceEditForm.title }),
      })

      if (response.ok) {
        const newService = await response.json()
        // Update the airport's services
        setAirports(prev => prev.map(airport =>
          airport.id === airportId
            ? {
              ...airport,
              services: [...airport.services, newService]
            }
            : airport
        ))
        setServiceEditForm({ title: "" })
        alert("سرویس با موفقیت اضافه شد")
      } else {
        const data = await response.json()
        alert(data.message || "خطا در افزودن سرویس")
      }
    } catch (error) {
      console.error('Error adding service:', error)
      alert("خطا در افزودن سرویس")
    } finally {
      setServiceLoading(null)
    }
  }

  const handleEditService = (service: AirportService) => {
    setServiceEditId(service.id)
    setServiceEditForm({ title: service.title })
  }

  const handleSaveServiceEdit = async (airportId: string, serviceId: string) => {
    try {
      const response = await fetch(`/api/admin/settings/airports/${airportId}/service`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId,
          title: serviceEditForm.title
        }),
      })

      if (response.ok) {
        // Update the service in the state
        setAirports(prev => prev.map(airport =>
          airport.id === airportId
            ? {
              ...airport,
              services: airport.services.map(service =>
                service.id === serviceId
                  ? { ...service, title: serviceEditForm.title }
                  : service
              )
            }
            : airport
        ))
        setServiceEditId(null)
        setServiceEditForm({ title: "" })
        alert("سرویس با موفقیت ویرایش شد")
      } else {
        const data = await response.json()
        alert(data.message || "خطا در ویرایش سرویس")
      }
    } catch (error) {
      console.error('Error updating service:', error)
      alert("خطا در ویرایش سرویس")
    }
  }

  const handleCancelServiceEdit = () => {
    setServiceEditId(null)
    setServiceEditForm({ title: "" })
  }

  const handleDeleteService = async (airportId: string, serviceId: string) => {
    if (!confirm("آیا از حذف این سرویس اطمینان دارید؟")) return

    try {
      const response = await fetch(`/api/admin/settings/airports/${airportId}/service`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ serviceId }),
      })

      if (response.ok) {
        // Remove the service from the state
        setAirports(prev => prev.map(airport =>
          airport.id === airportId
            ? {
              ...airport,
              services: airport.services.filter(service => service.id !== serviceId)
            }
            : airport
        ))
        alert("سرویس با موفقیت حذف شد")
      } else {
        const data = await response.json()
        alert(data.message || "خطا در حذف سرویس")
      }
    } catch (error) {
      console.error('Error deleting service:', error)
      alert("خطا در حذف سرویس")
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
                    <>
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

                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => toggleServices(airport.id)}
                              >
                                {airport.showServices ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>

                      {/* Services Row - Opens when plus button is clicked */}
                      {airport.showServices && (
                        <TableRow key={`services-${airport.id}`} className="bg-gray-50">
                          <TableCell colSpan={5} className="p-4">
                            <div className="space-y-6">
                              {/* Add Service Form */}
                              <div className="border rounded-lg p-4 bg-white">
                                <h4 className="font-medium mb-4">افزودن سرویس جدید</h4>
                                <form onSubmit={(e) => handleAddService(airport.id, e)} className="space-y-4">
                                  <div className="flex items-end gap-4">
                                    <div className="flex-1">
                                      <Label htmlFor={`service-title-${airport.id}`}>عنوان سرویس *</Label>
                                      <Input
                                        id={`service-title-${airport.id}`}
                                        value={serviceEditForm.title}
                                        onChange={(e) => handleServiceInputChange(e.target.value)}
                                        required
                                        placeholder="مثلا: سرویس VIP"
                                        className="mt-1"
                                      />
                                    </div>
                                    <Button
                                      type="submit"
                                      disabled={serviceLoading === airport.id}
                                      className="w-auto"
                                    >
                                      <Plus className="h-4 w-4 ml-2" />
                                      {serviceLoading === airport.id ? "در حال افزودن..." : "افزودن سرویس"}
                                    </Button>
                                  </div>
                                </form>
                              </div>

                              {/* Existing Services List */}
                              <div className="border rounded-lg p-4 bg-white">
                                <h4 className="font-medium mb-4">سرویس‌های موجود</h4>
                                {airport.services.length === 0 ? (
                                  <p className="text-sm text-muted-foreground text-center py-4">
                                    هنوز سرویسی برای این فرودگاه اضافه نشده است
                                  </p>
                                ) : (
                                  <div className="space-y-3">
                                    {airport.services.map((service) => (
                                      <div
                                        key={service.id}
                                        className="flex items-center justify-between p-3 border rounded-md hover:bg-gray-50"
                                      >
                                        {serviceEditId === service.id ? (
                                          <div className="flex items-center gap-4 flex-1">
                                            <Input
                                              value={serviceEditForm.title}
                                              onChange={(e) => handleServiceInputChange(e.target.value)}
                                              className="flex-1"
                                            />
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleSaveServiceEdit(airport.id, service.id)}
                                              >
                                                <Check className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={handleCancelServiceEdit}
                                              >
                                                <X className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </div>
                                        ) : (
                                          <>
                                            <div className="flex-1">
                                              <span className="font-medium">{service.title}</span>
                                            </div>
                                            <div className="flex gap-2">
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleEditService(service)}
                                              >
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                              <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => handleDeleteService(airport.id, service.id)}
                                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                              >
                                                <Trash2 className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
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