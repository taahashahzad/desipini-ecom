import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center text-center py-20 px-6"
    >
      {icon && (
        <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-sand/60 text-ink/40">
          {icon}
        </div>
      )}
      <h3 className="font-display text-xl text-ink mb-1.5">{title}</h3>
      {description && <p className="text-sm text-ink/55 max-w-sm mb-6">{description}</p>}
      {action}
    </motion.div>
  )
}
