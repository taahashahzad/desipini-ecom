import { forwardRef, type SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          'w-full h-11 pl-3.5 pr-9 rounded-md border border-sand-line bg-white/60 text-ink appearance-none',
          'focus:border-moss focus:ring-2 focus:ring-moss/15 outline-none transition-colors cursor-pointer',
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/40" />
    </div>
  )
)
Select.displayName = 'Select'
