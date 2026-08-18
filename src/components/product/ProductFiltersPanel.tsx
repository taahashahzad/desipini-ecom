import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCategories } from '@/hooks/useCommon'
import type { ProductFilters } from '@/services/products'

interface Props {
  filters: ProductFilters
  onChange: (patch: Partial<ProductFilters>) => void
  selectedCategoryId?: string
  onCategoryChange: (id: string | undefined) => void
}

export function ProductFiltersPanel({ filters, onChange, selectedCategoryId, onCategoryChange }: Props) {
  const { categories } = useCategories()

  return (
    <div className="flex flex-col gap-8">
      <FilterGroup title="Category">
        <FilterOption
          label="All Categories"
          active={!selectedCategoryId}
          onClick={() => onCategoryChange(undefined)}
        />
        {categories.map((c) => (
          <FilterOption
            key={c.id}
            label={c.name}
            count={c.product_count}
            active={selectedCategoryId === c.id}
            onClick={() => onCategoryChange(c.id)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Price Range">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min"
            value={filters.minPrice ?? ''}
            onChange={(e) => onChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full h-9 px-2.5 rounded-md border border-sand-line bg-white/60 text-sm outline-none focus:border-moss"
          />
          <span className="text-ink/30">–</span>
          <input
            type="number"
            min={0}
            placeholder="Max"
            value={filters.maxPrice ?? ''}
            onChange={(e) => onChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full h-9 px-2.5 rounded-md border border-sand-line bg-white/60 text-sm outline-none focus:border-moss"
          />
        </div>
      </FilterGroup>

      <FilterGroup title="Rating">
        {[4, 3, 2, 1].map((r) => (
          <button
            key={r}
            onClick={() => onChange({ minRating: filters.minRating === r ? undefined : r })}
            className={cn(
              'flex items-center gap-1.5 py-1.5 text-sm w-full text-left',
              filters.minRating === r ? 'text-ink font-medium' : 'text-ink/60 hover:text-ink'
            )}
          >
            <span className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className={i < r ? 'fill-gold text-gold' : 'fill-transparent text-sand-line'} />
              ))}
            </span>
            & up
          </button>
        ))}
      </FilterGroup>

      <FilterGroup title="Availability">
        <label className="flex items-center gap-2.5 text-sm text-ink/70 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.inStockOnly}
            onChange={(e) => onChange({ inStockOnly: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-sand-line accent-moss"
          />
          In stock only
        </label>
      </FilterGroup>

      <FilterGroup title="Discount">
        <label className="flex items-center gap-2.5 text-sm text-ink/70 cursor-pointer">
          <input
            type="checkbox"
            checked={!!filters.onSaleOnly}
            onChange={(e) => onChange({ onSaleOnly: e.target.checked || undefined })}
            className="h-4 w-4 rounded border-sand-line accent-moss"
          />
          On sale
        </label>
      </FilterGroup>
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/40 mb-3">{title}</p>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function FilterOption({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center justify-between py-1.5 text-sm text-left transition-colors',
        active ? 'text-moss-dark font-semibold' : 'text-ink/65 hover:text-ink'
      )}
    >
      <span>{label}</span>
      {typeof count === 'number' && <span className="text-xs text-ink/35">{count}</span>}
    </button>
  )
}
