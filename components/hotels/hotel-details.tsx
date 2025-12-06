"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Star,
  MapPin,
  Wifi,
  Coffee,
  Car,
  Dumbbell,
  Utensils,
  Snowflake,
  Tv,
  Users,
  Clock,
  Calendar,
  CreditCard,
  Shield,
  Bed,
  UtensilsCrossed,
  Baby,
  Dog,
  User,
  ChevronLeft,
  Heart,
  Share2,
  Building,
  CreditCard as CardIcon,
  Info,
  AlertTriangle,
  CheckCircle,
  XCircle,
  X,
  ChevronRight,
  ChevronLeft as ChevronLeftIcon
} from "lucide-react"
import { useHotel } from "@/contexts/search/HotelContext"
import { useSnack } from "@/hooks/use-notification"
import { useRouter } from "next/navigation"

// Types for hotel with fare data
interface HotelWithFare {
  FareSourceCode: string
  Offer?: string
  Promotion?: string
  NonRefundable: boolean
  HotelId: number
  HotelPolicy: {
    BeginTime: string
    EndTime: string
    MinAge: string
    CheckOutTime: string
    Instructions: string
    SpecialInstructions: string
    MandatoryFee: string
    OptionalFee: string
    KnowBeforeYouGo: string
    PaymentDetail: string
    LicenseNumber: string
    KeyCollectionInfo: string
    InstructionsFa: string
    SpecialInstructionsFa: string
    ChildPolicyDescriptionFa: string
    SingleWomanDescriptionFa: string
    PetAttribiute: Array<{ name: string }>
  }
  ExtraCharge: {
    Excluded: string
    Included: string
    MealplanDescription: string
  }
  PaymentDeadline: string
  Currency: string
  AvailableRoom: number
  PlainTextCancellationPolicy: string
  NetRate: number
  NetRateWithoutDiscount: number
  ExtraBedRate: number
  BaseRate: number
  Rooms: Array<{
    RoomId: string
    RoomMapId: string
    Name: string
    RoomMapName: string
    AdultCount: number
    ExtraBedCount: number
    ChildCount: number
    ChildAges: string[]
    MealType: string
    SharingBedding: boolean
    BedGroups: string
    HotelRoomEarlyCheckin?: {
      CheckInDateTime: string
      CheckInAmount: number
    }
    HotelRoomLateCheckout?: {
      CheckOutDateTime: string
      CheckOutAmount: number
    }
  }>
  Surcharges: Array<{
    Name: string
    ChargeType: string
    SupplierAmount: number
    Amount: number
    ExclusionType: number
  }>
  CancellationPolicies: Array<{
    Amount: number
    FromDate: string
  }>
  Remarks: string[]
  RemarksFa: string[]
  Amenities: string[]
  IsReserveOffline: boolean
  IsBlockout: boolean
  IsMinStayNight: boolean
  MinStayNight: number
  IsMaxStayNight: boolean
  MaxStayNight: number
  IsFixStayNight: boolean
  FixStayNight: number
  IsBoardPrice: boolean
  HotelRefundType: string
  NationalityRule: {
    IsAll: boolean
    NationalityCodes: string[]
    CurrencyCode: number
  }
  OtherNationalities: any[]
  PricedItineraryTransfers: Array<{
    TransferType: number
    ServiceType: number
  }>
  HotelPricedItineraryMetaDatas: Array<{
    Offer: string
    Promotion: string
    Amenities: string[]
    NetRate: number
    SupplierNetRate: number
    HotelPricedItineraryMetaDataRooms: Array<{
      ProviderRoomId: string
      RoomName: string
      MealType: string
    }>
  }>
  IsFixStay: boolean
  HotelPricedItineraryFixStayList: Array<{
    Id: number
    From: string
    To: string
    Amount: number
  }>
  HotelLabels: string[]
}

interface HotelDetailsProps {
  hotelId?: string
  fareSourceCode?: string
  checkIn?: string
  checkOut?: string
}

