import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users } from 'lucide-react'
import { adminFetchCustomers } from '@/services/customers'
import type { Profile } from '@/types/database'
import { formatDate, initials } from '@/lib/utils'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { TableRowSkeleton } from '@/components/ui/Skeleton'
import { useDebouncedValue } from '@/hooks/useCommon'

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Profile[] | null>(null)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setCustomers(null)
    adminFetchCustomers(debouncedSearch || undefined).then(setCustomers)
  }, [debouncedSearch])

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Customers</h1>

      <div className="relative max-w-sm mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink/35" />
        <Input placeholder="Search by name…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <div className="rounded-lg border border-sand-line bg-white/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-b border-sand-line">
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Joined</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-line">
              {!customers ? (
                Array.from({ length: 6 }).map((_, i) => <TableRowSkeleton key={i} cols={3} />)
              ) : customers.length === 0 ? (
                <tr><td colSpan={3}><EmptyState icon={<Users className="h-6 w-6" />} title="No customers found" /></td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-sand/20">
                    <td className="px-5 py-3.5">
                      <Link to={`/admin/customers/${c.id}`} className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-moss text-bone text-xs flex items-center justify-center font-display shrink-0 overflow-hidden">
                          {c.avatar_url ? <img src={c.avatar_url} alt="" className="h-full w-full object-cover" /> : initials(c.full_name)}
                        </div>
                        <span className="font-medium text-ink hover:underline">{c.full_name || 'Unnamed Customer'}</span>
                      </Link>
                    </td>
                    <td className="px-5 py-3.5 text-ink/50">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3.5"><Badge tone={c.is_disabled ? 'danger' : 'success'}>{c.is_disabled ? 'Disabled' : 'Active'}</Badge></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
