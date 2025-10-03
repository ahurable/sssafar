// hooks/useToast.ts
"use client"

import { useNotification } from '@/contexts/notification/NotificationContext'

export function useSnack() {
  const { addNotification } = useNotification()

  const success = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'success',
      title,
      message,
      duration
    })
  }

  const error = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 7000 // Longer duration for errors
    })
  }

  const warning = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'warning',
      title,
      message,
      duration
    })
  }

  const info = (title: string, message?: string, duration?: number) => {
    addNotification({
      type: 'info',
      title,
      message,
      duration
    })
  }

  return {
    success,
    error,
    warning,
    info
  }
}