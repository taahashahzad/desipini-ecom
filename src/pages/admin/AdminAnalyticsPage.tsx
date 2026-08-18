import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts'
import { fetchRevenueSeries, fetchTopProducts, fetchBestSellingCategories, fetchDashboardStats, type DashboardStats } from '@/services/analytics'
import { formatCurrency } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

const COLORS = ['#435941', '#a9863f', '#b3603f', '#6f8a68', '#d98a63', '#2f4030']

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [revenueSeries, setRevenueSeries] = useState<{ date: string; revenue: number; orders: number }[]>([])
  const [topProducts, setTopProducts] = useState<{ name: string; units: number; revenue: number }[]>([])
  const [topCategories, setTopCategories] = useState<{ name: string; revenue: number }[]>([])

  useEffect(() => {
    fetchDashboardStats().then(setStats)
    fetchRevenueSeries('30d').then(setRevenueSeries)
    fetchTopProducts(6).then(setTopProducts)
    fetchBestSellingCategories(6).then(setTopCategories)
  }, [])

  const avgOrderValue = stats && stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0

  return (
    <div>
      <h1 className="font-display text-2xl text-ink mb-6">Analytics</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard label="Revenue" value={stats ? formatCurrency(stats.totalRevenue) : '—'} />
        <MetricCard label="Orders" value={stats?.totalOrders ?? '—'} />
        <MetricCard label="Avg. Order Value" value={stats ? formatCurrency(Math.round(avgOrderValue)) : '—'} />
        <MetricCard label="Customers" value={stats?.totalCustomers ?? '—'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Order Volume (30 Days)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueSeries} margin={{ left: -20 }}>
                  <CartesianGrid vertical={false} stroke="#e4ddc9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6b6355' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#6b6355' }} axisLine={false} tickLine={false} width={40} />
                  <Tooltip contentStyle={{ borderRadius: 8, borderColor: '#e4ddc9', fontSize: 13 }} />
                  <Bar dataKey="orders" fill="#435941" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Best-Selling Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="h-72 flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={topCategories} dataKey="revenue" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
                    {topCategories.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => formatCurrency(Number(v))} contentStyle={{ borderRadius: 8, borderColor: '#e4ddc9', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-3 justify-center -mt-2">
              {topCategories.map((c, i) => (
                <div key={c.name} className="flex items-center gap-1.5 text-xs text-ink/60">
                  <span className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {c.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader><CardTitle>Best-Selling Products</CardTitle></CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-ink/40 border-t border-sand-line">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Units Sold</th>
                  <th className="px-5 py-3 font-medium">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sand-line">
                {topProducts.map((p) => (
                  <tr key={p.name}>
                    <td className="px-5 py-3.5 text-ink font-medium">{p.name}</td>
                    <td className="px-5 py-3.5 text-ink/60">{p.units}</td>
                    <td className="px-5 py-3.5 text-ink tabular-nums">{formatCurrency(p.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-xs text-ink/45 mb-1.5">{label}</p>
        <p className="font-display text-2xl text-ink tabular-nums">{value}</p>
      </CardContent>
    </Card>
  )
}
