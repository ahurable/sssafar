// lib/jalaali.ts
import { toJalaali, toGregorian, isLeapJalaaliYear, jalaaliMonthLength } from 'jalaali-js'

export { toJalaali, toGregorian, isLeapJalaaliYear, jalaaliMonthLength }

/**
 * Convert a Shamsi date string to Date object
 */
export const jalaaliToDateObject = (jalaaliDate: string): Date => {
  if (!jalaaliDate) return new Date()
  
  try {
    const [year, month, day] = jalaaliDate.split('-').map(Number)
    const gregorian = toGregorian(year, month, day)
    return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd)
  } catch (error) {
    return new Date()
  }
}

/**
 * Convert Date object to Shamsi date string (YYYY-MM-DD)
 */
export const dateToJalaaliString = (date: Date): string => {
  const jalaali = toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate())
  return `${jalaali.jy}-${String(jalaali.jm).padStart(2, '0')}-${String(jalaali.jd).padStart(2, '0')}`
}

/**
 * Get today's date in Shamsi format
 */
export const getTodayJalaali = (): string => {
  return dateToJalaaliString(new Date())
}

/**
 * Get number of days in a Shamsi month
 */
export const getJalaaliDaysInMonth = (year: number, month: number): number => {
  return jalaaliMonthLength(year, month)
}

/**
 * Get first day of the month (0-6 where 0 is Saturday)
 */
export const getJalaaliFirstDayOfMonth = (year: number, month: number): number => {
  // Calculate using a known reference date
  const referenceDate = new Date(2024, 2, 20) // Farvardin 1, 1403 (Saturday)
  const referenceJalaali = toJalaali(2024, 3, 20)
  
  // Calculate total days from reference
  let totalDays = 0
  
  // Add days for complete years
  for (let y = 1403; y < year; y++) {
    totalDays += isLeapJalaaliYear(y) ? 366 : 365
  }
  
  // Add days for complete months in current year
  for (let m = 1; m < month; m++) {
    totalDays += jalaaliMonthLength(year, m)
  }
  
  // Calculate day of week (0-6 where 0 is Saturday)
  return (0 + totalDays) % 7
}

/**
 * Compare two Jalaali dates
 */
export const compareJalaaliDates = (date1: string, date2: string): number => {
  const [y1, m1, d1] = date1.split('-').map(Number)
  const [y2, m2, d2] = date2.split('-').map(Number)
  
  if (y1 !== y2) return y1 - y2
  if (m1 !== m2) return m1 - m2
  return d1 - d2
}

/**
 * Check if a Jalaali date is after or equal to another
 */
export const isJalaaliDateAfterOrEqual = (date1: string, date2: string): boolean => {
  return compareJalaaliDates(date1, date2) >= 0
}

/**
 * Check if a Jalaali date is valid
 */
export const isValidJalaaliDate = (date: string): boolean => {
  if (!date) return false
  
  const regex = /^\d{4}-\d{2}-\d{2}$/
  if (!regex.test(date)) return false
  
  const [year, month, day] = date.split('-').map(Number)
  
  if (month < 1 || month > 12) return false
  if (day < 1 || day > 31) return false
  
  const daysInMonth = jalaaliMonthLength(year, month)
  return day <= daysInMonth
}

/**
 * Convert Shamsi date string to Gregorian date string (YYYY-MM-DD)
 */
export const shamsiToGregorianString = (shamsiDate: string): string => {
  if (!shamsiDate) return ''
  
  try {
    const [year, month, day] = shamsiDate.split('-').map(Number)
    const gregorian = toGregorian(year, month, day)
    return `${gregorian.gy}-${String(gregorian.gm).padStart(2, '0')}-${String(gregorian.gd).padStart(2, '0')}`
  } catch (error) {
    console.error('Error converting Shamsi to Gregorian:', error)
    return ''
  }
}

/**
 * Convert Gregorian date string to Shamsi date string
 */
export const gregorianToShamsiString = (gregorianDate: string): string => {
  if (!gregorianDate) return ''
  
  try {
    const [year, month, day] = gregorianDate.split('-').map(Number)
    const shamsi = toJalaali(year, month, day)
    return `${shamsi.jy}-${String(shamsi.jm).padStart(2, '0')}-${String(shamsi.jd).padStart(2, '0')}`
  } catch (error) {
    console.error('Error converting Gregorian to Shamsi:', error)
    return ''
  }
}

/**
 * Get today's date in Gregorian format
 */
export const getTodayGregorian = (): string => {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
}

/**
 * Get today's date in Shamsi format
 */
export const getTodayShamsi = (): string => {
  return gregorianToShamsiString(getTodayGregorian())
}