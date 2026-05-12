'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui';

interface ProductItem {
  rank: number; name: string; category: string; revenue: number; quantity: number; avgPrice: number;
}
interface MonthData {
  month: string; label: string; revenue: number; orders: number; aov: number; changeVsPrevMonth: number;
}
interface WeekData {
  week: string; label: string; revenue: number; orders: number; aov: number;
}
interface DowData {
  day: number; dayName: string; revenue: number; orders: number; aov: number;
}
interface StoreTopProduct { storeName: string; topProduct: string | null; revenue: number; }

interface TrendsData {
  bestSellingProducts: ProductItem[];
  salesTrendWeekly: WeekData[];
  salesTrendMonthly: MonthData[];
  topProductByStore: StoreTopProduct[];
  bestDayOfWeek: DowData | null;
  worstDayOfWeek: DowData | null;
  dayOfWeekData: DowData[];
  repeatCustomerRate: number | null;
  repeatCustomerNote: string;
  hasProductData: boolean;
  totalOrders: number;
  totalRevenue: number;
}

export default function TrendsPage() {
  const [data, setData] = useState<TrendsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'products' | 'sales' | 'customers'>( 'products' );

  useEffect(() => {
    (async () => {
      try {
        const cached = localStorage.getItem('cache_trends_v2');
        if (cached) { setData(JSON.parse(cached)); setLoading(false); }
      } catch {}
      try {
        const res = await fetch('/api/analytics/trends');
        if (res.ok) {
          const d = await res.json();
          setData(d);
          try { localStorage.setItem('cache_trends_v2', JSON.stringify(d)); } catch {}
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 text-center py-16"><p className="text-slate-600">Loading trends &amp; patterns...</p></div>
    </DashboardLayout>
  );

  if (!data || data.totalOrders === 0) return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Trends &amp; Patterns</h1>
        <Card className="p-12 text-center"><p className="text-slate-600">No data available. Please upload data files first.</p></Card>
      </div>
    </DashboardLayout>
  );

  const maxMonthly = Math.max(...data.salesTrendMonthly.map(m => m.revenue), 1);
  const maxWeekly = Math.max(...data.salesTrendWeekly.map(w => w.revenue), 1);
  const maxDow = Math.max(...(data.dayOfWeekData || []).map(d => d.revenue), 1);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Trends &amp; Patterns</h1>
          <p className="text-base text-slate-600 mt-2">Best-selling products, sales trends, and customer insights</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Revenue</p>
            <p className="text-xl font-bold text-slate-900">{fmt(data.totalRevenue)}</p>
          </Card>
          <Card className="p-4 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Orders</p>
            <p className="text-xl font-bold text-slate-900">{data.totalOrders.toLocaleString()}</p>
          </Card>
          {data.bestDayOfWeek && (
            <Card className="p-4 text-center bg-emerald-50 border-emerald-200">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">Best Day</p>
              <p className="text-xl font-bold text-slate-900">{data.bestDayOfWeek.dayName}</p>
              <p className="text-xs text-slate-500">{fmt(data.bestDayOfWeek.revenue)}</p>
            </Card>
          )}
          {data.worstDayOfWeek && (
            <Card className="p-4 text-center bg-rose-50 border-rose-200">
              <p className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">Quietest Day</p>
              <p className="text-xl font-bold text-slate-900">{data.worstDayOfWeek.dayName}</p>
              <p className="text-xs text-slate-500">{fmt(data.worstDayOfWeek.revenue)}</p>
            </Card>
          )}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          {(['products', 'sales', 'customers'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm capitalize transition-colors ${view === v ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {v === 'products' ? 'Best-Selling Products' : v === 'sales' ? 'Sales Trends' : 'Customer Insights'}
            </button>
          ))}
        </div>

        {/* Products View */}
        {view === 'products' && (
          <>
            {!data.hasProductData ? (
              <Card className="p-12 text-center bg-amber-50 border-amber-200">
                <p className="text-lg font-semibold mb-2">No Product-Level Data</p>
                <p className="text-slate-600">Upload product-sales CSV files from TakeMyPayments to see best-selling products.</p>
              </Card>
            ) : (
              <>
                <Card className="p-6 mb-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-5">Top 10 Best-Selling Products</h2>
                  <div className="space-y-2">
                    {data.bestSellingProducts.map(p => (
                      <div key={p.name} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 border border-slate-100">
                        <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-white text-xs font-bold">{p.rank}</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                          <p className="text-xs text-slate-500">{p.category} &middot; {p.quantity} sold &middot; avg {fmt(p.avgPrice)}</p>
                        </div>
                        <p className="font-bold text-slate-900 text-sm">{fmt(p.revenue)}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                {data.topProductByStore.length > 0 && (
                  <Card className="p-6">
                    <h2 className="text-xl font-bold text-slate-900 mb-5">Top Product per Store</h2>
                    <div className="space-y-2">
                      {data.topProductByStore.map(s => (
                        <div key={s.storeName} className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 bg-slate-50">
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-900 text-sm">{s.storeName}</p>
                            <p className="text-xs text-slate-500">{s.topProduct || 'No product data'}</p>
                          </div>
                          {s.topProduct && <p className="font-bold text-slate-900 text-sm">{fmt(s.revenue)}</p>}
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </>
            )}
          </>
        )}

        {/* Sales Trends View */}
        {view === 'sales' && (
          <>
            {/* Monthly */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Monthly Revenue Trend</h2>
              {data.salesTrendMonthly.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No monthly data available</p>
              ) : (
                <div className="space-y-3">
                  {data.salesTrendMonthly.map(m => (
                    <div key={m.month} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-600 w-16">{m.label}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-6 relative overflow-hidden">
                        <div
                          className="h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center pl-2 transition-all duration-500"
                          style={{ width: `${Math.max((m.revenue / maxMonthly) * 100, 2)}%` }}
                        >
                          {(m.revenue / maxMonthly) > 0.25 && (
                            <span className="text-white text-xs font-bold">{fmt(m.revenue)}</span>
                          )}
                        </div>
                      </div>
                      <span className="text-sm font-bold text-slate-900 w-20 text-right">{fmt(m.revenue)}</span>
                      {m.changeVsPrevMonth !== 0 && (
                        <span className={`text-xs font-bold w-14 text-right ${m.changeVsPrevMonth > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {m.changeVsPrevMonth > 0 ? '+' : ''}{m.changeVsPrevMonth.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Weekly */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Weekly Revenue (Last 12 Weeks)</h2>
              <p className="text-sm text-slate-500 mb-5">? Scroll left for older data</p>
              <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-max pb-4">
                  {data.salesTrendWeekly.map(w => (
                    <div key={w.week} className="flex flex-col items-center min-w-[80px]">
                      <span className="text-xs font-bold text-slate-900 mb-1">{fmt(w.revenue)}</span>
                      <div className="flex flex-col items-center justify-end h-40 w-full">
                        <div
                          className="w-12 bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-md"
                          style={{ height: `${Math.max((w.revenue / maxWeekly) * 100, 5)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 mt-1 text-center">{w.label}</span>
                      <span className="text-xs text-slate-400">{w.orders} orders</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Day of week */}
            {data.dayOfWeekData && data.dayOfWeekData.length > 0 && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-5">Revenue by Day of Week</h2>
                <div className="space-y-3">
                  {data.dayOfWeekData.map(d => (
                    <div key={d.day} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-slate-600 w-24">{d.dayName}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-5 relative overflow-hidden">
                        <div
                          className={`h-5 rounded-full ${d === data.bestDayOfWeek ? 'bg-emerald-500' : d === data.worstDayOfWeek ? 'bg-rose-400' : 'bg-slate-500'}`}
                          style={{ width: `${Math.max((d.revenue / maxDow) * 100, 2)}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-900 w-24 text-right">{fmt(d.revenue)}</span>
                      <span className="text-xs text-slate-500 w-16 text-right">{d.orders} orders</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* Customer Insights View */}
        {view === 'customers' && (
          <Card className="p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Repeat Customer Analysis</h2>
            {data.repeatCustomerRate !== null ? (
              <>
                <div className="flex items-center gap-6 mb-6">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-slate-900">{data.repeatCustomerRate.toFixed(1)}%</p>
                    <p className="text-sm text-slate-500 mt-1">Repeat customer rate</p>
                  </div>
                </div>
                <p className="text-slate-600 text-sm">{data.repeatCustomerNote}</p>
              </>
            ) : (
              <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
                <p className="font-semibold text-slate-900 mb-2">Data Not Available</p>
                <p className="text-slate-600 text-sm">{data.repeatCustomerNote}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
