export interface Train {
  id: string
  trainNumber: string
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  date: string
  price: number
  class: "economy" | "business" | "sleeper"
  availableSeats: number
  duration: string
}

export const trains: Train[] = [
  {
    id: "T001",
    trainNumber: "۷۲۱",
    from: "تهران",
    to: "مشهد",
    departureTime: "20:30",
    arrivalTime: "08:15",
    date: "1403/08/15",
    price: 850000,
    class: "sleeper",
    availableSeats: 24,
    duration: "11 ساعت و 45 دقیقه",
  },
  {
    id: "T002",
    trainNumber: "۵۰۳",
    from: "تهران",
    to: "اصفهان",
    departureTime: "07:00",
    arrivalTime: "13:30",
    date: "1403/08/15",
    price: 450000,
    class: "economy",
    availableSeats: 48,
    duration: "6 ساعت و 30 دقیقه",
  },
  {
    id: "T003",
    trainNumber: "۸۱۵",
    from: "تهران",
    to: "تبریز",
    departureTime: "19:00",
    arrivalTime: "09:30",
    date: "1403/08/16",
    price: 920000,
    class: "sleeper",
    availableSeats: 18,
    duration: "14 ساعت و 30 دقیقه",
  },
  {
    id: "T004",
    trainNumber: "۶۰۷",
    from: "تهران",
    to: "شیراز",
    departureTime: "18:45",
    arrivalTime: "10:15",
    date: "1403/08/17",
    price: 980000,
    class: "business",
    availableSeats: 32,
    duration: "15 ساعت و 30 دقیقه",
  },
  {
    id: "T005",
    trainNumber: "۴۲۱",
    from: "مشهد",
    to: "تهران",
    departureTime: "21:00",
    arrivalTime: "09:00",
    date: "1403/08/18",
    price: 870000,
    class: "sleeper",
    availableSeats: 20,
    duration: "12 ساعت",
  },
  {
    id: "T006",
    trainNumber: "۳۰۹",
    from: "اصفهان",
    to: "تهران",
    departureTime: "15:30",
    arrivalTime: "22:00",
    date: "1403/08/19",
    price: 460000,
    class: "economy",
    availableSeats: 56,
    duration: "6 ساعت و 30 دقیقه",
  },
]