// Amenity icons mapping
const amenityIcons: Record<string, any> = {
  "WiFi": Wifi,
  "Free WiFi": Wifi,
  "Restaurant": Utensils,
  "Breakfast": Coffee,
  "Parking": Car,
  "Free Parking": Car,
  "Gym": Dumbbell,
  "Fitness Center": Dumbbell,
  "Swimming Pool": Users,
  "Pool": Users,
  "Air Conditioning": Snowflake,
  "AC": Snowflake,
  "TV": Tv,
  "Television": Tv,
  "Room Service": Coffee,
}

export default function HotelDetails({ hotelId, fareSourceCode, checkIn, checkOut }: HotelDetailsProps) {
  const [hotelData, setHotelData] = useState<HotelWithFare | null>(null)
  const [hotelItinenaries, setHotelItinenaries] = useState<HotelWithFare[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [hotelImages, setHotelImages] = useState<any[]>([])
  const [hotelName, setHotelName] = useState("")
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [roomImages, setRoomImages] = useState<{ [key: string]: any[] }>({}) // key: roomMapId
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)
  const [modalImageIndex, setModalImageIndex] = useState(0)
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
  const { getHotelImages, getHotelName } = useHotel()
  const { error, success } = useSnack()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  // Get parameters from URL or props
  const currentHotelId = hotelId || params.id as string
  const currentFareSourceCode = fareSourceCode || searchParams.get('fareSourceCode') || ''
  const rawCheckIn = checkIn || searchParams.get('checkIn') || ''
  const rawCheckOut = checkOut || searchParams.get('checkOut') || ''
  const currentCheckIn = rawCheckIn.replace(' ', '+')
  const currentCheckOut = rawCheckOut.replace(' ', '+')

  // Function to fetch hotel with fare data
  const hotelWithFare = async (hotelId: number): Promise<HotelWithFare[]> => {
    if (hotelId === 0) return []

    try {
      const res = await fetch("/api/hotels/search/list", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          checkIn: currentCheckIn,
          checkOut: currentCheckOut,
          hotelId: currentHotelId,
          occupancies: [{ AdultCount: 2, ChildCount: 0, ChildAges: [] }],
          cityId: 1
        })
      })

      const data = await res.json()

      if (res.ok && Array.isArray(data)) {
        setHotelItinenaries(data)
        return data
      }
      console.error("Error fetching hotels with fare:", data)
      return []
    } catch (error) {
      console.error("Error in hotelWithFare:", error)
      return []
    }
  }

  // Function to get room images using RoomMapId


  // Load room images for all unique roomMapIds
  useEffect(() => {
    const loadRoomImages = async () => {
      if (hotelItinenaries && hotelItinenaries.length > 0) {
        const imagesMap: { [key: string]: any[] } = {}


        setRoomImages(hotelImages[0])
      }
    }

    loadRoomImages()
  }, [hotelItinenaries])

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true)

        if (!currentHotelId) {
          error("شناسه هتل مشخص نیست")
          return
        }

        const hotelIdNum = parseInt(currentHotelId)
        const hotelsWithFare = await hotelWithFare(hotelIdNum)

        if (hotelsWithFare.length > 0) {
          const hotel = hotelsWithFare[0]
          setHotelData(hotel)

          const [name, imagesData] = await Promise.all([
            getHotelName(hotel.HotelId),
            getHotelImages(hotel.HotelId)
          ])

          setHotelName(name)
          const images = imagesData.slice(0, 10)
          setHotelImages(images.length > 0 ? images : ['/hotels/hotel-1.jpg'])

          success("اطلاعات هتل با موفقیت دریافت شد")
        } else {
          error("هتل مورد نظر یافت نشد")
        }
      } catch (err) {
        console.error('Error fetching hotel details:', err)
        error("خطا در دریافت اطلاعات هتل")
      } finally {
        setLoading(false)
      }
    }

    if (currentHotelId) {
      fetchHotelDetails()
    }
  }, [currentHotelId, currentCheckIn, currentCheckOut])

  const formatPrice = (price: number, currency: string = "IRR") => {
    if (currency === "IRR" || currency === "تومان") {
      return price.toLocaleString("fa-IR") + " تومان"
    }
    return price.toLocaleString("fa-IR") + " " + currency
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fa-IR")
  }

  const getMealTypeText = (mealType: string) => {
    const mealTypes: Record<string, string> = {
      "BB": "صبحانه",
      "HB": "صبحانه و ناهار",
      "FB": "تمام وعده‌ها",
      "AI": "همه‌شمول",
      "RO": "بدون غذا"
    }
    return mealTypes[mealType] || mealType
  }

  const getRoomImage = (roomMapId: string) => {

    return hotelImages[0]
  }

  const toggleFavorite = (hotelId: number) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(hotelId)) {
        newFavorites.delete(hotelId)
        success("از لیست علاقه‌مندی‌ها حذف شد")
      } else {
        newFavorites.add(hotelId)
        success("به لیست علاقه‌مندی‌ها اضافه شد")
      }
      return newFavorites
    })
  }

  const handleRoomSelection = (roomMapId: string) => {
    setSelectedRoom(roomMapId === selectedRoom ? null : roomMapId)
  }

  const handleReservation = () => {
    if (!selectedRoom) {
      error("لطفاً یک اتاق انتخاب کنید")
      return
    }

    if (!hotelData) return

    // Find the selected room details
    const selectedRoomData = allRooms.find(room => room.RoomId === selectedRoom)
    if (!selectedRoomData) {
      error("اتاق انتخاب شده یافت نشد")
      return
    }

    // Navigate to booking page with room information
    router.push(`/hotels/reservation/${hotelData.FareSourceCode}?checkIn=${currentCheckIn}&checkOut=${currentCheckOut}&roomMapId=${selectedRoom}&roomName=${encodeURIComponent(selectedRoomData.Name || selectedRoomData.RoomMapName)}`)
  }

  const openImageModal = (index: number) => {
    setModalImageIndex(index)
    setIsImageModalOpen(true)
  }

  const closeImageModal = () => {
    setIsImageModalOpen(false)
  }

  const nextImage = () => {
    setModalImageIndex((prev) => (prev + 1) % hotelImages.length)
  }

  const prevImage = () => {
    setModalImageIndex((prev) => (prev - 1 + hotelImages.length) % hotelImages.length)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-blue-200 w-1/3"></div>
          <div className="h-96 bg-blue-200"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-blue-200"></div>
              <div className="h-6 bg-blue-200"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-blue-200"></div>
              <div className="h-32 bg-blue-200"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hotelData) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-50 border border-red-200 p-8">
          <h2 className="text-2xl font-bold text-red-800 mb-4">خطا در دریافت اطلاعات</h2>
          <p className="text-red-600">هتل مورد نظر یافت نشد</p>
          <Button className="mt-4" onClick={() => router.back()}>
            بازگشت
          </Button>
        </div>
      </div>
    )
  }

  const hasDiscount = hotelData.NetRateWithoutDiscount > hotelData.NetRate
  const discountPercentage = hasDiscount
    ? Math.round(((hotelData.NetRateWithoutDiscount - hotelData.NetRate) / hotelData.NetRateWithoutDiscount) * 100)
    : 0

  // Get all unique rooms from all itineraries
  const allRooms = hotelItinenaries.flatMap(it => it.Rooms || [])

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="bg-blue-900 p-4 text-white rounded-lg">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-2">{hotelName}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>5.0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>موقعیت مکانی</span>
                  </div>
                  {hotelData.HotelLabels.map((label, index) => (
                    <Badge key={index} className="bg-[#fffefe]/20 border-0">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-8 w-8 bg-[#fffefe]/20 hover:bg-[#fffefe]/30 border-0"
                  onClick={() => toggleFavorite(hotelData.HotelId)}
                >
                  <Heart
                    className={`h-4 w-4 ${favorites.has(hotelData.HotelId)
                      ? "fill-red-500 text-red-500"
                      : "text-white"
                      }`}
                  />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Images Gallery - New Layout */}
      <Card className="border-none">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row h-96">
            {/* Left Side - 4 Small Images */}
            <div className="lg:w-2/5 flex lg:flex-wrap gap-2 lg:p-0 p-2 overflow-x-auto lg:overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
              {hotelImages.slice().map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative h-20 lg:h-2/5 w-20 lg:w-[17vw] ${selectedImage === index ? 'ring-2 ring-blue-500 rounded-lg' : ''
                    }`}
                >
                  <Image
                    src={img.imageUrl}
                    alt={`${hotelName} ${index + 1}`}
                    fill
                    className="object-cover rounded-lg"
                  />
                </button>
              ))}
            </div>

            {/* Right Side - Big Image */}
            <div className="lg:w-3/5 relative flex-1">
              <button
                onClick={() => openImageModal(selectedImage)}
                className="w-full h-full"
              >
                <Image
                  src={hotelImages[selectedImage]?.imageUrl || '/hotels/hotel-1.jpg'}
                  alt={hotelName}
                  fill
                  className="object-cover hover:opacity-90 transition-opacity rounded-lg"
                />
              </button>

              {/* Navigation Arrows */}
              {hotelImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage((prev) => (prev - 1 + hotelImages.length) % hotelImages.length)
                    }}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 hover:bg-black/70"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedImage((prev) => (prev + 1) % hotelImages.length)
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 hover:bg-black/70"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 h-screen bg-black/70 z-[100001] flex items-center justify-center">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white p-2 hover:bg-[#fffefe]/20"
          >
            <X className="h-6 w-6" />
          </button>

          <button
            onClick={prevImage}
            className="absolute left-4 text-white p-2 hover:bg-[#fffefe]/20"
          >
            <ChevronLeftIcon className="h-6 w-6" />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 text-white p-2 hover:bg-[#fffefe]/20"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div className="relative w-full h-full max-w-4xl max-h-4xl">
            <Image
              src={hotelImages[modalImageIndex]?.imageUrl || '/hotels/hotel-1.jpg'}
              alt={`${hotelName} ${modalImageIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white">
            {modalImageIndex + 1} / {hotelImages.length}
          </div>
        </div>
      )}

      {/* Main Content - All in one page */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - All Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                اطلاعات اصلی هتل
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاریخ ورود:</span>
                    <span className="font-medium">{formatDate(currentCheckIn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تاریخ خروج:</span>
                    <span className="font-medium">{formatDate(currentCheckOut)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ساعت تحویل اتاق:</span>
                    <span className="font-medium">{hotelData.HotelPolicy.BeginTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">ساعت تخلیه اتاق:</span>
                    <span className="font-medium">{hotelData.HotelPolicy.CheckOutTime}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">حداقل سن:</span>
                    <span className="font-medium">{hotelData.HotelPolicy.MinAge || "تعیین نشده"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">اتاق‌های موجود:</span>
                    <span className="font-medium text-green-600">{hotelData.AvailableRoom}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">وضعیت استرداد:</span>
                    <span className={`font-medium ${hotelData.NonRefundable ? 'text-red-600' : 'text-green-600'}`}>
                      {hotelData.NonRefundable ? "غیرقابل استرداد" : "قابل استرداد"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">رزرو آفلاین:</span>
                    <span className="font-medium">{hotelData.IsReserveOffline ? "بله" : "خیر"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Rooms Information */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Bed className="h-5 w-5 text-blue-600" />
                انتخاب اتاق ({allRooms.length} اتاق)
              </h2>
              <div className="space-y-6">
                {allRooms.map((room, index) => {
                  const isSelected = selectedRoom === room.RoomId
                  return (
                    <div
                      key={`${room.RoomId}-${index}`}
                      className={` transition-all duration-200 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-blue-900 hover:border-blue-900'
                        }`}
                    >
                      <div className="flex flex-col lg:flex-row">
                        {/* Room Image */}
                        <div className="lg:w-64 relative h-48 lg:h-auto">
                          <div className="relative w-full h-full">
                            <Image
                              src={hotelImages[Math.floor(Math.random() * hotelImages.length)].imageUrl}
                              alt={room.Name || room.RoomMapName}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/10"></div>

                            {/* Room Badges */}
                            <div className="absolute top-2 left-2 flex flex-col gap-1">
                              {room.MealType && (
                                <Badge className="bg-green-600 text-white px-2 py-1 text-xs border-0">
                                  {getMealTypeText(room.MealType)}
                                </Badge>
                              )}
                              {hotelData.NonRefundable && (
                                <Badge className="bg-red-600 text-white px-2 py-1 text-xs border-0">
                                  غیرقابل استرداد
                                </Badge>
                              )}
                            </div>

                            {/* Selection Indicator */}
                            <div className="absolute top-2 right-2">
                              {isSelected && (
                                <div className="bg-blue-500 text-white p-1 rounded-full">
                                  <CheckCircle className="h-4 w-4" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Room Details */}
                        <div className="flex-1 p-4">
                          <div className="flex flex-col h-full">
                            <div className="flex-1">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg">{room.Name || room.RoomMapName}</h3>
                                <div className="text-right">
                                  <p className="text-xl font-bold text-green-600">
                                    {formatPrice(hotelData.NetRate, hotelData.Currency)}
                                  </p>
                                  {hasDiscount && (
                                    <p className="text-xs line-through text-gray-500">
                                      {formatPrice(hotelData.NetRateWithoutDiscount, hotelData.Currency)}
                                    </p>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                                <div className="flex items-center gap-1">
                                  <User className="h-4 w-4" />
                                  <span>{room.AdultCount} بزرگسال</span>
                                </div>
                                {room.ChildCount > 0 && (
                                  <div className="flex items-center gap-1">
                                    <Baby className="h-4 w-4" />
                                    <span>{room.ChildCount} کودک</span>
                                  </div>
                                )}
                                {room.ExtraBedCount > 0 && (
                                  <div className="flex items-center gap-1">
                                    <span>🛏️ {room.ExtraBedCount} تخت اضافه</span>
                                  </div>
                                )}
                              </div>

                              {room.BedGroups && (
                                <div className="mb-3">
                                  <span className="text-sm font-medium text-gray-700">ترتیب تخت: </span>
                                  <span className="text-sm text-gray-600">{room.BedGroups}</span>
                                </div>
                              )}

                              {room.ChildAges && room.ChildAges.length > 0 && (
                                <div className="mb-3">
                                  <span className="text-sm font-medium text-gray-700">سن کودکان: </span>
                                  <span className="text-sm text-gray-600">{room.ChildAges.join('، ')}</span>
                                </div>
                              )}

                              {room.HotelRoomEarlyCheckin && (
                                <div className="flex justify-between items-center text-sm bg-blue-50 p-2">
                                  <span className="text-blue-700">چک‌این زودهنگام:</span>
                                  <span className="font-medium">{formatPrice(room.HotelRoomEarlyCheckin.CheckInAmount, hotelData.Currency)}</span>
                                </div>
                              )}

                              {room.HotelRoomLateCheckout && (
                                <div className="flex justify-between items-center text-sm bg-green-50 p-2 mt-2">
                                  <span className="text-green-700">چک‌اوت دیرهنگام:</span>
                                  <span className="font-medium">{formatPrice(room.HotelRoomLateCheckout.CheckOutAmount, hotelData.Currency)}</span>
                                </div>
                              )}
                            </div>

                            {/* Room Actions */}
                            <div className="flex justify-between items-center pt-3 border-t border-blue-900 mt-3">
                              {/* <div className="text-xs text-gray-600">
                                <span className="text-green-600 font-medium">
                                  {hotelData.AvailableRoom} اتاق موجود
                                </span>
                              </div> */}
                              <Button
                                onClick={() => handleRoomSelection(room.RoomId)}
                                variant={isSelected ? "default" : "outline"}
                                className={isSelected
                                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                                  : "border-blue-600 text-blue-600 hover:bg-blue-50"
                                }
                                disabled={hotelData.AvailableRoom === 0}
                              >
                                {isSelected ? "اتاق انتخاب شده" : "انتخاب این اتاق"}
                                {isSelected && <CheckCircle className="h-3 w-3 mr-1" />}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Rest of the sections remain the same as before */}
          {/* Amenities */}
          {hotelData.Amenities && hotelData.Amenities.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-blue-600" />
                  امکانات هتل
                </h2>
                <div className="flex gap-3">
                  {hotelData.Amenities.map((amenity, index) => {
                    const Icon = amenityIcons[amenity]
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 shadow">
                        {Icon && <Icon className="h-4 w-4 text-blue-600" />}
                        <span className="text-sm font-medium">{amenity}</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hotel Policy */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                قوانین و مقررات هتل
              </h2>
              <div className="space-y-4">
                {hotelData.HotelPolicy.InstructionsFa && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">دستورالعمل‌ها:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{hotelData.HotelPolicy.InstructionsFa}</p>
                  </div>
                )}

                {hotelData.HotelPolicy.SpecialInstructionsFa && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">دستورالعمل‌های ویژه:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{hotelData.HotelPolicy.SpecialInstructionsFa}</p>
                  </div>
                )}

                {hotelData.HotelPolicy.ChildPolicyDescriptionFa && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">سیاست کودکان:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{hotelData.HotelPolicy.ChildPolicyDescriptionFa}</p>
                  </div>
                )}

                {hotelData.HotelPolicy.SingleWomanDescriptionFa && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">سیاست زنان تنها:</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{hotelData.HotelPolicy.SingleWomanDescriptionFa}</p>
                  </div>
                )}

                {hotelData.HotelPolicy.PetAttribiute && hotelData.HotelPolicy.PetAttribiute.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-800 mb-2">قوانین حیوانات خانگی:</h4>
                    <div className="space-y-1">
                      {hotelData.HotelPolicy.PetAttribiute.map((pet, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <Dog className="h-4 w-4" />
                          <span>{pet.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Extra Charges */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CardIcon className="h-5 w-5 text-blue-600" />
                هزینه‌های اضافی
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">شامل:</h4>
                  <p className="text-sm text-gray-600">{hotelData.ExtraCharge && hotelData.ExtraCharge.Included || "هزینه اضافی شامل نمی‌شود"}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">شامل نمی‌شود:</h4>
                  <p className="text-sm text-gray-600">{hotelData.ExtraCharge && hotelData.ExtraCharge.Excluded || "همه هزینه‌ها شامل شده است"}</p>
                </div>
              </div>

              {hotelData.Surcharges && hotelData.Surcharges.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-bold text-gray-800 mb-2">هزینه‌های فوق‌العاده:</h4>
                  <div className="space-y-2">
                    {hotelData.Surcharges.map((surcharge, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2">
                        <span>{surcharge.Name}</span>
                        <span className="font-medium">{formatPrice(surcharge.Amount, hotelData.Currency)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Cancellation Policies */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                سیاست‌های کنسلی
              </h2>
              {hotelData.PlainTextCancellationPolicy ? (
                <p className="text-sm text-gray-600 leading-relaxed">{hotelData.PlainTextCancellationPolicy}</p>
              ) : (
                <div className="space-y-3">
                  {hotelData.CancellationPolicies && hotelData.CancellationPolicies.map((policy, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-red-50 p-2">
                      <span>از تاریخ {formatDate(policy.FromDate)}</span>
                      <span className="font-medium text-red-600">{formatPrice(policy.Amount, hotelData.Currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardContent className="p-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Info className="h-5 w-5 text-blue-600" />
                اطلاعات تکمیلی
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">حداقل اقامت:</span>
                    <span className="font-medium">{hotelData.IsMinStayNight ? `${hotelData.MinStayNight} شب` : "ندارد"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">حداکثر اقامت:</span>
                    <span className="font-medium">{hotelData.IsMaxStayNight ? `${hotelData.MaxStayNight} شب` : "ندارد"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">اقامت ثابت:</span>
                    <span className="font-medium">{hotelData.IsFixStayNight ? `${hotelData.FixStayNight} شب` : "ندارد"}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">قیمت‌گذاری بورد:</span>
                    <span className="font-medium">{hotelData.IsBoardPrice ? "بله" : "خیر"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">بلاک اوت:</span>
                    <span className="font-medium">{hotelData.IsBlockout ? "بله" : "خیر"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">اقامت ثابت:</span>
                    <span className="font-medium">{hotelData.IsFixStay ? "بله" : "خیر"}</span>
                  </div>
                </div>
              </div>

              {/* Remarks */}
              {(hotelData.RemarksFa && hotelData.RemarksFa.length > 0) && (
                <div className="mt-4">
                  <h4 className="font-bold text-gray-800 mb-2">توضیحات:</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                    {hotelData.RemarksFa.map((remark, index) => (
                      <li key={index}>{remark}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Booking Card */}
        <div className="space-y-4">
          <Card className="sticky top-14 border bg-[#fffefe] border-blue-900">
            <CardContent className="p-4">
              <h3 className="text-lg font-bold mb-3">رزرو هتل</h3>

              {/* Selected Room Info */}
              {selectedRoom && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200">
                  <h4 className="font-bold text-sm mb-2">اتاق انتخاب شده:</h4>
                  {allRooms.find(room => room.RoomId === selectedRoom)?.Name ||
                    allRooms.find(room => room.RoomId === selectedRoom)?.RoomMapName}
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">قیمت نهایی:</span>
                  <div className="text-right">
                    {hasDiscount && (
                      <p className="text-xs line-through text-gray-500 mb-1">
                        {formatPrice(hotelData.NetRateWithoutDiscount, hotelData.Currency)}
                      </p>
                    )}
                    <p className="text-xl font-bold text-green-600">
                      {formatPrice(hotelData.NetRate, hotelData.Currency)}
                    </p>
                    {hasDiscount && (
                      <Badge className="bg-red-600 text-white mt-1 text-xs border-0">
                        {discountPercentage}% تخفیف
                      </Badge>
                    )}
                  </div>
                </div>

                {hotelData.NonRefundable && (
                  <div className="flex items-center gap-2 text-red-600 text-xs p-2 bg-red-50">
                    <Shield className="h-3 w-3" />
                    <span>غیرقابل استرداد</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-600 p-2 bg-blue-50">
                  <CreditCard className="h-3 w-3 text-blue-600" />
                  <span>پرداخت در هتل</span>
                </div>

                <Button
                  onClick={handleReservation}
                  className="w-full h-10 bg-blue-900 hover:bg-blue-800 text-white border-0"
                  disabled={hotelData.AvailableRoom === 0 || !selectedRoom}
                >
                  {!selectedRoom ? "لطفاً اتاق انتخاب کنید" :
                    hotelData.AvailableRoom > 0 ? "رزرو الآن" : "اتاقی موجود نیست"}
                </Button>

                {!selectedRoom && (
                  <div className="text-center text-xs text-red-600 bg-red-50 p-2">
                    برای ادامه، لطفاً یک اتاق انتخاب کنید
                  </div>
                )}

                {/* {selectedRoom && hotelData.AvailableRoom > 0 && (
                  <div className="text-center text-xs text-green-600 bg-green-50 p-2">
                    {hotelData.AvailableRoom} اتاق موجود
                  </div>
                )} */}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardContent className="p-3">
              <h4 className="font-bold mb-2 text-sm">نکات مهم</h4>
              <ul className="text-xs space-y-1 text-gray-600">
                <li>• قیمت برای هر شب محاسبه شده است</li>
                <li>• مالیات و عوارض شامل قیمت شده است</li>
                <li>• امکان کنسلی طبق قوانین هتل وجود دارد</li>
                {hotelData.IsReserveOffline && (
                  <li>• رزرو این هتل به صورت آفلاین انجام می‌شود</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}