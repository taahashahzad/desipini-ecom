import { Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function SpecEditor({ specs, onChange }: { specs: Record<string, string>; onChange: (s: Record<string, string>) => void }) {
  const entries = Object.entries(specs)

  function updateKey(oldKey: string, newKey: string) {
    const next: Record<string, string> = {}
    for (const [k, v] of entries) next[k === oldKey ? newKey : k] = v
    onChange(next)
  }
  function updateValue(key: string, value: string) {
    onChange({ ...specs, [key]: value })
  }
  function remove(key: string) {
    const next = { ...specs }
    delete next[key]
    onChange(next)
  }
  function add() {
    onChange({ ...specs, [`Spec ${entries.length + 1}`]: '' })
  }

  return (
    <div className="flex flex-col gap-3">
      {entries.map(([key, value]) => (
        <div key={key} className="grid grid-cols-12 gap-2">
          <Input className="col-span-5" value={key} onChange={(e) => updateKey(key, e.target.value)} placeholder="Attribute" />
          <Input className="col-span-6" value={value} onChange={(e) => updateValue(key, e.target.value)} placeholder="Value" />
          <button type="button" onClick={() => remove(key)} className="col-span-1 text-ink/35 hover:text-danger flex justify-center items-center">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={add} className="w-fit">
        <Plus className="h-3.5 w-3.5" /> Add Specification
      </Button>
    </div>
  )
}
