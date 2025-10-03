export interface Flight {
  id: string
  airline: string
  flightNumber: string
  from: string
  to: string
  departureTime: string
  arrivalTime: string
  date: string
  price: number
  class: "economy" | "business" | "first"
  availableSeats: number
  duration: string
}

export const flights: Flight[] = [
  {
    id: "F001",
    airline: "ایران ایر",
    flightNumber: "IR701",
    from: "تهران",
    to: "مشهد",
    departureTime: "08:30",
    arrivalTime: "10:00",
    date: "1403/08/15",
    price: 1200000,
    class: "economy",
    availableSeats: 45,
    duration: "1 ساعت و 30 دقیقه",
  },
  {
    id: "F002",
    airline: "ماهان",
    flightNumber: "W5101",
    from: "تهران",
    to: "اصفهان",
    departureTime: "14:00",
    arrivalTime: "15:15",
    date: "1403/08/15",
    price: 950000,
    class: "economy",
    availableSeats: 32,
    duration: "1 ساعت و 15 دقیقه",
  },
  {
    id: "F003",
    airline: "قشم ایر",
    flightNumber: "QB201",
    from: "تهران",
    to: "کیش",
    departureTime: "09:45",
    arrivalTime: "11:30",
    date: "1403/08/16",
    price: 1450000,
    class: "economy",
    availableSeats: 28,
    duration: "1 ساعت و 45 دقیقه",
  },
  {
    id: "F004",
    airline: "ایران ایر",
    flightNumber: "IR305",
    from: "تهران",
    to: "شیراز",
    departureTime: "16:30",
    arrivalTime: "18:00",
    date: "1403/08/16",
    price: 1100000,
    class: "economy",
    availableSeats: 52,
    duration: "1 ساعت و 30 دقیقه",
  },
  {
    id: "F005",
    airline: "ماهان",
    flightNumber: "W5505",
    from: "مشهد",
    to: "تهران",
    departureTime: "11:00",
    arrivalTime: "12:30",
    date: "1403/08/17",
    price: 1250000,
    class: "business",
    availableSeats: 12,
    duration: "1 ساعت و 30 دقیقه",
  },
  {
    id: "F006",
    airline: "آسمان",
    flightNumber: "EP401",
    from: "تهران",
    to: "تبریز",
    departureTime: "07:00",
    arrivalTime: "08:30",
    date: "1403/08/18",
    price: 1050000,
    class: "economy",
    availableSeats: 38,
    duration: "1 ساعت و 30 دقیقه",
  },
]
