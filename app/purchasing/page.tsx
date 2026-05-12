'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatCard } from '../components/ui';

interface SpendStore {
  storeName: string;
  spend: number;
  orders: number;
  avgOrder: number;
  topCategory: string;
}

interface SpendCategory {
  category: string;
  spend: number;
  orders: number;
  percentage: number;
}

interface PeriodEntry {
  period: string;
  spend: number;
  orders: number;
}

interface PurchasingData {
  totalSpend: number;
  totalOrders: number;
  avgOrderValue: number;
  spendByStore: SpendStore[];
  spendByCategory: SpendCategory[];
  availableStores: string[];
  periodData: PeriodEntry[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Coffee: 'bg-amber-500',
  Tea: 'bg-green-500',
  'Hot Chocolate': 'bg-orange-500',
  'Cold Drinks': 'bg-sky-500',
  Bakery: 'bg-yellow-500',
  Breakfast: 'bg-rose-400',
  Packaging: 'bg-slate-500',
  'Dairy & Ingredients': 'bg-blue-400',
  'Food & Snacks': 'bg-emerald-500',
  'Hot Food': 'bg-red-500',
  'Cold Food': 'bg-cyan-500',
  Other: 'bg-slate-400',
};

export default function PurchasingPage() {
  const [data, setData] = useState<PurchasingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState('All Sites');
  const [view, setView] = useState<'overview' | 'by-site' | 'by-category' | 'trends'>('overview');

  const fetchData = useCallback(async () => {
    const cacheKey = `cache_purchasing_${selectedStore}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    try {
      const params = new URLSearchParams();
      if (selectedStore !== 'All Sites') params.set('storeName', selectedStore);
      const response = await fetch(`/api/analytics/purchasing?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch purchasing data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStore]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);

  const formatMonth = (period: string) => {
    const [year, month] = period.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading purchasing data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const maxSpend = Math.max(...(data?.spendByStore.map(s => s.spend) ?? []), 0);
  const maxCategorySpend = Math.max(...(data?.spendByCategory.map(c => c.spend) ?? []), 0);
  const maxPeriodSpend = Math.max(...(data?.periodData.map(p => p.spend) ?? []), 0);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Booker Spend</h1>
        </div>

        {(!data || data.totalOrders === 0) ? (
          <Card className="p-12 text-center">
            <p className="text-slate-600 mb-2 font-medium">No purchasing data available.</p>
            <p className="text-slate-400 text-sm">Upload Booker data files to see spend breakdown by site and category.</p>
          </Card>
        ) : (
          <>
            {/* Store Filter */}
            {(data.availableStores?.length ?? 0) > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {['All Sites', ...(data.availableStores ?? [])].map(store => (
                  <button
                    key={store}
                    onClick={() => setSelectedStore(store)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                      selectedStore === store
                        ? 'bg-emerald-700 text-white shadow'
                        : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                    }`}
                  >
                    {store}
                  </button>
                ))}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <StatCard title="Total Spend" value={fmt(data.totalSpend)} />
              <StatCard title="Total Orders" value={data.totalOrders.toLocaleString()} />
              <StatCard title="Avg Order Value" value={fmt(data.avgOrderValue)} />
            </div>

            {/* View Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {([
                ['overview', 'Overview'],
                ['by-site', 'By Site'],
                ['by-category', 'By Category'],
                ['trends', 'Monthly Trends'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setView(id)}
                  className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
                    view === id
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Overview */}
            {view === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Top Spending Sites</h3>
                  <div className="space-y-3">
                    {data.spendByStore.slice(0, 5).map((site, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className="w-6 text-xs font-bold text-slate-400 text-right">#{i + 1}</div>
                        <div className="w-28 text-sm font-medium text-slate-700 truncate">{site.storeName}</div>
                        <div className="flex-1 bg-slate-100 rounded-full h-6 relative">
                          <div className="bg-emerald-500 h-6 rounded-full transition-all" style={{ width: `${maxSpend > 0 ? (site.spend / maxSpend) * 100 : 0}%` }} />
                        </div>
                        <div className="text-xs font-semibold text-slate-700 w-20 text-right flex-shrink-0">{fmt(site.spend)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Spend by Category</h3>
                  <div className="space-y-3">
                    {data.spendByCategory.slice(0, 7).map((cat, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${CATEGORY_COLORS[cat.category] || 'bg-slate-400'}`} />
                        <div className="w-32 text-sm font-medium text-slate-700 truncate">{cat.category}</div>
                        <div className="flex-1 bg-slate-100 rounded-full h-5 relative">
                          <div className={`h-5 rounded-full transition-all ${CATEGORY_COLORS[cat.category] || 'bg-slate-400'}`} style={{ width: `${cat.percentage}%` }} />
                        </div>
                        <div className="text-xs font-semibold text-slate-600 w-12 text-right">{cat.percentage.toFixed(1)}%</div>
                        <div className="text-xs text-slate-500 w-16 text-right">{fmt(cat.spend)}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* By Site */}
            {view === 'by-site' && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Spend by Site</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rank</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Site</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total Spend</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Orders</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Avg Order</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Top Category</th>
                        <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.spendByStore.map((site, index) => (
                        <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-200 text-slate-700' : index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>#{index + 1}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">{site.storeName}</td>
                          <td className="py-3 px-4 text-right font-semibold text-slate-900">{fmt(site.spend)}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{site.orders}</td>
                          <td className="py-3 px-4 text-right text-slate-600">{fmt(site.avgOrder)}</td>
                          <td className="py-3 px-4"><span className={`text-xs px-2 py-1 rounded-full text-white ${CATEGORY_COLORS[site.topCategory] || 'bg-slate-400'}`}>{site.topCategory}</span></td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${data.totalSpend > 0 ? (site.spend / data.totalSpend) * 100 : 0}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-slate-600 w-10 text-right">{data.totalSpend > 0 ? ((site.spend / data.totalSpend) * 100).toFixed(1) : '0'}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}

            {/* By Category */}
            {view === 'by-category' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Spend by Category</h3>
                  <div className="space-y-4">
                    {data.spendByCategory.map((cat, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${CATEGORY_COLORS[cat.category] || 'bg-slate-400'}`} />
                        <div className="w-36 text-sm font-semibold text-slate-900 truncate">{cat.category}</div>
                        <div className="flex-1 bg-slate-100 rounded-full h-8 relative">
                          <div className={`h-8 rounded-full transition-all ${CATEGORY_COLORS[cat.category] || 'bg-slate-400'}`} style={{ width: `${maxCategorySpend > 0 ? (cat.spend / maxCategorySpend) * 100 : 0}%` }} />
                        </div>
                        <div className="text-xs font-bold text-black whitespace-nowrap">{fmt(cat.spend)} · {cat.orders} orders</div>
                        <div className="text-sm font-bold text-slate-700 w-12 text-right">{cat.percentage.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {data.spendByCategory.map((cat, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${CATEGORY_COLORS[cat.category] || 'bg-slate-400'}`} />
                        <p className="text-xs font-semibold text-slate-700">{cat.category}</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{fmt(cat.spend)}</p>
                      <p className="text-xs text-slate-500">{cat.orders} orders · {cat.percentage.toFixed(1)}% of total</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Monthly Trends */}
            {view === 'trends' && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Monthly Purchasing Spend</h3>
                {data.periodData.length === 0 ? (
                  <p className="text-slate-500 text-sm">No period data available.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <div style={{ minWidth: `${Math.max(data.periodData.length * 80, 400)}px` }}>
                      <div className="flex items-end gap-2 mb-2" style={{ height: '192px' }}>
                        {data.periodData.map((entry, i) => {
                          const barHeight = maxPeriodSpend > 0 ? Math.max((entry.spend / maxPeriodSpend) * 192, entry.spend > 0 ? 4 : 0) : 0;
                          return (
                            <div key={i} style={{ width: '72px', flexShrink: 0, height: `${barHeight}px` }}
                              className="bg-emerald-500 rounded-t transition-all hover:bg-emerald-600"
                              title={`${formatMonth(entry.period)}: ${fmt(entry.spend)}`}
                            />
                          );
                        })}
                      </div>
                      <div className="flex gap-2">
                        {data.periodData.map((entry, i) => (
                          <div key={i} className="text-center" style={{ width: '72px', flexShrink: 0 }}>
                            <p className="text-xs text-slate-600 font-medium">{formatMonth(entry.period)}</p>
                            <p className="text-xs font-semibold text-slate-900">{fmt(entry.spend)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
