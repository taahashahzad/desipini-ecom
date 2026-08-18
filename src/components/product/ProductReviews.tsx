import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { StarRating, StarRatingInput } from '@/components/ui/StarRating'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import * as reviewService from '@/services/reviews'
import type { Review } from '@/types/database'

export function ProductReviews({ productId }: { productId: string }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [canReview, setCanReview] = useState(false)
  const [myReview, setMyReview] = useState<Review | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let mounted = true
    reviewService.fetchProductReviews(productId).then((data) => mounted && setReviews(data)).finally(() => mounted && setLoading(false))
    if (user) {
      reviewService.canReviewProduct(user.id, productId).then((v) => mounted && setCanReview(v))
      reviewService.fetchMyReviewForProduct(user.id, productId).then((r) => {
        if (!mounted || !r) return
        setMyReview(r)
        setRating(r.rating)
        setComment(r.comment ?? '')
      })
    }
    return () => {
      mounted = false
    }
  }, [productId, user])

  async function handleSubmit() {
    if (!user) return
    setSubmitting(true)
    try {
      await reviewService.submitReview(user.id, productId, rating, comment)
      toast.success(myReview ? 'Review updated' : 'Thanks for your review!', {
        description: 'It will appear once approved by our team.',
      })
      setMyReview({ id: 'pending', product_id: productId, user_id: user.id, order_id: null, rating, comment, is_approved: false, created_at: new Date().toISOString() })
    } catch (e: any) {
      toast.error('Could not submit review', { description: e.message })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <h3 className="font-display text-2xl text-ink">Reviews</h3>
        {reviews.length > 0 && <StarRating value={reviews.reduce((s, r) => s + r.rating, 0) / reviews.length} count={reviews.length} />}
      </div>

      {canReview && (
        <div className="rounded-lg border border-sand-line bg-white/50 p-5 mb-8">
          <p className="text-sm font-medium text-ink mb-3">{myReview ? 'Update your review' : 'Write a review'}</p>
          <StarRatingInput value={rating} onChange={setRating} />
          <Textarea
            className="mt-3"
            rows={3}
            placeholder="Share your thoughts about this product…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <Button className="mt-3" size="sm" loading={submitting} onClick={handleSubmit}>
            {myReview ? 'Update Review' : 'Submit Review'}
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-20 bg-sand/40 rounded-lg animate-pulse" />)}
        </div>
      ) : reviews.length === 0 ? (
        <EmptyState icon={<MessageSquare className="h-5 w-5" />} title="No reviews yet" description="Be the first to share your thoughts." />
      ) : (
        <div className="flex flex-col divide-y divide-sand-line">
          {reviews.map((r) => (
            <div key={r.id} className="py-5 first:pt-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-ink">{r.reviewer_name ?? 'Verified Customer'}</span>
                <span className="text-xs text-ink/40">{formatDate(r.created_at)}</span>
              </div>
              <StarRating value={r.rating} size={13} />
              {r.comment && <p className="text-sm text-ink/70 mt-2 leading-relaxed">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
