"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, X, Globe, AlertCircle } from "lucide-react"
import { 
  toJalaali, 
  toGregorian, 
  jalaaliToDateObject, 
  getJalaaliDaysInMonth, 
  getJalaaliFirstDayOfMonth,
  getTodayJalaali,
  getTodayGregorian,
  compareJalaaliDates,
  isJalaaliDateAfterOrEqual,
  dateToJalaaliString,
  gregorianToShamsiString,
  shamsiToGregorianString
} from "@/lib/jalaalil"

interface ShamsiDateModalProps {
  departureDate: string
  returnDate: string
  tripType: string
  onDepartureDateChange: (date: string) => void
  onReturnDateChange: (date: string) => void
  onTripTypeChange: (type: string) => void
  error?: string,
  errorColor?: string
}

const ShamsiDateModal = ({
  departureDate,
  returnDate,
  tripType,
  onDepartureDateChange,
  onReturnDateChange,
  onTripTypeChange,
  error,
  errorColor
}: ShamsiDateModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDepartureDate, setSelectedDepartureDate] = useState<string>(departureDate)
  const [selectedReturnDate, setSelectedReturnDate] = useState<string>(returnDate)
  const [localTripType, setLocalTripType] = useState<string>(tripType)
  const [calendarType, setCalendarType] = useState<"shamsi" | "gregorian">("shamsi")

  // Initialize with current date if no date is selected
  useEffect(() => {
    if (!selectedDepartureDate) {
      setSelectedDepartureDate(calendarType === "shamsi" ? getTodayJalaali() : getTodayGregorian())
    }
  }, [selectedDepartureDate, calendarType])

  const formatDate = (date: string): string => {
    if (!date) return "انتخاب تاریخ"
    
    try {
      if (calendarType === "shamsi") {
        const [year, month, day] = date.split('-')
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
        
        const formatNumber = (num: string): string => {
          return num.split('').map(char => persianNumbers[parseInt(char)] || char).join('')
        }
        
        return `${formatNumber(day)}/${formatNumber(month)}/${formatNumber(year)}`
      } else {
        const [year, month, day] = date.split('-')
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']
        
        const formatNumber = (num: string): string => {
          return num.split('').map(char => persianNumbers[parseInt(char)] || char).join('')
        }
        
        return `${formatNumber(day)}/${formatNumber(month)}/${formatNumber(year)}`
      }
    } catch (error) {
      return "تاریخ نامعتبر"
    }
  }

  const convertDateForCalendar = (date: string): string => {
    if (!date) return ""
    if (calendarType === "shamsi") {
      return date
    } else {
      // Convert Shamsi to Gregorian for display in Gregorian calendar
      return shamsiToGregorianString(date) || getTodayGregorian()
    }
  }

  const convertDateFromCalendar = (date: string): string => {
    if (!date) return ""
    if (calendarType === "shamsi") {
      return date
    } else {
      // Convert Gregorian back to Shamsi for storage
      return gregorianToShamsiString(date) || getTodayJalaali()
    }
  }

  const handleDepartureDateSelect = (date: string) => {
    const convertedDate = convertDateFromCalendar(date)
    setSelectedDepartureDate(convertedDate)
    // If return date is before new departure date, clear return date
    if (selectedReturnDate) {
      const currentReturnDate = convertDateForCalendar(selectedReturnDate)
      if (compareDates(currentReturnDate, date, calendarType) < 0) {
        setSelectedReturnDate("")
      }
    }
  }

  const handleReturnDateSelect = (date: string) => {
    const convertedDate = convertDateFromCalendar(date)
    setSelectedReturnDate(convertedDate)
  }

  const handleTripTypeChange = (type: string) => {
    setLocalTripType(type)
    if (type === "oneway") {
      setSelectedReturnDate("")
    }
  }

  const applyDates = () => {
    onDepartureDateChange(selectedDepartureDate)
    onReturnDateChange(selectedReturnDate)
    onTripTypeChange(localTripType)
    setIsOpen(false)
  }

  const toggleCalendarType = () => {
    setCalendarType(prev => prev === "shamsi" ? "gregorian" : "shamsi")
  }

  const compareDates = (date1: string, date2: string, type: "shamsi" | "gregorian"): number => {
    if (type === "shamsi") {
      return compareJalaaliDates(date1, date2)
    } else {
      return new Date(date1).getTime() - new Date(date2).getTime()
    }
  }

  const getTodayDate = (): string => {
    return calendarType === "shamsi" ? getTodayJalaali() : getTodayGregorian()
  }

  const getMinDate = (baseDate?: string): string => {
    const today = getTodayDate()
    if (!baseDate) return today
    
    if (calendarType === "shamsi") {
      return compareJalaaliDates(baseDate, today) > 0 ? baseDate : today
    } else {
      const baseDateObj = new Date(baseDate)
      const todayObj = new Date(today)
      return baseDateObj > todayObj ? baseDate : today
    }
  }

  const renderError = () => {
      if (!error) return null
      
      return (
          <div className={`flex items-center gap-2 mt-2 ${errorColor == "red" ? 'text-red-600' : 'text-white'  } text-sm animate-fadeIn`}>
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
          </div>
      )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className="space-y-3 cursor-pointer">
          <Label htmlFor="departure-date-trigger" className="text-lg font-bold text-white text-right block">
            تاریخ رفت
          </Label>
          <div className="relative">
            <CalendarIcon className="absolute right-4 top-4 h-5 w-5 text-gray-400" />
            <div className="w-full h-14 rounded-2xl border-2 border-gray-300 bg-white text-gray-800 text-lg font-medium transition-all duration-300 hover:border-blue-400 focus:border-blue-500 flex items-center justify-between px-4 pr-12 cursor-pointer">
              <span className="text-gray-800">
                {formatDate(departureDate)}
              </span>
            </div>
          </div>
          {renderError()}
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl p-0 bg-white rounded-3xl overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800">انتخاب تاریخ</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={toggleCalendarType}
                className="flex items-center gap-2"
              >
                <Globe className="h-4 w-4" />
                {calendarType === "shamsi" ? "تقویم شمسی" : "Gregorian Calendar"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localTripType === "roundtrip"}
                onChange={(e) => handleTripTypeChange(e.target.checked ? "roundtrip" : "oneway")}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-lg font-medium text-gray-800">رفت و برگشت</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Departure Calendar */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 text-center">تاریخ رفت</h3>
              <Calendar
                selectedDate={convertDateForCalendar(selectedDepartureDate)}
                onDateSelect={handleDepartureDateSelect}
                minDate={getTodayDate()}
                isActive={true}
                calendarType={calendarType}
              />
            </div>

            {/* Return Calendar */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-800 text-center">تاریخ برگشت</h3>
              <Calendar
                selectedDate={convertDateForCalendar(selectedReturnDate)}
                onDateSelect={handleReturnDateSelect}
                minDate={getMinDate(convertDateForCalendar(selectedDepartureDate))}
                isActive={localTripType === "roundtrip"}
                calendarType={calendarType}
              />
            </div>
          </div>

          <div className="flex gap-4 mt-8">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="flex-1 h-12 text-lg font-medium rounded-xl"
            >
              انصراف
            </Button>
            <Button
              onClick={applyDates}
              className="flex-1 h-12 text-lg font-medium rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              اعمال تاریخ
            </Button>
          </div>
        </div>

        {/* Mobile View - Fullscreen */}
        <div className="block md:hidden h-screen bg-white">
          <div className="flex justify-between items-center p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">انتخاب تاریخ</h2>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleCalendarType}
                className="flex items-center gap-1 text-sm"
              >
                <Globe className="h-3 w-3" />
                {calendarType === "shamsi" ? "شمسی" : "میلادی"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-4 border-b border-gray-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={localTripType === "roundtrip"}
                onChange={(e) => handleTripTypeChange(e.target.checked ? "roundtrip" : "oneway")}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-lg font-medium text-gray-800">رفت و برگشت</span>
            </label>
          </div>

          <div className="h-[calc(100vh-140px)] overflow-y-auto">
            {/* Departure Calendar - Mobile */}
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 text-center mb-4">تاریخ رفت</h3>
              <Calendar
                selectedDate={convertDateForCalendar(selectedDepartureDate)}
                onDateSelect={handleDepartureDateSelect}
                minDate={getTodayDate()}
                isActive={true}
                calendarType={calendarType}
                isMobile={true}
              />
            </div>

            {/* Return Calendar - Mobile */}
            {localTripType === "roundtrip" && (
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 text-center mb-4">تاریخ برگشت</h3>
                <Calendar
                  selectedDate={convertDateForCalendar(selectedReturnDate)}
                  onDateSelect={handleReturnDateSelect}
                  minDate={getMinDate(convertDateForCalendar(selectedDepartureDate))}
                  isActive={true}
                  calendarType={calendarType}
                  isMobile={true}
                />
              </div>
            )}
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
            <Button
              onClick={applyDates}
              className="w-full h-12 text-lg font-medium rounded-xl bg-blue-600 hover:bg-blue-700"
            >
              اعمال تاریخ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Calendar Component (Supports both Shamsi and Gregorian)
interface CalendarProps {
  selectedDate: string
  onDateSelect: (date: string) => void
  minDate: string
  isActive: boolean
  calendarType: "shamsi" | "gregorian"
  isMobile?: boolean
}

const Calendar = ({
  selectedDate,
  onDateSelect,
  minDate,
  isActive,
  calendarType,
  isMobile = false
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    if (selectedDate) {
      return calendarType === "shamsi" 
        ? jalaaliToDateObject(selectedDate)
        : new Date(selectedDate)
    }
    return new Date()
  })

  const shamsiMonths = [
    "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
    "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
  ]

  const gregorianMonths = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ]

  const weekDays = calendarType === "shamsi" 
    ? ["ش", "ی", "د", "س", "چ", "پ", "ج"]
    : ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

  const getCurrentYear = (): number => {
    if (calendarType === "shamsi") {
      const jalaali = toJalaali(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())
      return jalaali.jy
    }
    return currentDate.getFullYear()
  }

  const getCurrentMonth = (): number => {
    if (calendarType === "shamsi") {
      const jalaali = toJalaali(currentDate.getFullYear(), currentDate.getMonth() + 1, currentDate.getDate())
      return jalaali.jm
    }
    return currentDate.getMonth() + 1
  }

  const getDaysInMonth = (year: number, month: number): number => {
    if (calendarType === "shamsi") {
      return getJalaaliDaysInMonth(year, month)
    } else {
      return new Date(year, month, 0).getDate()
    }
  }

  const getFirstDayOfMonth = (year: number, month: number): number => {
    if (calendarType === "shamsi") {
      return getJalaaliFirstDayOfMonth(year, month)
    } else {
      return new Date(year, month - 1, 1).getDay() // 0-6 where 0 is Sunday
    }
  }

  const generateCalendar = () => {
    const year = getCurrentYear()
    const month = getCurrentMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    const calendar = []
    let dayCounter = 1

    // Adjust first day for Gregorian calendar (Sunday = 0)
    const adjustedFirstDay = calendarType === "shamsi" ? firstDay : (firstDay + 1) % 7

    for (let week = 0; week < 6; week++) {
      const weekDays = []
      for (let day = 0; day < 7; day++) {
        if ((week === 0 && day < adjustedFirstDay) || dayCounter > daysInMonth) {
          weekDays.push(null)
        } else {
          weekDays.push(dayCounter)
          dayCounter++
        }
      }
      calendar.push(weekDays)
      if (dayCounter > daysInMonth) break
    }

    return calendar
  }

  const handleDateClick = (day: number) => {
    if (!isActive) return
    
    const year = getCurrentYear()
    const month = getCurrentMonth()
    const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    onDateSelect(date)
  }

  const isDateDisabled = (day: number): boolean => {
    const year = getCurrentYear()
    const month = getCurrentMonth()
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    if (calendarType === "shamsi") {
      return !isJalaaliDateAfterOrEqual(dateStr, minDate)
    } else {
      return new Date(dateStr) < new Date(minDate)
    }
  }

  const isDateSelected = (day: number): boolean => {
    if (!selectedDate) return false
    
    try {
      const [year, month, selectedDay] = selectedDate.split('-')
      const currentYear = getCurrentYear()
      const currentMonth = getCurrentMonth()
      
      return parseInt(year) === currentYear && 
             parseInt(month) === currentMonth && 
             parseInt(selectedDay) === day
    } catch (error) {
      return false
    }
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    if (!isActive) return

    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (calendarType === "shamsi") {
        const jalaali = toJalaali(prev.getFullYear(), prev.getMonth() + 1, prev.getDate())
        let newYear = jalaali.jy
        let newMonth = jalaali.jm

        if (direction === 'prev') {
          if (newMonth === 1) {
            newMonth = 12
            newYear--
          } else {
            newMonth--
          }
        } else {
          if (newMonth === 12) {
            newMonth = 1
            newYear++
          } else {
            newMonth++
          }
        }

        const gregorian = toGregorian(newYear, newMonth, 1)
        return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd)
      } else {
        if (direction === 'prev') {
          newDate.setMonth(newDate.getMonth() - 1)
        } else {
          newDate.setMonth(newDate.getMonth() + 1)
        }
        return newDate
      }
    })
  }

  const getMonthName = (): string => {
    const year = getCurrentYear()
    const month = getCurrentMonth()
    
    if (calendarType === "shamsi") {
      return `${shamsiMonths[month - 1]} ${year}`
    } else {
      return `${gregorianMonths[month - 1]} ${year}`
    }
  }

  const calendar = generateCalendar()

  return (
    <div className={`bg-white rounded-lg ${isMobile ? 'p-2' : 'p-4'} ${!isActive ? 'opacity-50' : ''}`}>
      {/* Calendar Header */}
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth('prev')}
          disabled={!isActive}
          className="h-8 w-8 p-0 hover:bg-gray-100 text-lg"
        >
          ‹
        </Button>
        
        <div className="text-lg font-bold text-gray-800">
          {getMonthName()}
        </div>
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth('next')}
          disabled={!isActive}
          className="h-8 w-8 p-0 hover:bg-gray-100 text-lg"
        >
          ›
        </Button>
      </div>

      {/* Week Days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendar.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <button
              key={`${weekIndex}-${dayIndex}`}
              className={`aspect-square flex items-center justify-center rounded-lg text-sm font-medium transition-all
                ${!day 
                  ? 'invisible' 
                  : isDateDisabled(day)
                    ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                    : isDateSelected(day)
                      ? 'bg-blue-600 text-white shadow-md scale-105'
                      : 'text-gray-700 bg-white hover:bg-blue-50 hover:scale-105 cursor-pointer border border-transparent hover:border-blue-200'
                } 
                ${!isActive && day ? 'cursor-not-allowed' : ''}
              `}
              onClick={() => day && !isDateDisabled(day) && handleDateClick(day)}
              disabled={!day || isDateDisabled(day) || !isActive}
            >
              {day}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default ShamsiDateModal