"use client"

import { useState, useEffect } from "react"
import { useParams, useSearchParams } from "next/navigation"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Dog
} from "lucide-react"
import { useHotel } from "@/contexts/search/HotelContext"
import { useSnack } from "@/hooks/use-notification"

// Types based on the API response
interface HotelDetailsData {
  Success: boolean;
  Error?: {
    Id: string;
    Message: string;
  };
  CheckIn: string;
  CheckOut: string;
  PricedItinerary: {
    FareSourceCode: string;
    Offer: string;
    Promotion: string;
    NonRefundable: boolean;
    HotelId: number;
    HotelPolicy: {
      BeginTime: string;
      EndTime: string;
      MinAge: string;
      CheckOutTime: string;
      Instructions: string;
      SpecialInstructions: string;
      MandatoryFee: string;
      OptionalFee: string;
      KnowBeforeYouGo: string;
      PaymentDetail: string;
      LicenseNumber: string;
      KeyCollectionInfo: string;
      InstructionsFa: string;
      SpecialInstructionsFa: string;
      ChildPolicyDescriptionFa: string;
      SingleWomanDescriptionFa: string;
      PetAttribiute: Array<{ name: string }>;
    };
    ExtraCharge: {
      Excluded: string;
      Included: string;
      MealplanDescription: string;
    };
    PaymentDeadline: string;
    Currency: string;
    AvailableRoom: number;
    PlainTextCancellationPolicy: string;
    NetRate: number;
    NetRateWithoutDiscount: number;
    ExtraBedRate: number;
    BaseRate: number;
    Rooms: Array<{
      RoomId: string;
      RoomMapId: string;
      Name: string;
      RoomMapName: string;
      AdultCount: number;
      ExtraBedCount: number;
      ChildCount: number;
      ChildAges: string[];
      MealType: string;
      SharingBedding: boolean;
      BedGroups: string;
      HotelRoomEarlyCheckin: {
        CheckInDateTime: string;
        CheckInAmount: number;
      };
      HotelRoomLateCheckout: {
        CheckOutDateTime: string;
        CheckOutAmount: number;
      };
    }>;
    Surcharges: Array<{
      Name: string;
      ChargeType: string;
      SupplierAmount: number;
      Amount: number;
      ExclusionType: number;
    }>;
    CancellationPolicies: Array<{
      Amount: number;
      FromDate: string;
    }>;
    Remarks: string[];
    RemarksFa: string[];
    Amenities: string[];
    IsReserveOffline: boolean;
    IsBlockout: boolean;
    HotelLabels: string[];
  };
}

