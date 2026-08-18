import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useDebouncedValue } from '@/hooks/useCommon'
import { getRecentSearches, trackRecentSearch, clearRecentSearches } from '@/utils/recents'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/types/database'

export function SearchOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const debounced = useDebouncedValue(query, 300)
  const navigate = useNavigate()

  useEffect(() => {
    if (open) setRecent(getRecentSearches())
  }, [open])

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([])
      return
    }
    setLoading(true)
    supabase
      .from('products')
      .select('*, images:product_images(*)')
      .eq('is_published', true)
      .or(`name.ilike.%${debounced}%,description.ilike.%${debounced}%`)
      .limit(6)
      .then(({ data }) => setResults((data ?? []) as unknown as Product[]))
      .then(() => setLoading(false), () => setLoading(false))
  }, [debounced])

  function goToSearch(term: string) {
    trackRecentSearch(term)
    navigate(`/products?q=${encodeURIComponent(term)}`)
    onClose()
    setQuery('')
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -16, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="mx-auto mt-16 sm:mt-24 w-full max-w-2xl px-4"
          >
            <div className="rounded-lg bg-bone shadow-[var(--shadow-pop)] border border-sand-line overflow-hidden">
              <div className="flex items-center gap-3 px-5 h-16 border-b border-sand-line">
                <Search className="h-5 w-5 text-ink/40 shrink-0" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && query.trim() && goToSearch(query)}
                  placeholder="Search for products, brands, categories…"
                  className="flex-1 bg-transparent outline-none text-ink placeholder:text-ink/40 text-base"
                />
                <button onClick={onClose} aria-label="Close search" className="p-1.5 text-ink/50 hover:text-ink shrink-0">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-3">
                {!query.trim() && recent.length > 0 && (
                  <div className="px-2 py-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wide text-ink/40">Recent</span>
                      <button onClick={() => { clearRecentSearches(); setRecent([]) }} className="text-xs text-ink/40 hover:text-ink">
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-col">
                      {recent.map((term) => (
                        <button
                          key={term}
                          onClick={() => goToSearch(term)}
                          className="flex items-center gap-2.5 px-2 py-2 rounded-md text-sm text-ink/70 hover:bg-sand/50 hover:text-ink text-left"
                        >
                          <Clock className="h-3.5 w-3.5 text-ink/35" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {!query.trim() && recent.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-ink/45 flex flex-col items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-ink/25" />
                    Start typing to search the entire store
                  </div>
                )}

                {query.trim() && !loading && results.length === 0 && (
                  <div className="px-4 py-10 text-center text-sm text-ink/50">
                    No results for &ldquo;{query}&rdquo;
                  </div>
                )}

                {results.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      trackRecentSearch(query)
                      navigate(`/products/${p.slug}`)
                      onClose()
                      setQuery('')
                    }}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-md hover:bg-sand/50 text-left"
                  >
                    <div className="h-12 w-12 shrink-0 rounded-md overflow-hidden bg-sand/60">
                      {p.images?.[0]?.url && <img src={p.images[0].url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-ink truncate">{p.name}</p>
                      <p className="text-xs text-ink/45">{formatCurrency(p.sale_price ?? p.price)}</p>
                    </div>
                  </button>
                ))}

                {query.trim() && results.length > 0 && (
                  <button
                    onClick={() => goToSearch(query)}
                    className="w-full mt-1 px-2 py-2.5 rounded-md text-sm font-medium text-moss-dark hover:bg-sand/50 text-left"
                  >
                    See all results for &ldquo;{query}&rdquo; →
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
