import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { fetchFeaturedProducts, fetchNewArrivals, fetchBestSellers } from '@/services/products'
import type { Product } from '@/types/database'
import { ProductCard } from '@/components/product/ProductCard'
import { ProductCardSkeleton } from '@/components/ui/Skeleton'
import { Button } from '@/components/ui/Button'
import { useCategories } from '@/hooks/useCommon'
import { EmptyState } from '@/components/ui/EmptyState'
import { Package } from 'lucide-react'
import pic from '@/assets/pic.jpeg';


export default function HomePage() {
  return (
    <div>
      <Hero />
      <CategoryStrip />
      <ProductSection title="Featured" subtitle="Curated pieces our editors keep coming back to" fetcher={fetchFeaturedProducts} viewAllHref="/products?featured=true" />
      <ProductSection title="New Arrivals" subtitle="Fresh in this week" fetcher={fetchNewArrivals} viewAllHref="/products?sort=newest" tone="alt" />
      <ProductSection title="Best Sellers" subtitle="Loved again and again" fetcher={fetchBestSellers} viewAllHref="/products?sort=popular" />
      <TrustSection />
    </div>
  )
}

function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#E5DFD2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-wide uppercase text-moss-dark bg-moss/10 border border-moss/20 rounded-full px-5 py-2.5 mb-6">
            <Sparkles className="h-4 w-4" /> ✦ ہر موقع کے لیے بہترین انتخاب ✦
          </span>
          <h1 className="font-display text-4xl sm:text-6xl leading-[1.05] text-ink text-balance">
            Discover Products <br /> You&rsquo;ll Love
          </h1>
          <p className="mt-5 text-base sm:text-lg text-ink/60 max-w-md text-balance">
            دیسی پِنی ،خالص ذائقہ، دیسی انداز
آپ کے لیے روایتی ذائقے اور معیاری اجزاء سے تیار کردہ مزیدار مٹھائیاں پیش کی جاتی ہیں۔ ہر نوالے میں گھر جیسا خالص ذائقہ اور دیسی محبت کا احساس۔
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link to="/products">
              <Button size="lg" className="group">
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
            </Link>
            <Link to="/products?featured=true">
              <Button size="lg" variant="outline">Explore Collection</Button>
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
          className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-[4/5] rounded-xl overflow-hidden bg-sand"
        >
          <img
            src={pic}
            alt="A considered still life of Meridian goods"
            className="h-full w-full object-cover"
          />
          {/* <div className="absolute bottom-5 left-5 right-5 sm:right-auto rounded-lg bg-bone/95 backdrop-blur-sm p-4 shadow-[var(--shadow-pop)] flex items-center gap-3">
            <div className="h-11 w-11 rounded-md bg-sand overflow-hidden shrink-0">
              <img src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=200&q=80" alt="" className="h-full w-full object-cover" />
            </div>
            <div>
              <p className="text-sm font-medium text-ink">Studio Ceramic Vase</p>
              <p className="text-xs text-ink/50">Rs. 4,200</p>
            </div>
          </div> */}
        </motion.div>
      </div>
    </section>
  )
}

function CategoryStrip() {
  const { categories, loading } = useCategories()
  if (!loading && categories.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl sm:text-3xl text-ink">Shop by Category</h2>
          <p className="text-sm text-ink/55 mt-1">Find exactly what you&rsquo;re looking for</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="aspect-square rounded-lg bg-sand/50 animate-pulse" />)
          : categories.slice(0, 8).map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
              >
                <Link to={`/categories/${cat.slug}`} className="group relative block aspect-square rounded-lg overflow-hidden bg-sand">
                  {cat.image_url ? (
                    <img src={cat.image_url} alt={cat.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-sand to-sand-line" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/0 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 flex items-end justify-between">
                    <div>
                      <p className="text-bone font-display text-lg leading-tight">{cat.name}</p>
                      <p className="text-bone/70 text-xs mt-0.5">{cat.product_count ?? 0} products</p>
                    </div>
                    <span className="opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all">
                      <ArrowRight className="h-4 w-4 text-bone" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
      </div>
    </section>
  )
}

function ProductSection({
  title,
  subtitle,
  fetcher,
  viewAllHref,
  tone = 'default',
}: {
  title: string
  subtitle: string
  fetcher: (limit?: number) => Promise<Product[]>
  viewAllHref: string
  tone?: 'default' | 'alt'
}) {
  const [products, setProducts] = useState<Product[] | null>(null)

  useEffect(() => {
    let mounted = true
    fetcher(8).then((data) => mounted && setProducts(data))
    return () => {
      mounted = false
    }
  }, [fetcher])

  if (products && products.length === 0) return null

  return (
    <section className={tone === 'alt' ? 'bg-bone-dim/50' : ''}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl text-ink">{title}</h2>
            <p className="text-sm text-ink/55 mt-1">{subtitle}</p>
          </div>
          <Link to={viewAllHref} className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-ink group">
            View all <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {!products ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={<Package className="h-6 w-6" />} title="No products found" />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10">
            {products.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>
    </section>
  )
}

function TrustSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-20 pt-4">
      <div className="rounded-xl bg-ink text-bone px-8 py-14 sm:px-16 sm:py-16 text-center relative overflow-hidden">
        <h2 className="font-display text-3xl sm:text-4xl text-balance max-w-xl mx-auto">
          Quality you can trust, shipped to your door
        </h2>
        <p className="mt-4 text-bone/60 max-w-md mx-auto">
          Every order is backed by our cash-on-delivery convenience.
        </p>
        <Link to="/products" className="inline-block mt-8">
          <Button variant="secondary" size="lg">Start Shopping</Button>
        </Link>
      </div>
    </section>
  )
}
