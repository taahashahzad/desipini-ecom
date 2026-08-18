import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function StarRating({
  value,
  size = 14,
  showValue = false,
  count,
}: {
  value: number
  size?: number
  showValue?: boolean
  count?: number
}) {
  return (
    <div className="inline-flex items-center gap-1">
      <div className="flex items-center">
        {Array.from({ length: 5 }).map((_, i) => {
          const filled = i + 1 <= Math.round(value)
          return (
            <Star
              key={i}
              size={size}
              className={filled ? 'fill-gold text-gold' : 'fill-transparent text-sand-line'}
              strokeWidth={1.5}
            />
          )
        })}
      </div>
      {showValue && <span className="text-xs text-ink/60 tabular-nums">{value.toFixed(1)}</span>}
      {typeof count === 'number' && <span className="text-xs text-ink/45">({count})</span>}
    </div>
  )
}

export function StarRatingInput({
  value,
  onChange,
  size = 26,
}: {
  value: number
  onChange: (v: number) => void
  size?: number
}) {
  return (
    <div className="inline-flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i + 1 <= value
        return (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="transition-transform hover:scale-110"
            aria-label={`Rate ${i + 1} star${i === 0 ? '' : 's'}`}
          >
            <Star
              size={size}
              className={cn(filled ? 'fill-gold text-gold' : 'fill-transparent text-sand-line')}
              strokeWidth={1.5}
            />
          </button>
        )
      })}
    </div>
  )
}
