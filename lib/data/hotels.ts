export interface Hotel {
  id: string
  name: string
  city: string
  address: string
  price: number
  rating: number
  image: string
  amenities: string[]
  description: string
  rooms: number
}

export const hotels: Hotel[] = [
  {
    id: "1",
    name: "هتل پارسیان آزادی",
    city: "تهران",
    address: "میدان آزادی، خیابان آزادی",
    price: 2500000,
    rating: 4.5,
    image: "/luxury-hotel-lobby-tehran.jpg",
    amenities: ["وای‌فای رایگان", "استخر", "رستوران", "پارکینگ", "سالن ورزشی"],
    description: "هتل پنج ستاره با امکانات کامل در قلب تهران",
    rooms: 150,
  },
  {
    id: "2",
    name: "هتل اسپیناس پالاس",
    city: "تهران",
    address: "خیابان ولیعصر، بالاتر از پارک ملت",
    price: 3200000,
    rating: 4.8,
    image: "/modern-luxury-hotel-room.jpg",
    amenities: ["وای‌فای رایگان", "استخر", "رستوران", "پارکینگ", "سالن ورزشی", "اسپا"],
    description: "هتل لوکس با چشم‌انداز زیبا به شهر تهران",
    rooms: 200,
  },
  {
    id: "3",
    name: "هتل عباسی",
    city: "اصفهان",
    address: "خیابان چهارباغ عباسی",
    price: 1800000,
    rating: 4.7,
    image: "/traditional-persian-hotel-isfahan.jpg",
    amenities: ["وای‌فای رایگان", "رستوران سنتی", "پارکینگ", "باغ"],
    description: "هتل تاریخی با معماری سنتی ایرانی",
    rooms: 80,
  },
  {
    id: "4",
    name: "هتل درویشی",
    city: "مشهد",
    address: "خیابان امام رضا، نزدیک حرم",
    price: 1500000,
    rating: 4.3,
    image: "/hotel-near-shrine-mashhad.jpg",
    amenities: ["وای‌فای رایگان", "رستوران", "پارکینگ"],
    description: "هتل مناسب زائران با فاصله کم تا حرم مطهر",
    rooms: 120,
  },
  {
    id: "5",
    name: "هتل پارس شیراز",
    city: "شیراز",
    address: "بلوار زند، نزدیک ارگ کریمخان",
    price: 1600000,
    rating: 4.4,
    image: "/hotel-shiraz-iran.jpg",
    amenities: ["وای‌فای رایگان", "استخر", "رستوران", "پارکینگ"],
    description: "هتل مدرن در مرکز شهر شیراز",
    rooms: 100,
  },
  {
    id: "6",
    name: "هتل داریوش کیش",
    city: "کیش",
    address: "ساحل غربی جزیره کیش",
    price: 2800000,
    rating: 4.9,
    image: "/beach-resort-hotel-kish-island.jpg",
    amenities: ["وای‌فای رایگان", "استخر", "رستوران", "پارکینگ", "دسترسی به ساحل", "اسپا"],
    description: "هتل ساحلی لوکس با امکانات بی‌نظیر",
    rooms: 180,
  },
]
