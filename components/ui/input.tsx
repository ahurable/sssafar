import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'flex h-9 w-full min-w-0 border border-gray-300 bg-[#fffefe] px-3 py-1 text-black text-base outline-none transition-colors',
        'placeholder:text-gray-500',
        'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
        'focus:border-black focus:ring-0',
        'aria-invalid:border-red-500',
        className,
      )}
      {...props}
    />
  )
}

export { Input }