import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input, Label, FieldError } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function SignupPage() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    const { error } = await signUp(email, password, fullName)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    setSubmitted(true)
    toast.success('Account created')
  }

  if (submitted) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent a confirmation link to your inbox.">
        <p className="text-sm text-ink/60 text-center">
          Once verified, you can{' '}
          <button onClick={() => navigate('/login')} className="text-moss-dark font-medium hover:underline">
            sign in
          </button>
          .
        </p>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join Meridian for a considered shopping experience">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="fullName">Full Name</Label>
          <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Jordan Lee" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>Create Account</Button>
      </form>
      <p className="text-center text-sm text-ink/55 mt-6">
        Already have an account? <Link to="/login" className="text-moss-dark font-medium hover:underline">Sign in</Link>
      </p>
    </AuthLayout>
  )
}
