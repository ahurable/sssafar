// utils/dateUtils.ts

/**
 * Formats a Shamsi date string (YYYY-MM-DD) to Persian display format (DD/MM/YYYY)
 * @param date - Shamsi date string in format "YYYY-MM-DD"
 * @returns Formatted Persian date string like "۱۴۰۳/۰۱/۱۵" or "انتخاب تاریخ" if empty
 */
export const formatShamsiDate = (date: string): string => {
  if (!date) return "انتخاب تاریخ";
  
  try {
    const [year, month, day] = date.split('-');
    
    // Convert English numbers to Persian numbers
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    const formatNumber = (num: string): string => {
      return num.split('').map(char => persianNumbers[parseInt(char)] || char).join('');
    };
    
    const formattedDay = formatNumber(day);
    const formattedMonth = formatNumber(month);
    const formattedYear = formatNumber(year);
    
    return `${formattedDay}/${formattedMonth}/${formattedYear}`;
  } catch (error) {
    console.error('Error formatting Shamsi date:', error);
    return "تاریخ نامعتبر";
  }
};

/**
 * Alternative version that returns different formats
 */
export const formatShamsiDateWithOptions = (date: string, format: 'short' | 'long' | 'numeric' = 'numeric'): string => {
  if (!date) return "انتخاب تاریخ";
  
  try {
    const [year, month, day] = date.split('-');
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    const formatNumber = (num: string): string => {
      return num.split('').map(char => persianNumbers[parseInt(char)] || char).join('');
    };
    
    const shamsiMonths = [
      "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
      "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند"
    ];

    switch (format) {
      case 'short':
        return `${formatNumber(day)} ${shamsiMonths[parseInt(month) - 1]}`;
      
      case 'long':
        return `${formatNumber(day)} ${shamsiMonths[parseInt(month) - 1]} ${formatNumber(year)}`;
      
      case 'numeric':
      default:
        return `${formatNumber(day)}/${formatNumber(month)}/${formatNumber(year)}`;
    }
  } catch (error) {
    console.error('Error formatting Shamsi date:', error);
    return "تاریخ نامعتبر";
  }
};

/**
 * Converts Gregorian date to Shamsi date string
 */
export const gregorianToShamsi = (date: Date): string => {
  // Using jalaali-js library
  const { jy, jm, jd } = require('jalaali-js').toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
  
  return `${jy}-${String(jm).padStart(2, '0')}-${String(jd).padStart(2, '0')}`;
};

/**
 * Converts Shamsi date string to Gregorian date
 */
export const shamsiToGregorian = (shamsiDate: string): Date => {
  const [year, month, day] = shamsiDate.split('-').map(Number);
  const { gy, gm, gd } = require('jalaali-js').toGregorian(year, month, day);
  
  return new Date(gy, gm - 1, gd);
};

/**
 * Gets today's date in Shamsi format
 */
export const getTodayShamsi = (): string => {
  return gregorianToShamsi(new Date());
};

/**
 * Checks if a Shamsi date is valid
 */
export const isValidShamsiDate = (date: string): boolean => {
  if (!date) return false;
  
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(date)) return false;
  
  const [year, month, day] = date.split('-').map(Number);
  
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  
  // Check for valid days in each month
  const daysInMonth = getJalaaliDaysInMonth(year, month);
  return day <= daysInMonth;
};

// Helper function to get days in Shamsi month
function getJalaaliDaysInMonth(year: number, month: number): number {
  const jalaali = require('jalaali-js');
  
  if (month <= 6) return 31;
  if (month <= 11) return 30;
  
  // Check if it's a leap year in Shamsi calendar
  return jalaali.isLeapJalaaliYear(year) ? 30 : 29;
}