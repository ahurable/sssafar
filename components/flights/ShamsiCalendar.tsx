"use client"
import { useState, useEffect, useRef, RefObject } from "react"
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
import { shamsiToGregorian } from "./utils"

interface ShamsiDateModalProps {
  departureDate: string
  returnDate: string
  tripType: string
  onDepartureDateChange: (date: string) => void
  onReturnDateChange: (date: string) => void
  onTripTypeChange: (type: string) => void
  error?: string
  errorColor?: string
  normalReturnCal?: boolean
  returnCal?: boolean
  // New props for multi-calendar management
  calendarId: string
  origin?: string
  destination?: string
  calendarFor?: string
  isOpen?: boolean
  onOpenChange?: (calendarId: string | null) => void
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
  returnCal,
  calendarId,
  origin,
  destination,
  calendarFor,
  isOpen: externalIsOpen,
  onOpenChange
}: ShamsiDateModalProps) => {
  // Use internal state if not controlled externally
  const [internalIsOpen, setInternalIsOpen] = useState(false)
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open ? calendarId : null)
    } else {
      setInternalIsOpen(open)
    }
  }

  const [mobile, setMobile] = useState(false)
  const [selectedDepartureDate, setSelectedDepartureDate] = useState<string>(departureDate)
  const [selectedReturnDate, setSelectedReturnDate] = useState<string>(returnDate)
  const [localTripType, setLocalTripType] = useState<string>(tripType)
  const [calendarType, setCalendarType] = useState<"shamsi" | "gregorian">("shamsi")
  const [selectionMode, setSelectionMode] = useState<"departure" | "return">("departure")
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [mobileCurrentMonth, setMobileCurrentMonth] = useState<Date>(new Date())
  const [hoverTooltip, setHoverTooltip] = useState({ show: false, text: "", x: 0, y: 0 })
  const [flightLowerPricesPerDay, setFlightLowerPricesPerDay] = useState()
  // Sync internal state with props
  useEffect(() => {
    setSelectedDepartureDate(departureDate)
    setSelectedReturnDate(returnDate)
    setLocalTripType(tripType)
  }, [departureDate, returnDate, tripType])

  useEffect(() => {
    if (calendarFor) {
      if (calendarFor === "HOTEL") {

      } else if (calendarFor === "FLIGHT" && origin && destination) {
        const getFlightsLowerPricesPerDay = async (origin: string, destination: string) => {
          const response = await fetch(`/api/flights/lowerPricePerDay?origin=${origin}&destination=${destination}`, {
            headers: {
              "Content-Type": "application/json"
            }
          })
          const data = await response.json()
          // console.log(data)
          setFlightLowerPricesPerDay(data)
        }
        getFlightsLowerPricesPerDay(origin, destination)
      }
    }
  }, [origin, destination])

  useEffect(() => {
    if (tripType === "roundtrip")
      setLocalTripType(tripType)
    else if (tripType === "oneway") {
      setSelectionMode("departure")
    }
  }, [tripType])

  useEffect(() => {
    if (window.screen.width < 500)
      setMobile(true)
  }, [])

  const formatDate = (date: string): string => {
    if (!date) return "انتخاب تاریخ"

    try {
      if (calendarType === "shamsi") {
        const [year, month, day] = date.split('-')
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

        const formatNumber = (num: string): string => {
          return num.split('').map(char => persianNumbers[parseInt(char)] || char).join('')
        }

        return `${formatNumber(year)}/${formatNumber(month)}/${formatNumber(day)}`
      } else {
        const [year, month, day] = date.split('-')
        const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

        const formatNumber = (num: string): string => {
          return num.split('').map(char => persianNumbers[parseInt(char)] || char).join('')
        }

        return `${formatNumber(year)}/${formatNumber(month)}/${formatNumber(day)}`
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
      if (!selectedDepartureDate) {
        setSelectedDepartureDate(convertedDate)
        setSelectionMode('return')
        // Auto-apply departure date immediately
        onDepartureDateChange(convertedDate)
      }
      else if (selectedDepartureDate && !selectedReturnDate) {
        setSelectedReturnDate(convertedDate)
        setSelectionMode('departure')
        // Auto-apply return date and close modal
        onReturnDateChange(convertedDate)
        handleOpenChange(false)
        setSelectionMode('departure')
      }
      else {
        setSelectedDepartureDate(convertedDate)
        setSelectedReturnDate("")
        setSelectionMode('return')
        // Auto-apply new departure date immediately
        onDepartureDateChange(convertedDate)
        onReturnDateChange("")
      }
    } else {
      // One-way trip: select date and close modal immediately
      setSelectedDepartureDate(convertedDate)
      onDepartureDateChange(convertedDate)
      handleOpenChange(false)
    }
  }

  const handleTripTypeChange = (type: string) => {
    setLocalTripType(type)
    onTripTypeChange(type)

    if (type === "oneway") {
      setSelectedReturnDate("")
      setSelectionMode("departure")
      onReturnDateChange("")
    } else {
      setSelectedDepartureDate("")
      setSelectedReturnDate("")
      setSelectionMode("departure")
      onDepartureDateChange("")
      onReturnDateChange("")
    }
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
      <div className={`flex items-center gap-2 mt-2 ${errorColor === "red" ? 'text-red-800' : 'text-blue-900'} text-sm`}>
        <AlertCircle className="h-4 w-4" />
        <span>{error}</span>
      </div>
    )
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

  function useOutsideClick<T extends HTMLElement>(
    callback: () => void
  ): RefObject<T> {
    const ref = useRef<T>(null);

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (ref.current && !ref.current.contains(event.target as Node)) {
          callback();
        }
      }

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [callback]);

    return ref;
  }

  const calRef = useOutsideClick<HTMLDivElement>(() => handleOpenChange(false));


  const handleDateHoverLeave = () => {
    setHoverTooltip({ show: false, text: "", x: 0, y: 0 })
  }

  const monthNames = getDisplayMonthNames()
  const mobileMonthNames = getMobileMonthNames()

  return (
    <>
      {/* Hover Tooltip for Desktop */}
      {isOpen && hoverTooltip.show && (
        <div
          className="fixed z-40 px-3 py-2 text-sm bg-gray-800 text-white rounded-lg shadow-lg pointer-events-none transition-opacity duration-200 hidden md:block"
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

      {/* Desktop Absolute Calendar */}
      <div className="hidden md:block relative">
        <div className="space-y-2 cursor-pointer">
          <div className="relative">
            <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
            <div
              className="w-full h-12 border border-blue-900 rounded-lg bg-[#fffefe] text-blue-900 flex items-center justify-between px-3 pr-10 cursor-pointer"
              onClick={() => handleOpenChange(!isOpen)}
            >
              <span className="text-blue-950">
                {returnCal && returnCal ? formatDate(returnDate) : formatDate(departureDate)}
              </span>
            </div>
          </div>
          {renderError()}
        </div>

        {/* Desktop Absolute Calendar Box */}
        {isOpen && (
          <div ref={calRef} className="absolute top-full left-0 mt-1 w-[720px] z-30 bg-[#fffefe] border-blue-900 shadow-lg">
            <div className="p-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-blue-900">انتخاب تاریخ</h2>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={toggleCalendarType}
                    className="flex items-center gap-2 border border-blue-900 bg-[#fffefe] text-blue-900 hover:bg-gray-100 text-xs h-8 px-2"
                  >
                    <Globe className="h-3 w-3" />
                    {calendarType === "shamsi" ? "تقویم میلادی" : "Shamsi Calendar"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenChange(false)}
                    className="h-6 w-6 p-0 hover:bg-gray-100 border border-blue-900"
                  >
                    <X className="h-3 w-3" />
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
                    <span className="text-blue-900 text-sm">رفت و برگشت</span>
                  </label>
                </div>
              )}

              {localTripType === "roundtrip" && (
                <div className="flex bg-gray-100 p-1 mb-4 rounded">
                  <button
                    className={`flex-1 py-1 px-3 text-xs font-medium rounded ${selectionMode === "departure"
                      ? "bg-[#fffefe] text-blue-800 shadow-sm"
                      : "text-blue-900 hover:text-blue-950"
                      }`}
                    onClick={() => setSelectionMode("departure")}
                  >
                    تاریخ رفت
                  </button>
                  <button
                    className={`flex-1 py-1 px-3 text-xs font-medium rounded ${selectionMode === "return"
                      ? "bg-[#fffefe] text-blue-800 shadow-sm"
                      : "text-blue-900 hover:text-blue-950"
                      } ${!selectedDepartureDate ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={() => selectedDepartureDate && setSelectionMode("return")}
                    disabled={!selectedDepartureDate}
                  >
                    تاریخ برگشت
                  </button>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between items-center mb-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonths('prev')}
                    className="h-6 w-6 p-0 hover:bg-gray-100 text-sm border border-blue-900"
                  >
                    ‹
                  </Button>

                  <div className="flex gap-2 text-sm font-bold text-blue-900">
                    <span>{monthNames.firstMonth}</span>
                    <span>—</span>
                    <span>{monthNames.secondMonth}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigateMonths('next')}
                    className="h-6 w-6 p-0 hover:bg-gray-100 text-sm border border-blue-900"
                  >
                    ›
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
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
                    isDesktop={true}
                    flightLowestPricesWithDate={flightLowerPricesPerDay}
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
                    isDesktop={true}
                    flightLowestPricesWithDate={flightLowerPricesPerDay}
                  />
                </div>
              </div>

              {/* REMOVED APPLY BUTTON SECTION */}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Modal View */}
      <Dialog open={mobile && isOpen} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <div className="block md:hidden space-y-2 cursor-pointer">
            <div className="relative">
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <div className="w-full h-12 border border-blue-900 bg-[#fffefe] text-blue-900 flex items-center justify-between px-3 pr-10 cursor-pointer">
                <span className="text-blue-900">
                  {returnCal && returnCal ? formatDate(returnDate) : formatDate(departureDate)}
                </span>
              </div>
            </div>
            {renderError()}
          </div>
        </DialogTrigger>

        <DialogContent className="sm:max-w-[100vw] p-0 bg-[#fffefe] border border-blue-900">
          <div className="md:hidden max-h-[100vh] bg-[#fffefe] flex flex-col">
            <div className="flex justify-between items-center p-3 border-b border-blue-900 sticky top-0 bg-[#fffefe] z-10">
              <h2 className="text-lg font-bold text-blue-900">انتخاب تاریخ</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleCalendarType}
                  className="flex items-center gap-1 text-sm border border-blue-900 bg-[#fffefe] text-blue-900 hover:bg-gray-100"
                >
                  <Globe className="h-3 w-3" />
                  {calendarType === "shamsi" ? "شمسی" : "میلادی"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleOpenChange(false)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 border border-blue-900"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {!normalReturnCal && (
              <div className="p-3 border-b border-blue-900">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={localTripType === "roundtrip"}
                    onChange={(e) => handleTripTypeChange(e.target.checked ? "roundtrip" : "oneway")}
                    className="w-4 h-4 text-blue-500"
                  />
                  <span className="text-blue-900">رفت و برگشت</span>
                </label>
              </div>
            )}

            {localTripType === "roundtrip" && (
              <div className="flex bg-gray-100 p-1 mx-3 mt-3">
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${selectionMode === "departure"
                    ? "bg-[#fffefe] text-blue-800"
                    : "text-blue-900 hover:text-blue-950"
                    }`}
                  onClick={() => setSelectionMode("departure")}
                >
                  تاریخ رفت
                </button>
                <button
                  className={`flex-1 py-2 px-4 text-sm font-medium ${selectionMode === "return"
                    ? "bg-[#fffefe] text-blue-800"
                    : "text-blue-900 hover:text-blue-950"
                    } ${!selectedDepartureDate ? "opacity-50 cursor-not-allowed" : ""}`}
                  onClick={() => selectedDepartureDate && setSelectionMode("return")}
                  disabled={!selectedDepartureDate}
                >
                  تاریخ برگشت
                </button>
              </div>
            )}

            {/* Mobile Calendar Navigation */}
            <div className="flex justify-between items-center p-3 border-b border-blue-900">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMobileMonths('prev')}
                className="h-8 w-8 p-0 hover:bg-gray-100 text-lg border border-blue-900"
              >
                ‹
              </Button>

              <div className="flex flex-col items-center text-sm font-bold text-blue-900">
                <span>{mobileMonthNames.firstMonth}</span>
                <span className="text-xs text-gray-500">و</span>
                <span>{mobileMonthNames.secondMonth}</span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMobileMonths('next')}
                className="h-8 w-8 p-0 hover:bg-gray-100 text-lg border border-blue-900"
              >
                ›
              </Button>
            </div>

            {/* Mobile Calendar Grid - Two months stacked vertically */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 p-3">
                {/* First Month */}
                <div className="bg-white rounded-lg border border-blue-900">
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
                    flightLowestPricesWithDate={flightLowerPricesPerDay}
                  />
                </div>

                {/* Second Month */}
                <div className="bg-white rounded-lg border border-blue-900">
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
                    flightLowestPricesWithDate={flightLowerPricesPerDay}
                  />
                </div>
              </div>
            </div>

            {/* REMOVED ACTION BUTTONS SECTION */}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Calendar Component (unchanged)
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
  isDesktop?: boolean
  onDateHover?: (event: React.MouseEvent, day: number | null) => void
  onDateHoverLeave?: () => void
  flightLowestPricesWithDate?: any
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
  isDesktop = false,
  onDateHover,
  onDateHoverLeave,
  flightLowestPricesWithDate
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

  }, [flightLowestPricesWithDate])

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

  const getTheIsoDate = (day: number) => {
    const year = getCurrentYear()
    const month = getCurrentMonth()
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

    // Convert to Date object and then to ISO string to match your price data format
    if (calendarType === "shamsi") {
      // For Shamsi dates, convert to Gregorian first, then to ISO
      const gregorianDate = toGregorian(year, month, day)
      const dateObj = new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd)
      return dateObj.toISOString().split('T')[0] // Returns "2025-12-05" format
    } else {
      // For Gregorian dates, directly create ISO string
      const dateObj = new Date(year, month - 1, day)
      return dateObj.toISOString().split('T')[0] // Returns "2025-12-05" format
    }
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
    <div className={`bg-[#fffefe] ${isMobile ? 'p-2' : isDesktop ? 'p-1' : 'p-3'}`}>

      <div className="text-center mb-2">
        <div className={`font-bold text-blue-900 ${isDesktop ? 'text-sm' : 'text-md'}`}>
          {getMonthName()} {getCurrentYear()}
        </div>
      </div>

      <div className={`grid grid-cols-7 gap-0 mb-1 ${isDesktop ? 'text-xs' : 'text-sm'}`}>
        {weekDays.map((day) => (
          <div key={day} className={`text-center font-medium text-blue-900 py-1 ${isDesktop ? 'text-xs' : 'text-xs'}`}>
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0">
        {calendar.map((week, weekIndex) =>
          week.map((day, dayIndex) => (
            <button
              key={`${weekIndex}-${dayIndex}`}
              className={`aspect-square flex flex-col items-center justify-center font-medium relative
                ${isDesktop ? 'text-xs' : 'text-xs'}
                ${!day
                  ? 'invisible'
                  : isDateDisabled(day)
                    ? 'text-gray-300 cursor-not-allowed bg-gray-100'
                    : isDateSelected(day)
                      ? 'bg-blue-800 text-white'
                      : isDateInRange(day)
                        ? 'bg-gray-200 text-blue-900'
                        : 'text-blue-900 bg-[#fffefe] hover:bg-gray-100 cursor-pointer border border-transparent'
                }
              `}
              onClick={() => day && !isDateDisabled(day) && handleDateClick(day)}
              onMouseEnter={(e) => handleDateMouseEnter(e, day)}
              onMouseLeave={handleDateMouseLeave}
              disabled={!day || isDateDisabled(day)}
            >
              <span className="block">
                {day?.toLocaleString('fa-IR')}
              </span>
              {
                day && flightLowestPricesWithDate &&
                (() => {
                  const currentDate = getTheIsoDate(day);
                  const matchingPrice = flightLowestPricesWithDate.find(
                    (priceItem: any) => {
                      const priceDate = new Date(priceItem.date).toISOString().split('T')[0];
                      const compareDate = new Date(currentDate).toISOString().split('T')[0];
                      return priceDate === compareDate;
                    }
                  );
                  return matchingPrice ? (
                    <span className="block text-[8px] text-blue-400">
                      {parseInt(matchingPrice.lowestPrice).toLocaleString('fa-IR')}
                    </span>
                  ) : null;
                })()
              }
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default ShamsiDateModal