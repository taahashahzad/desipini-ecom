import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'moss' | 'clay' | 'ink' | 'gold' | 'danger' | 'neutral' | 'success' | 'warning'

const tones: Record<Tone, string> = {
  moss: 'bg-moss/10 text-moss-dark border-moss/20',
  clay: 'bg-clay/10 text-clay border-clay/25',
  ink: 'bg-ink text-bone border-ink',
  gold: 'bg-gold/10 text-gold border-gold/25',
  danger: 'bg-danger/10 text-danger border-danger/20',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/25',
  neutral: 'bg-sand/50 text-ink/70 border-sand-line',
}

export function Badge({
  className,
  tone = 'neutral',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold tracking-wide uppercase',
        tones[tone],
        className
      )}
      {...props}
    />
  )
}
