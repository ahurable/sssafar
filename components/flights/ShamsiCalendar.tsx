"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Calendar as CalendarIcon, X, Globe, AlertCircle } from "lucide-react"
import { 
  toJalaali, 
  toGregorian, 
  getJalaaliDaysInMonth, 
  getJalaaliFirstDayOfMonth,
  getTodayJalaali,
  getTodayGregorian,
  compareJalaaliDates,
  isJalaaliDateAfterOrEqual,
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
  errorColor?: string,
  normalReturnCal?: boolean,
  returnCal?: boolean
}

const ShamsiDateModal = ({
  departureDate,
  returnDate,
  tripType,
  onDepartureDateChange,
  onReturnDateChange,
  onTripTypeChange,
  error,
  errorColor,
  normalReturnCal,
  returnCal
}: ShamsiDateModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDepartureDate, setSelectedDepartureDate] = useState<string>(departureDate)
  const [selectedReturnDate, setSelectedReturnDate] = useState<string>(returnDate)
  const [localTripType, setLocalTripType] = useState<string>(tripType)
  const [calendarType, setCalendarType] = useState<"shamsi" | "gregorian">("shamsi")
  const [selectionMode, setSelectionMode] = useState<"departure" | "return">("departure")
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [mobileCurrentMonth, setMobileCurrentMonth] = useState<Date>(new Date())
  const [hoverTooltip, setHoverTooltip] = useState({ show: false, text: "", x: 0, y: 0 })

  // REMOVED the auto-selection of today's date completely
  // No useEffect that auto-sets today's date

  useEffect(() => {
    console.log(tripType)
    if (tripType === "roundtrip")
      setLocalTripType(tripType)
    else if (tripType === "oneway") {
      setSelectionMode("departure")
    }
  }, [tripType])

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
      return shamsiToGregorianString(date) || getTodayGregorian()
    }
  }

  const convertDateFromCalendar = (date: string): string => {
    if (!date) return ""
    if (calendarType === "shamsi") {
      return date
    } else {
      return gregorianToShamsiString(date) || getTodayJalaali()
    }
  }

  const handleDateSelect = (date: string) => {
    const convertedDate = convertDateFromCalendar(date)
    
    if (localTripType === "roundtrip") {
      // If no departure date is selected, set it
      if (!selectedDepartureDate) {
        setSelectedDepartureDate(convertedDate)
        setSelectionMode('return')
      }
      // If departure is selected but return is not, set return date
      else if (selectedDepartureDate && !selectedReturnDate) {
        setSelectedReturnDate(convertedDate)
        setSelectionMode('departure')
      }
      // If both are selected, start over with new departure
      else {
        setSelectedDepartureDate(convertedDate)
        setSelectedReturnDate("")
        setSelectionMode('return')
      }
    } else {
      // For one-way trips, just set departure date
      setSelectedDepartureDate(convertedDate)
    }
  }

  const handleTripTypeChange = (type: string) => {
    setLocalTripType(type)
    if (type === "oneway") {
      setSelectedReturnDate("")
      setSelectionMode("departure")
      // NO auto-setting of today's date
    } else {
      // For roundtrip, clear both dates - no auto-selection
      setSelectedDepartureDate("")
      setSelectedReturnDate("")
      setSelectionMode("departure")
    }
  }

  const applyDates = () => {
    onDepartureDateChange(selectedDepartureDate)
    onReturnDateChange(selectedReturnDate)
    onTripTypeChange(localTripType)
    setIsOpen(false)
    setSelectionMode("departure")
  }

  const toggleCalendarType = () => {
    setCalendarType(prev => prev === "shamsi" ? "gregorian" : "shamsi")
  }

  const navigateMonths = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev)
      
      if (calendarType === "shamsi") {
        const jalaali = toJalaali(prev.getFullYear(), prev.getMonth() + 1, prev.getDate())
        let newYear = jalaali.jy
        let newMonth = jalaali.jm

        if (direction === 'prev') {
          newMonth -= 1
          if (newMonth < 1) {
            newMonth = 12
            newYear--
          }
        } else {
          newMonth += 1
          if (newMonth > 12) {
            newMonth = 1
            newYear++
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

  const navigateMobileMonths = (direction: 'prev' | 'next') => {
    setMobileCurrentMonth(prev => {
      const newDate = new Date(prev)
      
      if (calendarType === "shamsi") {
        const jalaali = toJalaali(prev.getFullYear(), prev.getMonth() + 1, prev.getDate())
        let newYear = jalaali.jy
        let newMonth = jalaali.jm

        if (direction === 'prev') {
          newMonth -= 1
          if (newMonth < 1) {
            newMonth = 12
            newYear--
          }
        } else {
          newMonth += 1
          if (newMonth > 12) {
            newMonth = 1
            newYear++
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

  const getTodayDate = (): string => {
    return calendarType === "shamsi" ? getTodayJalaali() : getTodayGregorian()
  }

  const renderError = () => {
      if (!error) return null
      
      return (
          <div className={`flex items-center gap-2 mt-2 ${errorColor === "red" ? 'text-red-800' : 'text-black'} text-sm`}>
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
          </div>
      )
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSelectionMode("departure")
    }
  }

  const getDisplayMonthNames = () => {
    if (calendarType === "shamsi") {
      const firstMonthJalaali = toJalaali(currentMonth.getFullYear(), currentMonth.getMonth() + 1, currentMonth.getDate())
      
      let secondMonth = firstMonthJalaali.jm + 1
      let secondYear = firstMonthJalaali.jy
      if (secondMonth > 12) {
        secondMonth = 1
        secondYear++
      }
      
      const shamsiMonths = [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
      ]
      
      return {
        firstMonth: `${shamsiMonths[firstMonthJalaali.jm - 1]} ${firstMonthJalaali.jy}`,
        secondMonth: `${shamsiMonths[secondMonth - 1]} ${secondYear}`
      }
    } else {
      const firstMonth = currentMonth
      const secondMonth = new Date(currentMonth)
      secondMonth.setMonth(secondMonth.getMonth() + 1)
      
      const gregorianMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
      
      return {
        firstMonth: `${gregorianMonths[firstMonth.getMonth()]} ${firstMonth.getFullYear()}`,
        secondMonth: `${gregorianMonths[secondMonth.getMonth()]} ${secondMonth.getFullYear()}`
      }
    }
  }

  const getMobileMonthNames = () => {
    if (calendarType === "shamsi") {
      const firstMonthJalaali = toJalaali(mobileCurrentMonth.getFullYear(), mobileCurrentMonth.getMonth() + 1, mobileCurrentMonth.getDate())
      
      let secondMonth = firstMonthJalaali.jm + 1
      let secondYear = firstMonthJalaali.jy
      if (secondMonth > 12) {
        secondMonth = 1
        secondYear++
      }
      
      const shamsiMonths = [
        "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
        "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
      ]
      
      return {
        firstMonth: `${shamsiMonths[firstMonthJalaali.jm - 1]} ${firstMonthJalaali.jy}`,
        secondMonth: `${shamsiMonths[secondMonth - 1]} ${secondYear}`
      }
    } else {
      const firstMonth = mobileCurrentMonth
      const secondMonth = new Date(mobileCurrentMonth)
      secondMonth.setMonth(secondMonth.getMonth() + 1)
      
      const gregorianMonths = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ]
      
      return {
        firstMonth: `${gregorianMonths[firstMonth.getMonth()]} ${firstMonth.getFullYear()}`,
        secondMonth: `${gregorianMonths[secondMonth.getMonth()]} ${secondMonth.getFullYear()}`
      }
    }
  }

  const handleDateHover = (event: React.MouseEvent, day: number | null) => {
    if (!day) {
      setHoverTooltip({ show: false, text: "", x: 0, y: 0 })
      return
    }

    const tooltipText = selectionMode === "departure" ? "تاریخ رفت" : "تاریخ برگشت"
    
    setHoverTooltip({
      show: true,
      text: tooltipText,
      x: event.clientX,
      y: event.clientY
    })
  }

  const handleDateHoverLeave = () => {
    setHoverTooltip({ show: false, text: "", x: 0, y: 0 })
  }

  const monthNames = getDisplayMonthNames()
  const mobileMonthNames = getMobileMonthNames()

  return (
    <>
      {/* Hover Tooltip for Desktop */}
      {hoverTooltip.show && (
        <div 
          className="fixed z-50 px-3 py-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg pointer-events-none transition-opacity duration-200 hidden md:block"
          style={{
            left: hoverTooltip.x + 15,
            top: hoverTooltip.y - 40,
          }}
        >
          {hoverTooltip.text}
          <div 
            className="absolute w-3 h-3 bg-gray-800 transform rotate-45 -left-1 top-1/2 -translate-y-1/2"
            style={{ left: '-6px' }}
          />
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <div className="space-y-2 cursor-pointer">
            <div className="relative">
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <div className="w-full h-12 border border-gray-300 bg-[#fffefe] text-black flex items-center justify-between px-3 pr-10 cursor-pointer">
                <span className="text-black">
                  {returnCal && returnCal ? formatDate(returnDate) : formatDate(departureDate)}
                </span>
              </div>
            </div>
            {renderError()}
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-4xl p-0 bg-[#fffefe] border border-gray-300">
          {/* Desktop View */}
          <div className="hidden md:block p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">انتخاب تاریخ</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={toggleCalendarType}
                  className="flex items-center gap-2 border border-gray-300 bg-[#fffefe] text-black hover:bg-gray-100"
                >
                  <Globe className="h-4 w-4" />
                  {calendarType === "shamsi" ? "تقویم میلادی" : "Shamsi Calendar"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 border border-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {!normalReturnCal && (
              <div className="flex items-center gap-4 mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localTripType === "roundtrip"}
                    onChange={(e) => handleTripTypeChange(e.target.checked ? "roundtrip" : "oneway")}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-black">رفت و برگشت</span>
                </label>
              </div>
            )}

            {localTripType === "roundtrip" && (
              <div className="flex bg-gray-100 p-1 mb-4">
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    selectionMode === "departure"
                      ? "bg-[#fffefe] text-blue-800"
                      : "text-black hover:text-black"
                  }`}
                  onClick={() => setSelectionMode("departure")}
                >
                  تاریخ رفت
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    selectionMode === "return"
                      ? "bg-[#fffefe] text-blue-800"
                      : "text-black hover:text-black"
                  } ${!selectedDepartureDate ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => selectedDepartureDate && setSelectionMode("return")}
                  disabled={!selectedDepartureDate}
                >
                  تاریخ برگشت
                </button>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonths('prev')}
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-lg border border-gray-300"
                >
                  ‹
                </Button>
                
                <div className="flex gap-4 text-md font-bold text-black">
                  <span>{monthNames.firstMonth}</span>
                  <span>—</span>
                  <span>{monthNames.secondMonth}</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => navigateMonths('next')}
                  className="h-8 w-8 p-0 hover:bg-gray-100 text-lg border border-gray-300"
                >
                  ›
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Calendar
                  baseDate={currentMonth}
                  selectedDepartureDate={convertDateForCalendar(selectedDepartureDate)}
                  selectedReturnDate={convertDateForCalendar(selectedReturnDate)}
                  onDateSelect={handleDateSelect}
                  minDate={getTodayDate()}
                  calendarType={calendarType}
                  selectionMode={selectionMode}
                  tripType={localTripType}
                  isFirstMonth={true}
                  onDateHover={handleDateHover}
                  onDateHoverLeave={handleDateHoverLeave}
                />

                <Calendar
                  baseDate={currentMonth}
                  selectedDepartureDate={convertDateForCalendar(selectedDepartureDate)}
                  selectedReturnDate={convertDateForCalendar(selectedReturnDate)}
                  onDateSelect={handleDateSelect}
                  minDate={getTodayDate()}
                  calendarType={calendarType}
                  selectionMode={selectionMode}
                  tripType={localTripType}
                  isFirstMonth={false}
                  onDateHover={handleDateHover}
                  onDateHoverLeave={handleDateHoverLeave}
                />
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <Button
                onClick={() => setIsOpen(false)}
                variant="outline"
                className="flex-1 h-10 text-black border border-gray-300 bg-[#fffefe] hover:bg-gray-100"
              >
                انصراف
              </Button>
              <Button
                onClick={applyDates}
                className="flex-1 h-10 bg-blue-500 text-white hover:bg-blue-900"
              >
                اعمال تاریخ
              </Button>
            </div>
          </div>

          {/* Mobile View */}
          <div className="block md:hidden max-h-[90vh] bg-[#fffefe] flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-gray-300 sticky top-0 bg-[#fffefe] z-10">
              <h2 className="text-lg font-bold text-black">انتخاب تاریخ</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleCalendarType}
                  className="flex items-center gap-1 text-sm border border-gray-300 bg-[#fffefe] text-black hover:bg-gray-100"
                >
                  <Globe className="h-3 w-3" />
                  {calendarType === "shamsi" ? "شمسی" : "میلادی"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 border border-gray-300"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {!normalReturnCal && (
              <div className="p-3 border-b border-gray-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localTripType === "roundtrip"}
                    onChange={(e) => handleTripTypeChange(e.target.checked ? "roundtrip" : "oneway")}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-black">رفت و برگشت</span>
                </label>
              </div>
            )}

            {localTripType === "roundtrip" && (
              <div className="flex bg-gray-100 p-1 mx-3 mt-3">
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    selectionMode === "departure"
                      ? "bg-[#fffefe] text-blue-800"
                      : "text-black hover:text-black"
                  }`}
                  onClick={() => setSelectionMode("departure")}
                >
                  تاریخ رفت
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${
                    selectionMode === "return"
                      ? "bg-[#fffefe] text-blue-800"
                      : "text-black hover:text-black"
                  } ${!selectedDepartureDate ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => selectedDepartureDate && setSelectionMode("return")}
                  disabled={!selectedDepartureDate}
                >
                  تاریخ برگشت
                </button>
              </div>
            )}

            {/* Mobile Calendar Navigation */}
            <div className="flex justify-between items-center p-3 border-b border-gray-300">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMobileMonths('prev')}
                className="h-8 w-8 p-0 hover:bg-gray-100 text-lg border border-gray-300"
              >
                ‹
              </Button>
              
              <div className="flex flex-col items-center text-sm font-bold text-black">
                <span>{mobileMonthNames.firstMonth}</span>
                <span className="text-xs text-gray-500">و</span>
                <span>{mobileMonthNames.secondMonth}</span>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMobileMonths('next')}
                className="h-8 w-8 p-0 hover:bg-gray-100 text-lg border border-gray-300"
              >
                ›
              </Button>
            </div>

            {/* Mobile Calendar Grid - Two months stacked vertically */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-3">
                {/* First Month */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <Calendar
                    baseDate={mobileCurrentMonth}
                    selectedDepartureDate={convertDateForCalendar(selectedDepartureDate)}
                    selectedReturnDate={convertDateForCalendar(selectedReturnDate)}
                    onDateSelect={handleDateSelect}
                    minDate={getTodayDate()}
                    calendarType={calendarType}
                    selectionMode={selectionMode}
                    tripType={localTripType}
                    isFirstMonth={true}
                    isMobile={true}
                  />
                </div>

                {/* Second Month */}
                <div className="bg-white rounded-lg border border-gray-200">
                  <Calendar
                    baseDate={mobileCurrentMonth}
                    selectedDepartureDate={convertDateForCalendar(selectedDepartureDate)}
                    selectedReturnDate={convertDateForCalendar(selectedReturnDate)}
                    onDateSelect={handleDateSelect}
                    minDate={getTodayDate()}
                    calendarType={calendarType}
                    selectionMode={selectionMode}
                    tripType={localTripType}
                    isFirstMonth={false}
                    isMobile={true}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="p-3 border-t border-gray-300 bg-[#fffefe]">
              <div className="flex gap-2">
                <Button
                  onClick={() => setIsOpen(false)}
                  variant="outline"
                  className="flex-1 h-10 text-black border border-gray-300 bg-[#fffefe] hover:bg-gray-100"
                >
                  انصراف
                </Button>
                <Button
                  onClick={applyDates}
                  className="flex-1 h-10 bg-blue-500 text-white hover:bg-blue-900"
                >
                  اعمال تاریخ
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Calendar Component
interface CalendarProps {
  baseDate: Date
  selectedDepartureDate: string
  selectedReturnDate: string
  onDateSelect: (date: string) => void
  minDate: string
  calendarType: "shamsi" | "gregorian"
  selectionMode: "departure" | "return"
  tripType: string
  isFirstMonth: boolean
  isMobile?: boolean
  onDateHover?: (event: React.MouseEvent, day: number | null) => void
  onDateHoverLeave?: () => void
}

const Calendar = ({
  baseDate,
  selectedDepartureDate,
  selectedReturnDate,
  onDateSelect,
  minDate,
  calendarType,
  selectionMode,
  tripType,
  isFirstMonth,
  isMobile = false,
  onDateHover,
  onDateHoverLeave
}: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const date = new Date(baseDate)
    if (!isFirstMonth) {
      if (calendarType === "shamsi") {
        const jalaali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
        let nextYear = jalaali.jy
        let nextMonth = jalaali.jm + 1
        if (nextMonth > 12) {
          nextMonth = 1
          nextYear++
        }
        const gregorian = toGregorian(nextYear, nextMonth, 1)
        return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd)
      } else {
        const nextMonth = new Date(date)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        return nextMonth
      }
    }
    return date
  })

  useEffect(() => {
    const date = new Date(baseDate)
    if (!isFirstMonth) {
      if (calendarType === "shamsi") {
        const jalaali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
        let nextYear = jalaali.jy
        let nextMonth = jalaali.jm + 1
        if (nextMonth > 12) {
          nextMonth = 1
          nextYear++
        }
        const gregorian = toGregorian(nextYear, nextMonth, 1)
        setCurrentDate(new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd))
      } else {
        const nextMonth = new Date(date)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        setCurrentDate(nextMonth)
      }
    } else {
      setCurrentDate(date)
    }
  }, [baseDate, calendarType, isFirstMonth])

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
      return new Date(year, month - 1, 1).getDay()
    }
  }

  const generateCalendar = () => {
    const year = getCurrentYear()
    const month = getCurrentMonth()
    const daysInMonth = getDaysInMonth(year, month)
    const firstDay = getFirstDayOfMonth(year, month)
    
    const calendar = []
    let dayCounter = 1

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
      const isBeforeMin = !isJalaaliDateAfterOrEqual(dateStr, minDate)
      
      if (tripType === "roundtrip" && selectionMode === "return" && selectedDepartureDate) {
        const isBeforeDeparture = compareJalaaliDates(dateStr, selectedDepartureDate) < 0
        return isBeforeMin || isBeforeDeparture
      }
      
      return isBeforeMin
    } else {
      const dateObj = new Date(dateStr)
      const minDateObj = new Date(minDate)
      const isBeforeMin = dateObj < minDateObj
      
      if (tripType === "roundtrip" && selectionMode === "return" && selectedDepartureDate) {
        const departureDateObj = new Date(selectedDepartureDate)
        const isBeforeDeparture = dateObj < departureDateObj
        return isBeforeMin || isBeforeDeparture
      }
      
      return isBeforeMin
    }
  }

  const isDateSelected = (day: number): boolean => {
    const year = getCurrentYear()
    const month = getCurrentMonth()
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    return dateStr === selectedDepartureDate || dateStr === selectedReturnDate
  }

  const isDateInRange = (day: number): boolean => {
    if (tripType !== "roundtrip" || !selectedDepartureDate || !selectedReturnDate) {
      return false
    }
    
    const year = getCurrentYear()
    const month = getCurrentMonth()
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    if (calendarType === "shamsi") {
      return compareJalaaliDates(dateStr, selectedDepartureDate) > 0 && 
             compareJalaaliDates(dateStr, selectedReturnDate) < 0
    } else {
      const dateObj = new Date(dateStr)
      const departureObj = new Date(selectedDepartureDate)
      const returnObj = new Date(selectedReturnDate)
      return dateObj > departureObj && dateObj < returnObj
    }
  }

  const isStartOfRange = (day: number): boolean => {
    const year = getCurrentYear()
    const month = getCurrentMonth()
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return dateStr === selectedDepartureDate
  }

  const isEndOfRange = (day: number): boolean => {
    const year = getCurrentYear()
    const month = getCurrentMonth()
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return dateStr === selectedReturnDate
  }

  const getMonthName = (): string => {
    const year = getCurrentYear()
    const month = getCurrentMonth()
    
    if (calendarType === "shamsi") {
      return shamsiMonths[month - 1]
    } else {
      return gregorianMonths[month - 1]
    }
  }

  const handleDateMouseEnter = (event: React.MouseEvent, day: number | null) => {
    if (onDateHover && !isMobile && day && !isDateDisabled(day)) {
      onDateHover(event, day)
    }
  }

  const handleDateMouseLeave = () => {
    if (onDateHoverLeave && !isMobile) {
      onDateHoverLeave()
    }
  }

  const calendar = generateCalendar()

  return (
    <div className={`bg-[#fffefe] ${isMobile ? 'p-2' : 'p-3'}`}>
    
      <div className="text-center mb-3">
        <div className="text-md font-bold text-black">
          {getMonthName()} {getCurrentYear()}
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-xs font-medium text-black py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {calendar.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <button
              key={`${weekIndex}-${dayIndex}`}
              className={`aspect-square flex items-center justify-center text-xs font-medium relative
                ${!day 
                  ? 'invisible' 
                  : isDateDisabled(day)
                    ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                    : isDateSelected(day)
                      ? 'bg-blue-800 text-white'
                      : isDateInRange(day)
                        ? 'bg-gray-200 text-black'
                        : 'text-black bg-[#fffefe] hover:bg-gray-100 cursor-pointer border border-transparent'
                }
              `}
              onClick={() => day && !isDateDisabled(day) && handleDateClick(day)}
              onMouseEnter={(e) => handleDateMouseEnter(e, day)}
              onMouseLeave={handleDateMouseLeave}
              disabled={!day || isDateDisabled(day)}
            >
              {day?.toLocaleString('fa-IR')}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default ShamsiDateModal