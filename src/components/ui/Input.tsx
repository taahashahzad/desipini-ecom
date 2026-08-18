import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type LabelHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { error?: string }>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'w-full h-11 px-3.5 rounded-md border bg-white/60 text-ink placeholder:text-ink/40',
        'border-sand-line focus:border-moss focus:ring-2 focus:ring-moss/15 outline-none transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error && 'border-danger focus:border-danger focus:ring-danger/15',
        className
      )}
      {...props}
    />
  )
)
Input.displayName = 'Input'

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        'w-full px-3.5 py-3 rounded-md border bg-white/60 text-ink placeholder:text-ink/40',
        'border-sand-line focus:border-moss focus:ring-2 focus:ring-moss/15 outline-none transition-colors resize-y',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        error && 'border-danger focus:border-danger focus:ring-danger/15',
        className
      )}
      {...props}
    />
  )
)
Textarea.displayName = 'Textarea'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('block text-[13px] font-medium text-ink/70 mb-1.5 tracking-tight', className)}
      {...props}
    />
  )
}

export function FieldError({ children }: { children?: string }) {
  if (!children) return null
  return <p className="mt-1.5 text-[13px] text-danger">{children}</p>
}
