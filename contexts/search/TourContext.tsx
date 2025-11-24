// contexts/tour-context.tsx
"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { shamsiToGregorianString } from "@/lib/jalaalil"

export interface TourSearchData {
  destination: string
  startDate: string
  endDate: string
  travelers: number
}

interface TourContextType {
  searchData?: TourSearchData 
  setSearchData: (data: TourSearchData) => void
  clearSearchData: () => void
}

const TourContext = createContext<TourContextType | undefined>(undefined)

interface TourProviderProps {
  children: ReactNode
}

export const TourProvider = ({ children }: TourProviderProps) => {
  const [searchData, setSearchData] = useState<TourSearchData | undefined>(undefined)
  const router = useRouter()

  const handleSetSearchData = (data: TourSearchData) => {
    // Convert dates to Gregorian before saving
    const gregorianStartDate = shamsiToGregorianString(data.startDate)
    const gregorianEndDate = shamsiToGregorianString(data.endDate)
    
    const searchDataWithGregorianDates = {
      ...data,
      startDate: gregorianStartDate,
      endDate: gregorianEndDate
    }
    
    setSearchData(searchDataWithGregorianDates)
    
    // Navigate to activities page
    router.push('/activities')
  }

  const clearSearchData = () => {
    setSearchData(undefined)
  }

  const value: TourContextType = {
    searchData,
    setSearchData: handleSetSearchData,
    clearSearchData
  }

  return (
    <TourContext.Provider value={value}>
      {children}
    </TourContext.Provider>
  )
}

export const useTour = () => {
  const context = useContext(TourContext)
  if (context === undefined) {
    throw new Error("useTour must be used within a TourProvider")
  }
  return context
}