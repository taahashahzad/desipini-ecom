import { useState } from 'react'
import { NavLink, Outlet, Link } from 'react-router-dom'
import {
  LayoutDashboard, Package, FolderTree, ShoppingCart, Users, Star,
  Ticket, Boxes, BarChart3, Settings, Menu, X, ChevronLeft, ExternalLink,
} from 'lucide-react'
import { cn, initials } from '@/lib/utils'
import { useAuth } from '@/context/AuthContext'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: FolderTree },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/reviews', label: 'Reviews', icon: Star },
  { to: '/admin/coupons', label: 'Coupons', icon: Ticket },
  { to: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { to: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
]

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { profile } = useAuth()

  return (
    <div className="min-h-screen flex bg-bone-dim">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col shrink-0 border-r border-sand-line bg-ink text-bone transition-all duration-200',
          collapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-bone/10">
          {!collapsed && <span className="font-display text-xl">Meridian</span>}
          <button onClick={() => setCollapsed((c) => !c)} className="p-1.5 text-bone/50 hover:text-bone">
            <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                  isActive ? 'bg-bone/10 text-bone' : 'text-bone/55 hover:bg-bone/5 hover:text-bone'
                )
              }
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-bone/10">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-bone/55 hover:bg-bone/5 hover:text-bone">
            <ExternalLink className="h-[18px] w-[18px] shrink-0" />
            {!collapsed && 'View Store'}
          </Link>
        </div>
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-ink/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-ink text-bone flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b border-bone/10">
              <span className="font-display text-xl">Meridian</span>
              <button onClick={() => setMobileOpen(false)}><X className="h-5 w-5" /></button>
            </div>
            <nav className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-0.5">
              {NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn('flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium', isActive ? 'bg-bone/10 text-bone' : 'text-bone/55')
                  }
                >
                  <item.icon className="h-[18px] w-[18px]" />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-16 border-b border-sand-line bg-bone flex items-center justify-between px-5 sticky top-0 z-30">
          <button className="lg:hidden p-1.5 text-ink/60" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden lg:block" />
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-moss text-bone flex items-center justify-center text-xs font-display">
              {initials(profile?.full_name)}
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-ink leading-none">{profile?.full_name || 'Admin'}</p>
              <p className="text-xs text-ink/40 mt-0.5">Administrator</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-5 sm:p-8 max-w-[1600px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
