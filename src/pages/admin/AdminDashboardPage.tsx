import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { DollarSign, ShoppingCart, Package, Users, Clock, AlertTriangle } from 'lucide-react'
import { fetchDashboardStats, fetchRevenueSeries, fetchTopProducts, type DashboardStats } from '@/services/analytics'
import { adminFetchOrders } from '@/services/orders'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { STATUS_LABELS, STATUS_TONE } from '@/components/shared/OrderTimeline'
import type { Order } from '@/types/database'

const RANGE_OPTIONS = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: '6m', label: '6 Months' },
  { value: '1y', label: '1 Year' },
] as const

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [range, setRange] = useState<'7d' | '30d' | '6m' | '1y'>('30d')
  const [series, setSeries] = useState<{ date: string; revenue: number; orders: number }[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; units: number; revenue: number }[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats().then(setStats)
    fetchTopProducts(5).then(setTopProducts)
    adminFetchOrders({ pageSize: 6 }).then((r) => setRecentOrders(r.orders))
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchRevenueSeries(range).then(setSeries)
  }, [range])

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon={<DollarSign className="h-4 w-4" />} label="Total Revenue" value={stats ? formatCurrency(stats.totalRevenue) : null} tone="moss" />
        <StatCard icon={<ShoppingCart className="h-4 w-4" />} label="Total Orders" value={stats?.totalOrders} tone="ink" />
        <StatCard icon={<Package className="h-4 w-4" />} label="Total Products" value={stats?.totalProducts} tone="gold" />
        <StatCard icon={<Users className="h-4 w-4" />} label="Total Customers" value={stats?.totalCustomers} tone="clay" />
        <StatCard icon={<Clock className="h-4 w-4" />} label="Pending Orders" value={stats?.pendingOrders} tone="warning" />
        <StatCard icon={<AlertTriangle className="h-4 w-4" />} label="Low Stock" value={stats?.lowStockProducts} tone="danger" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Revenue Overview</CardTitle>
            <div className="flex gap-1">
              {RANGE_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRange(r.value)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                    range === r.value ? 'bg-ink text-bone' : 'text-ink/50 hover:bg-sand/50'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={series} margin={{ left: -20, right: 10 }}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#435941" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#435941" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="#e4ddc9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6355' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b6355' }} axisLine={false} tickLine={false} width={50} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, borderColor: '#e4ddc9', fontSize: 13 }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#435941" strokeWidth={2} fill="url(#revenueFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Products</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4">
            {topProducts.length === 0 ? (
              <p className="text-sm text-ink/45">No sales yet</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.name + i} className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-md bg-sand/60 text-xs font-semibold text-ink/60 flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-ink truncate">{p.name}</p>
                    <p className="text-xs text-ink/45">{p.units} sold</p>
                  </div>
                  <span className="text-sm font-medium text-ink tabular-nums">{formatCurrency(p.revenue)}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Orders</CardTitle>
          <Link to="/admin/orders" className="text-sm text-moss-dark hover:underline">View all</Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-t border-sand-line text-left text-xs uppercase tracking-wide text-ink/40">
                  <th className="px-5 py-3 font-medium">Order ID</th>
                  <th className="px-5 py-3 font-medium">Customer</th>
                  <th className="px-5 py-3 font-medium">Date</th>
                  <th className="px-5 py-3 font-medium">Amount</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-line">
                {loading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i}><td colSpan={5} className="px-5 py-3.5"><Skeleton className="h-4 w-full" /></td></tr>
                  ))
                ) : (
                  recentOrders.map((o) => (
                    <tr key={o.id} className="hover:bg-sand/20">
                      <td className="px-5 py-3.5"><Link to={`/admin/orders/${o.id}`} className="font-medium text-ink hover:underline">{o.order_number}</Link></td>
                      <td className="px-5 py-3.5 text-ink/70">{o.customer_name}</td>
                      <td className="px-5 py-3.5 text-ink/50">{formatDate(o.created_at)}</td>
                      <td className="px-5 py-3.5 text-ink tabular-nums">{formatCurrency(o.total_amount)}</td>
                      <td className="px-5 py-3.5"><Badge tone={STATUS_TONE[o.status]}>{STATUS_LABELS[o.status]}</Badge></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

const TONE_CLASSES: Record<string, string> = {
  moss: 'bg-moss/10 text-moss-dark',
  ink: 'bg-ink/10 text-ink',
  gold: 'bg-gold/10 text-gold',
  clay: 'bg-clay/10 text-clay',
  warning: 'bg-warning/10 text-warning',
  danger: 'bg-danger/10 text-danger',
}

function StatCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string | number | undefined | null; tone: string }) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className={`h-8 w-8 rounded-md flex items-center justify-center mb-3 ${TONE_CLASSES[tone] ?? TONE_CLASSES.ink}`}>
          {icon}
        </div>
        <p className="text-xs text-ink/45 mb-1">{label}</p>
        {value === null || value === undefined ? (
          <Skeleton className="h-6 w-16" />
        ) : (
          <p className="font-display text-xl text-ink tabular-nums">{value}</p>
        )}
      </CardContent>
    </Card>
  )
}