interface HotelDetailsProps {
  hotelId?: string;
  fareSourceCode: string;
  checkIn?: string;
  checkOut?: string;
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
  const [hotelData, setHotelData] = useState<HotelDetailsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)
  const [hotelImages, setHotelImages] = useState<string[]>([])
  const [hotelName, setHotelName] = useState("")
  const { getHotelImages, getHotelName } = useHotel()
  const { error } = useSnack()

  useEffect(() => {
    const fetchHotelDetails = async () => {
      try {
        setLoading(true)
        
        // Fetch hotel details
        const response = await fetch('/api/hotels/details', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            FareSourceCode: fareSourceCode,
            FixStayId: null,
            Nationality: null
          })
        })

        if (!response.ok) {
          throw new Error('Failed to fetch hotel details')
        }

        const result = await response.json()
        
        if (result.success && result.data.Success) {
          setHotelData(result.data)
          
          // Fetch hotel name and images
          const [name, imagesData] = await Promise.all([
            getHotelName(result.data.PricedItinerary.HotelId),
            getHotelImages(result.data.PricedItinerary.HotelId)
          ])
          
          setHotelName(name)
          
          // Extract image URLs
          const images = imagesData.map((img: any) => img.Name).slice(0, 10)
          setHotelImages(images.length > 0 ? images : ['/hotels/hotel-1.jpg'])
        } else {
          error(result.data.Error?.Message || "خطا در دریافت اطلاعات هتل")
        }
      } catch (err) {
        console.error('Error fetching hotel details:', err)
        error("خطا در دریافت اطلاعات هتل")
      } finally {
        setLoading(false)
      }
    }

    if (fareSourceCode) {
      fetchHotelDetails()
    }
  }, [fareSourceCode, getHotelImages, getHotelName, error])

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

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-96 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded"></div>
            </div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!hotelData || !hotelData.Success) {
    return (
      <div className="container mx-auto p-4 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-red-800 mb-4">خطا در دریافت اطلاعات</h2>
          <p className="text-red-600">{hotelData?.Error?.Message || "هتل مورد نظر یافت نشد"}</p>
        </div>
      </div>
    )
  }

  const { PricedItinerary: hotel } = hotelData

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold mb-2">{hotelName}</h1>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                <span>5.0</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>موقعیت مکانی</span>
              </div>
              {hotel.HotelLabels.map((label, index) => (
                <Badge key={index} variant="secondary" className="bg-white/20">
                  {label}
                </Badge>
              ))}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">
              {formatPrice(hotel.NetRate, hotel.Currency)}
            </div>
            {hotel.NetRateWithoutDiscount > hotel.NetRate && (
              <div className="text-sm line-through opacity-80">
                {formatPrice(hotel.NetRateWithoutDiscount, hotel.Currency)}
              </div>
            )}
            <div className="text-sm mt-1">برای هر شب</div>
          </div>
        </div>
      </div>

      {/* Images Gallery */}
      <Card>
        <CardContent className="p-0">
          <div className="relative h-96">
            <Image
              src={hotelImages[selectedImage]}
              alt={hotelName}
              fill
              className="object-cover rounded-t-lg"
            />
            {hotelImages.length > 1 && (
              <div className="absolute bottom-4 left-4 right-4 flex gap-2 overflow-x-auto">
                {hotelImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative h-16 w-24 flex-shrink-0 ${
                      selectedImage === index ? 'ring-2 ring-blue-500' : ''
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${hotelName} ${index + 1}`}
                      fill
                      className="object-cover rounded"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">مشخصات</TabsTrigger>
              <TabsTrigger value="rooms">اتاق‌ها</TabsTrigger>
              <TabsTrigger value="policies">قوانین</TabsTrigger>
              <TabsTrigger value="amenities">امکانات</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">اطلاعات اقامت</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">تاریخ ورود</div>
                        <div className="font-medium">{formatDate(hotelData.CheckIn)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">تاریخ خروج</div>
                        <div className="font-medium">{formatDate(hotelData.CheckOut)}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">ساعت تحویل اتاق</div>
                        <div className="font-medium">{hotel.HotelPolicy.BeginTime}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="text-sm text-muted-foreground">ساعت تخلیه اتاق</div>
                        <div className="font-medium">{hotel.HotelPolicy.CheckOutTime}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Special Offers */}
              {(hotel.Offer || hotel.Promotion) && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-4">پیشنهادات ویژه</h3>
                    <div className="space-y-2">
                      {hotel.Offer && (
                        <div className="flex items-center gap-2 text-green-600">
                          <Badge variant="outline" className="bg-green-50">ویژه</Badge>
                          <span>{hotel.Offer}</span>
                        </div>
                      )}
                      {hotel.Promotion && (
                        <div className="flex items-center gap-2 text-blue-600">
                          <Badge variant="outline" className="bg-blue-50">تخفیف</Badge>
                          <span>{hotel.Promotion}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Extra Charges */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">هزینه‌های اضافی</h3>
                  <div className="space-y-2">
                    {hotel.ExtraCharge.Included && (
                      <div className="flex justify-between items-center">
                        <span className="text-green-600">شامل:</span>
                        <span>{hotel.ExtraCharge.Included}</span>
                      </div>
                    )}
                    {hotel.ExtraCharge.Excluded && (
                      <div className="flex justify-between items-center">
                        <span className="text-red-600">شامل نمی‌شود:</span>
                        <span>{hotel.ExtraCharge.Excluded}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rooms Tab */}
            <TabsContent value="rooms" className="space-y-4">
              {hotel.Rooms.map((room, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-bold">{room.Name || room.RoomMapName}</h4>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{room.AdultCount} بزرگسال</span>
                          </div>
                          {room.ChildCount > 0 && (
                            <div className="flex items-center gap-1">
                              <Baby className="h-4 w-4" />
                              <span>{room.ChildCount} کودک</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <UtensilsCrossed className="h-4 w-4" />
                            <span>{getMealTypeText(room.MealType)}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary">{room.BedGroups}</Badge>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {room.HotelRoomEarlyCheckin.CheckInAmount > 0 && (
                        <div className="flex justify-between">
                          <span>چک‌این زودهنگام:</span>
                          <span className="font-medium">
                            {formatPrice(room.HotelRoomEarlyCheckin.CheckInAmount, hotel.Currency)}
                          </span>
                        </div>
                      )}
                      {room.HotelRoomLateCheckout.CheckOutAmount > 0 && (
                        <div className="flex justify-between">
                          <span>چک‌اوت دیرهنگام:</span>
                          <span className="font-medium">
                            {formatPrice(room.HotelRoomLateCheckout.CheckOutAmount, hotel.Currency)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Policies Tab */}
            <TabsContent value="policies" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">سیاست کنسلی</h3>
                  {hotel.PlainTextCancellationPolicy ? (
                    <p className="text-sm leading-relaxed">{hotel.PlainTextCancellationPolicy}</p>
                  ) : (
                    <div className="space-y-2">
                      {hotel.CancellationPolicies.map((policy, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span>بعد از {formatDate(policy.FromDate)}:</span>
                          <span className="font-medium text-red-600">
                            {formatPrice(policy.Amount, hotel.Currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">قوانین هتل</h3>
                  <div className="space-y-3 text-sm">
                    {hotel.HotelPolicy.InstructionsFa && (
                      <div>
                        <strong>دستورالعمل‌ها:</strong>
                        <p className="mt-1">{hotel.HotelPolicy.InstructionsFa}</p>
                      </div>
                    )}
                    {hotel.HotelPolicy.SpecialInstructionsFa && (
                      <div>
                        <strong>دستورالعمل‌های ویژه:</strong>
                        <p className="mt-1">{hotel.HotelPolicy.SpecialInstructionsFa}</p>
                      </div>
                    )}
                    {hotel.HotelPolicy.ChildPolicyDescriptionFa && (
                      <div>
                        <strong>سیاست کودکان:</strong>
                        <p className="mt-1">{hotel.HotelPolicy.ChildPolicyDescriptionFa}</p>
                      </div>
                    )}
                    {hotel.HotelPolicy.PetAttribiute.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Dog className="h-4 w-4" />
                        <span>حیوانات خانگی مجاز هستند</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Amenities Tab */}
            <TabsContent value="amenities" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4">امکانات هتل</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {hotel.Amenities.map((amenity, index) => {
                      const Icon = amenityIcons[amenity]
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                          {Icon && <Icon className="h-5 w-5 text-blue-600" />}
                          <span className="text-sm">{amenity}</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Booking Card */}
        <div className="space-y-4">
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">رزرو هتل</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>قیمت نهایی:</span>
                  <span className="text-2xl font-bold text-green-600">
                    {formatPrice(hotel.NetRate, hotel.Currency)}
                  </span>
                </div>

                {hotel.NonRefundable && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <Shield className="h-4 w-4" />
                    <span>غیرقابل استرداد</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>پرداخت در هتل</span>
                </div>

                {hotel.PaymentDeadline && (
                  <div className="flex items-center gap-2 text-sm text-orange-600">
                    <Clock className="h-4 w-4" />
                    <span>مهلت پرداخت: {formatDate(hotel.PaymentDeadline)}</span>
                  </div>
                )}

                <Button className="w-full h-12 text-lg" size="lg">
                  رزرو الآن
                </Button>

                {hotel.AvailableRoom > 0 && (
                  <div className="text-center text-sm text-green-600">
                    {hotel.AvailableRoom} اتاق موجود
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Important Notes */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-bold mb-2">نکات مهم</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• قیمت برای هر شب محاسبه شده است</li>
                <li>• مالیات و عوارض شامل قیمت شده است</li>
                <li>• امکان کنسلی طبق قوانین هتل وجود دارد</li>
                {hotel.IsReserveOffline && (
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