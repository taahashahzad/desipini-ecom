import { NavLink, Outlet } from 'react-router-dom'
import { User, Package, Heart, MapPin, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { cn, initials } from '@/lib/utils'

const NAV = [
  { to: '/account', label: 'Profile', icon: User, end: true },
  { to: '/account/orders', label: 'My Orders', icon: Package },
  { to: '/account/wishlist', label: 'Wishlist', icon: Heart },
  { to: '/account/addresses', label: 'Addresses', icon: MapPin },
]

export function AccountLayout() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">
        <aside>
          <div className="flex items-center gap-3 mb-6 px-1">
            <div className="h-11 w-11 rounded-full bg-moss text-bone flex items-center justify-center font-display text-sm shrink-0">
              {initials(profile?.full_name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{profile?.full_name || 'My Account'}</p>
              <p className="text-xs text-ink/45 truncate">{user?.email}</p>
            </div>
          </div>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive ? 'bg-ink text-bone' : 'text-ink/65 hover:bg-sand/50 hover:text-ink'
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
            <button
              onClick={async () => {
                await signOut()
                navigate('/')
              }}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-md text-sm font-medium text-danger/80 hover:bg-danger/5 hover:text-danger transition-colors mt-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </nav>
        </aside>
        <div>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
