import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'link'
type Size = 'sm' | 'md' | 'lg' | 'icon'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

const variants: Record<Variant, string> = {
  primary:
    'bg-ink text-bone hover:bg-moss-dark active:bg-ink shadow-sm',
  secondary:
    'bg-moss text-bone hover:bg-moss-dark shadow-sm',
  outline:
    'border border-ink/20 text-ink bg-transparent hover:bg-ink/[0.04] hover:border-ink/40',
  ghost: 'text-ink bg-transparent hover:bg-ink/[0.06]',
  danger: 'bg-danger text-bone hover:brightness-95',
  link: 'text-ink underline-offset-4 hover:underline p-0 h-auto',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-sm rounded-md gap-1.5',
  md: 'h-11 px-5 text-sm rounded-md gap-2',
  lg: 'h-13 px-7 text-base rounded-lg gap-2',
  icon: 'h-10 w-10 rounded-md',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center font-medium tracking-tight transition-all duration-200',
          'disabled:opacity-50 disabled:pointer-events-none',
          'active:scale-[0.98]',
          variants[variant],
          size !== 'icon' ? sizes[size] : sizes.icon,
          className
        )}
        {...props}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = 'Button'
