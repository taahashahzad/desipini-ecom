import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { Input, Label } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabase'
import { initials } from '@/lib/utils'
import { uploadImage } from '@/services/storage'
import { Camera } from 'lucide-react'

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [phone, setPhone] = useState(profile?.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    try {
      const { error } = await supabase.from('profiles').update({ full_name: fullName, phone }).eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      toast.success('Profile updated')
    } catch (e: any) {
      toast.error('Could not update profile', { description: e.message })
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const { url } = await uploadImage('avatars', file)
      const { error } = await supabase.from('profiles').update({ avatar_url: url }).eq('id', user.id)
      if (error) throw error
      await refreshProfile()
      toast.success('Avatar updated')
    } catch (e: any) {
      toast.error('Could not upload avatar', { description: e.message })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Profile</h1>

      <div className="flex items-center gap-5 mb-8">
        <div className="relative h-20 w-20 rounded-full bg-moss text-bone flex items-center justify-center font-display text-xl overflow-hidden shrink-0">
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" />
          ) : (
            initials(profile?.full_name)
          )}
          <label className="absolute inset-0 bg-ink/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
            <Camera className="h-5 w-5 text-bone" />
            <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={uploading} />
          </label>
        </div>
        <div>
          <p className="text-sm font-medium text-ink">{profile?.full_name || 'Add your name'}</p>
          <p className="text-xs text-ink/45">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="max-w-md flex flex-col gap-4">
        <div>
          <Label>Full Name</Label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <Label>Email</Label>
          <Input value={user?.email ?? ''} disabled />
        </div>
        <div>
          <Label>Phone</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92 300 1234567" />
        </div>
        <Button type="submit" loading={saving} className="w-fit mt-2">Save Changes</Button>
      </form>
    </div>
  )
}
