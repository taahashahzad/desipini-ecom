import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Star, Check, X, Trash2 } from 'lucide-react'
import * as reviewService from '@/services/reviews'
import { formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import { StarRating } from '@/components/ui/StarRating'
import { ConfirmDialog } from '@/components/ui/Dialog'

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'all', label: 'All' },
] as const

export default function AdminReviewsPage() {
  const [tab, setTab] = useState<'pending' | 'approved' | 'all'>('pending')
  const [reviews, setReviews] = useState<any[] | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null)

  function load() {
    setReviews(null)
    reviewService.adminFetchReviews(tab).then(setReviews)
  }
  useEffect(load, [tab])

  async function handleApprove(id: string, approved: boolean) {
    try {
      await reviewService.adminSetReviewApproval(id, approved)
      toast.success(approved ? 'Review approved' : 'Review hidden')
      load()
    } catch (e: any) {
      toast.error('Could not update review', { description: e.message })
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    await reviewService.adminDeleteReview(deleteTarget.id)
    toast.success('Review deleted')
    setDeleteTarget(null)
    load()
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Reviews</h1>

      <div className="flex gap-1 mb-5 border-b border-sand-line">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.value ? 'border-ink text-ink' : 'border-transparent text-ink/45 hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {!reviews ? (
        <div className="flex flex-col gap-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-lg" />)}</div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={<Star className="h-6 w-6" />} title="No reviews to show" />
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-lg border border-sand-line bg-white/50 p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="text-sm font-medium text-ink">{r.product?.name ?? 'Unknown product'}</p>
                  <p className="text-xs text-ink/45 mt-0.5">by {r.reviewer?.full_name ?? 'Customer'} · {formatDate(r.created_at)}</p>
                  <StarRating value={r.rating} size={13} />
                  {r.comment && <p className="text-sm text-ink/70 mt-2 max-w-xl">{r.comment}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge tone={r.is_approved ? 'success' : 'warning'}>{r.is_approved ? 'Approved' : 'Pending'}</Badge>
                  {!r.is_approved ? (
                    <button onClick={() => handleApprove(r.id, true)} className="p-1.5 rounded-md text-moss hover:bg-moss/10" title="Approve"><Check className="h-4 w-4" /></button>
                  ) : (
                    <button onClick={() => handleApprove(r.id, false)} className="p-1.5 rounded-md text-warning hover:bg-warning/10" title="Hide"><X className="h-4 w-4" /></button>
                  )}
                  <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded-md text-danger/70 hover:bg-danger/10" title="Delete"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete this review?"
        confirmLabel="Delete"
        danger
      />
    </div>
  )
}
