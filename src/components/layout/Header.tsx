import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Search, Heart, ShoppingBag, User, Menu, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'
import { useCartStore, cartTotals } from '@/store/cartStore'
import { useWishlistStore } from '@/store/wishlistStore'
import { useCategories } from '@/hooks/useCommon'
import { SearchOverlay } from '@/components/shared/SearchOverlay'

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { user, isAdmin } = useAuth()
  const { categories } = useCategories()
  const items = useCartStore((s) => s.items)
  const openCart = useCartStore((s) => s.openCart)
  const wishlistItems = useWishlistStore((s) => s.items)
  const { itemCount } = cartTotals(items)
  const navigate = useNavigate()
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => () => clearTimeout(closeTimer.current), [])

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 transition-all duration-300 border-b',
          scrolled ? 'bg-bone/90 backdrop-blur-md border-sand-line shadow-[0_1px_0_rgba(0,0,0,0.02)]' : 'bg-bone border-transparent'
        )}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-1">
              <button
                className="lg:hidden -ml-2 p-2 text-ink"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <Link to="/" className="font-display text-2xl tracking-tight text-ink pl-1 lg:pl-0">
                Meridian
              </Link>
            </div>

            <nav className="hidden lg:flex items-center gap-7">
              <div
                className="relative"
                onMouseEnter={() => {
                  clearTimeout(closeTimer.current)
                  setCategoriesOpen(true)
                }}
                onMouseLeave={() => {
                  closeTimer.current = setTimeout(() => setCategoriesOpen(false), 150)
                }}
              >
                <button className="flex items-center gap-1 text-sm font-medium text-ink/80 hover:text-ink transition-colors py-2">
                  Shop
                  <ChevronDown className={cn('h-3.5 w-3.5 transition-transform', categoriesOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {categoriesOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.16 }}
                      className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-64"
                    >
                      <div className="rounded-lg border border-sand-line bg-bone shadow-[var(--shadow-pop)] p-2">
                        <Link
                          to="/products"
                          className="block px-3 py-2 rounded-md text-sm text-ink/70 hover:bg-sand/50 hover:text-ink transition-colors"
                        >
                          All Products
                        </Link>
                        {categories.map((c) => (
                          <Link
                            key={c.id}
                            to={`/categories/${c.slug}`}
                            className="flex items-center justify-between px-3 py-2 rounded-md text-sm text-ink/70 hover:bg-sand/50 hover:text-ink transition-colors"
                          >
                            {c.name}
                            <span className="text-xs text-ink/35">{c.product_count}</span>
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <Link to="/products?sort=newest" className="text-sm font-medium text-ink/80 hover:text-ink transition-colors">
                New Arrivals
              </Link>
              <Link to="/products?featured=true" className="text-sm font-medium text-ink/80 hover:text-ink transition-colors">
                Featured
              </Link>
            </nav>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="p-2.5 text-ink/70 hover:text-ink transition-colors"
              >
                <Search className="h-[18px] w-[18px]" />
              </button>
              <Link to="/account/wishlist" aria-label="Wishlist" className="relative p-2.5 text-ink/70 hover:text-ink transition-colors">
                <Heart className="h-[18px] w-[18px]" />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-clay text-[10px] font-semibold text-white flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
              <button onClick={openCart} aria-label="Cart" className="relative p-2.5 text-ink/70 hover:text-ink transition-colors">
                <ShoppingBag className="h-[18px] w-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-moss text-[10px] font-semibold text-white flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate(user ? '/account' : '/login')}
                aria-label="Account"
                className="p-2.5 text-ink/70 hover:text-ink transition-colors"
              >
                <User className="h-[18px] w-[18px]" />
              </button>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="hidden sm:inline-flex ml-1 items-center h-8 px-3 rounded-md bg-ink text-bone text-xs font-semibold"
                >
                  Admin
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        categories={categories}
        isAdmin={isAdmin}
      />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

function MobileMenu({
  open,
  onClose,
  categories,
  isAdmin,
}: {
  open: boolean
  onClose: () => void
  categories: { id: string; name: string; slug: string }[]
  isAdmin: boolean
}) {
  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-ink/40"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-0 top-0 h-full w-[82%] max-w-xs bg-bone shadow-[var(--shadow-pop)] flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b border-sand-line">
              <span className="font-display text-xl text-ink">Meridian</span>
              <button onClick={onClose} aria-label="Close menu" className="p-1.5 text-ink/60">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-5 flex flex-col gap-1">
              <Link onClick={onClose} to="/products" className="py-2.5 text-ink font-medium">
                All Products
              </Link>
              <div className="mt-2 mb-1 text-xs uppercase tracking-wide text-ink/40 font-semibold">Categories</div>
              {categories.map((c) => (
                <Link key={c.id} onClick={onClose} to={`/categories/${c.slug}`} className="py-2.5 text-ink/75">
                  {c.name}
                </Link>
              ))}
              <div className="h-px bg-sand-line my-3" />
              <Link onClick={onClose} to="/account" className="py-2.5 text-ink/75">
                My Account
              </Link>
              <Link onClick={onClose} to="/account/orders" className="py-2.5 text-ink/75">
                My Orders
              </Link>
              {isAdmin && (
                <Link onClick={onClose} to="/admin" className="py-2.5 text-moss-dark font-medium">
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
