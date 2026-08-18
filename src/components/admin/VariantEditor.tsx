import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export interface VariantItem {
  variant_type: string
  variant_value: string
  price_adjustment: number
  stock_quantity: number
  sku?: string
  sort_order: number
}

export function VariantEditor({ variants, onChange }: { variants: VariantItem[]; onChange: (v: VariantItem[]) => void }) {
  function add() {
    onChange([...variants, { variant_type: '', variant_value: '', price_adjustment: 0, stock_quantity: 0, sort_order: variants.length }])
  }
  function update(i: number, patch: Partial<VariantItem>) {
    onChange(variants.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))
  }
  function remove(i: number) {
    onChange(variants.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-3">
      {variants.map((v, i) => (
        <div key={i} className="grid grid-cols-12 gap-2 items-center">
          <Input className="col-span-3" placeholder="Type (Size)" value={v.variant_type} onChange={(e) => update(i, { variant_type: e.target.value })} />
          <Input className="col-span-3" placeholder="Value (M)" value={v.variant_value} onChange={(e) => update(i, { variant_value: e.target.value })} />
          <Input className="col-span-2" type="number" placeholder="+/- Price" value={v.price_adjustment} onChange={(e) => update(i, { price_adjustment: Number(e.target.value) })} />
          <Input className="col-span-2" type="number" placeholder="Stock" value={v.stock_quantity} onChange={(e) => update(i, { stock_quantity: Number(e.target.value) })} />
          <Input className="col-span-1" placeholder="SKU" value={v.sku ?? ''} onChange={(e) => update(i, { sku: e.target.value })} />
          <button type="button" onClick={() => remove(i)} className="col-span-1 text-ink/35 hover:text-danger flex justify-center">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-fit">
        <Plus className="h-3.5 w-3.5" /> Add Variant Option
      </Button>
    </div>
  )
}
