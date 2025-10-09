// hooks/use-search.ts
import { useState } from 'react'

export function useSearch() {
  const [loading, setLoading] = useState(false)

  // Get city and airport suggestions
  const getCitySuggestions = async (query: string, type: string): Promise<any[]> => {
    try {
      const response = await fetch(`/api/suggestions?query=${encodeURIComponent(query)}&type=${type}`)
      if (!response.ok) {
        throw new Error('Failed to fetch suggestions')
      }
      return await response.json()
    } catch (error) {
      console.error('Error fetching suggestions:', error)
      return []
    }
  }

  // ... rest of your existing search functions remain the same
  const searchHotels = async (params: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/hotels/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!response.ok) throw new Error('Hotel search failed')
      return await response.json()
    } finally {
      setLoading(false)
    }
  }

  const searchFlights = async (params: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/flights/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!response.ok) throw new Error('Flight search failed')
      return await response.json()
    } finally {
      setLoading(false)
    }
  }

  const searchTrains = async (params: any) => {
    setLoading(true)
    try {
      const response = await fetch('/api/trains/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      if (!response.ok) throw new Error('Train search failed')
      return await response.json()
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    searchHotels,
    searchFlights,
    searchTrains,
    getCitySuggestions,
  }
}