import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input, Label, FieldError } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function ForgotPasswordPage() {
  const { sendPasswordReset } = useAuth()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await sendPasswordReset(email)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a password reset link.">
        <p className="text-sm text-ink/60 text-center">
          Follow the link in your email to choose a new password, then{' '}
          <Link to="/login" className="text-moss-dark font-medium hover:underline">sign in</Link>.
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Reset your password" subtitle="Enter your email and we'll send you a reset link">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>Send Reset Link</Button>
      </form>
      <p className="text-center text-sm text-ink/55 mt-6">
        <Link to="/login" className="text-moss-dark font-medium hover:underline">Back to sign in</Link>
      </p>
    </AuthLayout>
  )
}
