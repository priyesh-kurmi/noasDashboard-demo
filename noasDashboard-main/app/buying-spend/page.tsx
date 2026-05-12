'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui';

interface WeekData {
  week: string; label: string; spend: number; sales: number;
  avg4Week: number; wowChange: number; spendOfSalesPct: number | null;
}

interface StoreWeekly {
  storeName: string;
  weeks: Array<{ week: string; label: string; spend: number; avg4Week: number; wowChange: number; spendOfSalesPct: number | null }>;
  totalSpend: number;
}

interface BuyingSpendData {
  weeklySpend: WeekData[];
  storeWeekly: StoreWeekly[];
  availableStores: string[];
  totalSpend: number;
  avgWeeklySpend: number;
  message?: string;
}

const fmt = (v: number) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);

export default function BuyingSpendPage() {
  const [data, setData] = useState<BuyingSpendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [view, setView] = useState<'overall' | 'by-store'>('overall');

  useEffect(() => {
    (async () => {
      try {
        const cached = localStorage.getItem('cache_buying_spend_v1');
        if (cached) { setData(JSON.parse(cached)); setLoading(false); }
      } catch {}
      try {
        const res = await fetch('/api/analytics/buying-spend');
        if (res.ok) {
          const d = await res.json();
          setData(d);
          try { localStorage.setItem('cache_buying_spend_v1', JSON.stringify(d)); } catch {}
        }
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (loading) return (
    <DashboardLayout>
      <div className="p-8 text-center py-16"><p className="text-slate-600">Loading buying & spend data...</p></div>
    </DashboardLayout>
  );

  if (!data) return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Buying &amp; Spend</h1>
        <Card className="p-12 text-center"><p className="text-slate-600">No data available.</p></Card>
      </div>
    </DashboardLayout>
  );

  if (data.message && data.weeklySpend.length === 0) return (
    <DashboardLayout>
      <div className="p-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Buying &amp; Spend</h1>
        <Card className="p-12 text-center bg-amber-50 border-amber-200">
          <p className="font-semibold text-slate-900 mb-2">No Purchasing Data</p>
          <p className="text-slate-600">{data.message}</p>
        </Card>
      </div>
    </DashboardLayout>
  );

  const recentWeeks = data.weeklySpend.slice(-8);
  const maxSpend = Math.max(...recentWeeks.map(w => w.spend), 1);

  const storeData = selectedStore === 'All Stores' ? null : data.storeWeekly.find(s => s.storeName === selectedStore);
  const displayWeeks = storeData ? storeData.weeks.slice(-8) : recentWeeks;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Buying &amp; Spend</h1>
          <p className="text-base text-slate-600 mt-2">Weekly stock spend from Booker purchasing data</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card className="p-5 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Total Spend</p>
            <p className="text-2xl font-bold text-slate-900">{fmt(data.totalSpend)}</p>
          </Card>
          <Card className="p-5 text-center">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Avg Weekly Spend</p>
            <p className="text-2xl font-bold text-slate-900">{fmt(data.avgWeeklySpend)}</p>
          </Card>
          {recentWeeks.length > 0 && (
            <Card className="p-5 text-center">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Latest Week</p>
              <p className="text-2xl font-bold text-slate-900">{fmt(recentWeeks[recentWeeks.length - 1].spend)}</p>
              {recentWeeks[recentWeeks.length - 1].wowChange !== 0 && (
                <p className={`text-xs font-bold mt-1 ${recentWeeks[recentWeeks.length - 1].wowChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {recentWeeks[recentWeeks.length - 1].wowChange > 0 ? '+' : ''}{recentWeeks[recentWeeks.length - 1].wowChange.toFixed(1)}% WoW
                </p>
              )}
            </Card>
          )}
        </div>

        {/* Store Filter */}
        <div className="mb-6 flex flex-wrap gap-2 items-center">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Store:</p>
          {['All Stores', ...(data.availableStores || [])].map(store => (
            <button key={store} onClick={() => setSelectedStore(store)}
              className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                selectedStore === store ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}>
              {store}
            </button>
          ))}
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          {(['overall', 'by-store'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${view === v ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
              {v === 'overall' ? 'Overview' : 'By Store'}
            </button>
          ))}
        </div>

        {view === 'overall' && (
          <>
            {/* Weekly Spend Chart */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-2">Weekly Spend — Last 8 Weeks</h2>
              <p className="text-sm text-slate-500 mb-5">Blue = actual spend, dashed line = 4-week average</p>
              <div className="overflow-x-auto">
                <div className="flex gap-4 min-w-max pb-2">
                  {displayWeeks.map(w => (
                    <div key={w.week} className="flex flex-col items-center min-w-[90px]">
                      <span className="text-xs font-bold text-slate-900 mb-1">{fmt(w.spend)}</span>
                      <div className="flex flex-col items-center justify-end h-40 w-full relative">
                        <div
                          className="w-14 bg-gradient-to-t from-blue-600 to-indigo-500 rounded-t-md"
                          style={{ height: `${Math.max((('spend' in w ? w.spend : 0) / maxSpend) * 100, 5)}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-600 mt-1 font-semibold">{w.label}</span>
                      {'wowChange' in w && w.wowChange !== 0 && (
                        <span className={`text-xs font-bold ${w.wowChange > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
                          {w.wowChange > 0 ? '+' : ''}{w.wowChange.toFixed(1)}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Weekly detail table */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Weekly Spend Detail</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-3 font-semibold text-slate-600">Week</th>
                      <th className="text-right py-3 px-3 font-semibold text-slate-600">Spend</th>
                      <th className="text-right py-3 px-3 font-semibold text-slate-600">4-Wk Avg</th>
                      <th className="text-right py-3 px-3 font-semibold text-slate-600">WoW Change</th>
                      {'spendOfSalesPct' in (displayWeeks[0] || {}) && (
                        <th className="text-right py-3 px-3 font-semibold text-slate-600">% of Sales</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {displayWeeks.slice().reverse().map(w => (
                      <tr key={w.week} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-3 px-3 font-semibold text-slate-900">{w.label} <span className="text-xs text-slate-400">({w.week})</span></td>
                        <td className="py-3 px-3 text-right font-bold text-slate-900">{fmt(w.spend)}</td>
                        <td className="py-3 px-3 text-right text-slate-600">{fmt(w.avg4Week)}</td>
                        <td className={`py-3 px-3 text-right font-semibold ${w.wowChange > 0 ? 'text-rose-600' : w.wowChange < 0 ? 'text-emerald-600' : 'text-slate-500'}`}>
                          {w.wowChange === 0 ? '—' : `${w.wowChange > 0 ? '+' : ''}${w.wowChange.toFixed(1)}%`}
                        </td>
                        {w.spendOfSalesPct !== undefined && (
                          <td className="py-3 px-3 text-right text-slate-600">
                            {w.spendOfSalesPct !== null ? `${w.spendOfSalesPct.toFixed(1)}%` : '—'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </>
        )}

        {view === 'by-store' && (
          <div className="space-y-6">
            {data.storeWeekly.map(store => {
              const storeWeeks = store.weeks.slice(-8);
              const maxS = Math.max(...storeWeeks.map(w => w.spend), 1);
              return (
                <Card key={store.storeName} className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{store.storeName}</h2>
                      <p className="text-sm text-slate-500">Total spend: <span className="font-bold text-slate-800">{fmt(store.totalSpend)}</span></p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-200">
                          <th className="text-left py-2 px-3 font-semibold text-slate-600">Week</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-600">Spend</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-600">4-Wk Avg</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-600">WoW</th>
                          <th className="text-right py-2 px-3 font-semibold text-slate-600">% of Sales</th>
                        </tr>
                      </thead>
                      <tbody>
                        {storeWeeks.slice().reverse().map(w => (
                          <tr key={w.week} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-2 px-3 font-medium text-slate-900">{w.label}</td>
                            <td className="py-2 px-3 text-right font-bold text-slate-900">{fmt(w.spend)}</td>
                            <td className="py-2 px-3 text-right text-slate-600">{fmt(w.avg4Week)}</td>
                            <td className={`py-2 px-3 text-right font-semibold text-xs ${w.wowChange > 0 ? 'text-rose-600' : w.wowChange < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {w.wowChange === 0 ? '—' : `${w.wowChange > 0 ? '+' : ''}${w.wowChange.toFixed(1)}%`}
                            </td>
                            <td className="py-2 px-3 text-right text-slate-600">
                              {w.spendOfSalesPct !== null ? `${w.spendOfSalesPct?.toFixed(1)}%` : '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
