import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bone-dim px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <Link to="/" className="font-display text-3xl text-ink">DesiPini</Link>
          <h1 className="font-display text-xl text-ink mt-6">{title}</h1>
          {subtitle && <p className="text-sm text-ink/55 mt-1.5">{subtitle}</p>}
        </div>
        <div className="rounded-lg border border-sand-line bg-white/60 p-7 shadow-[var(--shadow-card)]">
          {children}
        </div>
      </motion.div>
    </div>
  )
}
