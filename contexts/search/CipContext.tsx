// contexts/cip-context.tsx
"use client"

import { createContext, useContext, useState, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { shamsiToGregorianString } from "@/lib/jalaalil"

export interface CipSearchData {
  airport: string
  airportId?: string
  date: string
  adults: number
  children: number
  infants: number
  serviceType: string
}

interface CipContextType {
  searchData?: CipSearchData
  setSearchData: (data: CipSearchData) => void
  clearSearchData: () => void
}

const CipContext = createContext<CipContextType | undefined>(undefined)

interface CipProviderProps {
  children: ReactNode
}

export const CipProvider = ({ children }: CipProviderProps) => {
  const [searchData, setSearchData] = useState<CipSearchData | undefined>(undefined)
  const router = useRouter()

  const handleSetSearchData = (data: CipSearchData) => {
    // Convert date to Gregorian before saving
    const gregorianDate = shamsiToGregorianString(data.date)
    const searchDataWithGregorianDate = {
      ...data,
      date: gregorianDate
    }

    setSearchData(searchDataWithGregorianDate)

    // Navigate to CIP page
    router.push('/cip')
  }

  const clearSearchData = () => {
    setSearchData(undefined)
  }

  const value: CipContextType = {
    searchData,
    setSearchData: handleSetSearchData,
    clearSearchData
  }

  return (
    <CipContext.Provider value={value}>
      {children}
    </CipContext.Provider>
  )
}

export const useCip = () => {
  const context = useContext(CipContext)
  if (context === undefined) {
    throw new Error("useCip must be used within a CipProvider")
  }
  return context
}