import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input, Label, FieldError } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    toast.success('Welcome back')
    const from = (location.state as any)?.from ?? '/'
    navigate(from, { replace: true })
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to continue to your account">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <Label htmlFor="password" className="mb-0">Password</Label>
            <Link to="/forgot-password" className="text-xs text-moss-dark hover:underline">Forgot password?</Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        <FieldError>{error}</FieldError>
        <Button type="submit" size="lg" className="w-full mt-2" loading={loading}>Sign In</Button>
      </form>
      <p className="text-center text-sm text-ink/55 mt-6">
        Don&rsquo;t have an account? <Link to="/signup" className="text-moss-dark font-medium hover:underline">Sign up</Link>
      </p>
    </AuthLayout>
  )
}
