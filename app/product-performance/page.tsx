'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatCard } from '../components/ui';

interface ProductItem {
  name: string;
  revenue: number;
  quantity: number;
  category: string;
  rank: number;
  avgPrice: number;
}

interface CategoryEntry {
  category: string;
  revenue: number;
  percentage: number;
}

interface FoodDrinksSplit {
  Food: number; Drinks: number; Other: number;
  FoodPct: number; DrinksPct: number; OtherPct: number;
}

interface StoreBreakdown {
  storeName: string;
  topProducts: ProductItem[];
  bottomProducts: ProductItem[];
  totalProducts: number;
  totalRevenue: number;
  othersRevenue: number;
  othersCount: number;
  othersQuantity: number;
}

interface ProductPerformanceData {
  topProducts: ProductItem[];
  bottomProducts: ProductItem[];
  categorySplit: CategoryEntry[];
  categorySplitFoodDrinks: FoodDrinksSplit;
  totalProducts: number;
  hasProductData: boolean;
  message?: string;
  availableStores: string[];
  byStore: StoreBreakdown[];
}

const CATEGORY_COLORS: Record<string, string> = {
  'Hot Drinks': 'bg-amber-500',
  'Cold Drinks': 'bg-sky-500',
  'Bakery': 'bg-yellow-500',
  'Burgers & Fries': 'bg-red-500',
  'Paninis & Deli': 'bg-orange-500',
  'Jacket Potatos': 'bg-lime-600',
  'House Specials': 'bg-purple-500',
  'Extras ': 'bg-emerald-500',
  'Extras': 'bg-emerald-500',
  'Meal deal': 'bg-teal-500',
  'Other': 'bg-slate-400',
};

function getCatColor(cat: string) {
  return CATEGORY_COLORS[cat] || CATEGORY_COLORS['Other'];
}

export default function ProductPerformancePage() {
  const [data, setData] = useState<ProductPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState('All Stores');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [view, setView] = useState<'overall' | 'by-store'>('overall');

  const fetchData = useCallback(async (store = selectedStore, sd = startDate, ed = endDate) => {
    const cacheKey = `cache_product_perf_v2_${store}_${sd}_${ed}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    try {
      const params = new URLSearchParams();
      if (store && store !== 'All Stores') params.set('storeName', store);
      if (sd) params.set('startDate', sd);
      if (ed) params.set('endDate', ed);
      const response = await fetch(`/api/analytics/product-performance?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch product performance:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStore, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 text-center py-12">
          <p className="text-slate-600">Loading product performance...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Product Performance</h1>
          <Card className="p-12 text-center"><p className="text-slate-600">No data available. Upload product-sales files first.</p></Card>
        </div>
      </DashboardLayout>
    );
  }

  if (!data.hasProductData) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Product Performance</h1>
          <p className="text-base text-slate-600 mb-8">Top and bottom performing products by revenue</p>
          <Card className="p-12 text-center border-amber-200 bg-amber-50">
            <p className="text-lg font-semibold text-slate-900 mb-2">No Product-Level Data Yet</p>
            <p className="text-slate-600 max-w-xl mx-auto">{data.message || 'Upload product-sales CSV files from TakeMyPayments to see detailed analytics.'}</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const { categorySplitFoodDrinks: fdSplit } = data;
  const fdTotal = fdSplit.Food + fdSplit.Drinks + fdSplit.Other;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Product Performance</h1>
          <p className="text-base text-slate-600 mt-2 font-medium">
            {data.totalProducts} products tracked across all stores
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-3 items-end">
          {/* Store filter */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Store</p>
            <div className="flex flex-wrap gap-2">
              {['All Stores', ...(data.availableStores || [])].map(store => (
                <button
                  key={store}
                  onClick={() => { setSelectedStore(store); fetchData(store, startDate, endDate); }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                    selectedStore === store
                      ? 'bg-slate-900 text-white shadow'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {store}
                </button>
              ))}
            </div>
          </div>
          {/* Date range */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">From</span>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900" />
            <span className="text-sm text-slate-500">to</span>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900" />
            <button onClick={() => fetchData(selectedStore, startDate, endDate)}
              className="px-3 py-1.5 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700">
              Apply
            </button>
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); fetchData(selectedStore, '', ''); }}
                className="px-3 py-1.5 border border-slate-300 text-slate-600 rounded-lg text-sm hover:bg-slate-50">
                Clear
              </button>
            )}
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex gap-2 mb-6">
          {(['overall', 'by-store'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-5 py-2 rounded-lg font-semibold text-sm transition-colors ${
                view === v ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {v === 'overall' ? 'Overall' : 'By Store'}
            </button>
          ))}
        </div>

        {view === 'overall' && (
          <>
            {/* Food vs Drinks Split */}
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-bold text-slate-900 mb-5">Category Split — Food vs Drinks</h2>
              <div className="grid grid-cols-3 gap-4 mb-5">
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200 text-center">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-1">Food</p>
                  <p className="text-2xl font-bold text-slate-900">{fmt(fdSplit.Food)}</p>
                  <p className="text-sm text-slate-500 mt-1">{fdSplit.FoodPct.toFixed(1)}% of sales</p>
                </div>
                <div className="p-4 bg-sky-50 rounded-xl border border-sky-200 text-center">
                  <p className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">Drinks</p>
                  <p className="text-2xl font-bold text-slate-900">{fmt(fdSplit.Drinks)}</p>
                  <p className="text-sm text-slate-500 mt-1">{fdSplit.DrinksPct.toFixed(1)}% of sales</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-center">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Other</p>
                  <p className="text-2xl font-bold text-slate-900">{fmt(fdSplit.Other)}</p>
                  <p className="text-sm text-slate-500 mt-1">{fdSplit.OtherPct.toFixed(1)}% of sales</p>
                </div>
              </div>
              {/* Visual bar */}
              {fdTotal > 0 && (
                <div className="w-full h-6 flex rounded-lg overflow-hidden gap-0.5">
                  {fdSplit.FoodPct > 0 && (
                    <div className="bg-orange-400 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${fdSplit.FoodPct}%` }}>
                      {fdSplit.FoodPct > 10 && 'Food'}
                    </div>
                  )}
                  {fdSplit.DrinksPct > 0 && (
                    <div className="bg-sky-400 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${fdSplit.DrinksPct}%` }}>
                      {fdSplit.DrinksPct > 10 && 'Drinks'}
                    </div>
                  )}
                  {fdSplit.OtherPct > 0 && (
                    <div className="bg-slate-400 flex items-center justify-center text-white text-xs font-bold"
                      style={{ width: `${fdSplit.OtherPct}%` }}>
                      {fdSplit.OtherPct > 10 && 'Other'}
                    </div>
                  )}
                </div>
              )}
            </Card>

            {/* Detailed Category Breakdown */}
            {data.categorySplit && data.categorySplit.length > 0 && (
              <Card className="p-6 mb-6">
                <h2 className="text-xl font-bold text-slate-900 mb-5">Revenue by Category</h2>
                <div className="space-y-3">
                  {data.categorySplit.map(cat => (
                    <div key={cat.category} className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getCatColor(cat.category)} flex-shrink-0`} />
                      <span className="text-sm font-semibold text-slate-700 w-40 truncate">{cat.category || 'Unknown'}</span>
                      <div className="flex-1 bg-slate-100 rounded-full h-3 relative overflow-hidden">
                        <div
                          className={`h-3 rounded-full ${getCatColor(cat.category)}`}
                          style={{ width: `${cat.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-slate-900 w-20 text-right">{fmt(cat.revenue)}</span>
                      <span className="text-xs text-slate-500 w-12 text-right">{cat.percentage.toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Top 5 & Bottom 5 Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProductRankCard title="Top 5 Products by Revenue" products={data.topProducts} color="emerald" fmt={fmt} />
              <ProductRankCard title="Bottom 5 Products by Revenue" products={data.bottomProducts} color="rose" fmt={fmt} />
            </div>
          </>
        )}

        {view === 'by-store' && (
          <div className="space-y-6">
            {data.byStore.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-slate-600">No per-store product data available.</p>
              </Card>
            ) : (
              data.byStore
                .filter(s => selectedStore === 'All Stores' || s.storeName === selectedStore)
                .map(store => {
                  const maxRev = store.topProducts.length > 0 ? store.topProducts[0].revenue : 1;
                  const allBarMax = Math.max(maxRev, store.othersRevenue);
                  return (
                    <Card key={store.storeName} className="p-6">
                      {/* Store Header */}
                      <div className="flex items-center justify-between mb-5">
                        <div>
                          <h2 className="text-xl font-bold text-slate-900">{store.storeName}</h2>
                          <p className="text-sm text-slate-500 mt-0.5">
                            {store.totalProducts} products &nbsp;·&nbsp; Total revenue: {fmt(store.totalRevenue)}
                          </p>
                        </div>
                        {store.othersCount > 0 && (
                          <span className="text-xs text-slate-500 bg-slate-100 rounded-full px-3 py-1">
                            +{store.othersCount} more products grouped as Others
                          </span>
                        )}
                      </div>

                      {/* Revenue Bars */}
                      <div className="space-y-2">
                        {store.topProducts.map((p, i) => {
                          const pct = allBarMax > 0 ? (p.revenue / allBarMax) * 100 : 0;
                          const revPct = store.totalRevenue > 0 ? (p.revenue / store.totalRevenue) * 100 : 0;
                          const catColor = getCatColor(p.category);
                          return (
                            <div key={p.name} className="flex items-center gap-3 group">
                              <span className="w-5 text-xs font-bold text-slate-400 text-right flex-shrink-0">{p.rank}</span>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                  <span className="text-sm font-semibold text-slate-800 truncate max-w-[60%]" title={p.name}>{p.name}</span>
                                  <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className="text-xs text-slate-400">qty {p.quantity}</span>
                                    <span className="text-xs text-slate-400">avg {fmt(p.avgPrice)}</span>
                                    <span className="text-sm font-bold text-slate-900">{fmt(p.revenue)}</span>
                                    <span className="text-xs text-slate-400 w-10 text-right">{revPct.toFixed(1)}%</span>
                                  </div>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                  <div className={`h-2 rounded-full ${catColor} transition-all`} style={{ width: `${pct}%` }} />
                                </div>
                                <span className="text-xs text-slate-400">{p.category}</span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Others rollup */}
                        {store.othersRevenue > 0 && (
                          <div className="flex items-center gap-3 opacity-70">
                            <span className="w-5 text-xs font-bold text-slate-400 text-right flex-shrink-0">…</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm font-semibold text-slate-500">Others ({store.othersCount} products)</span>
                                <div className="flex items-center gap-3 flex-shrink-0">
                                  <span className="text-xs text-slate-400">qty {store.othersQuantity}</span>
                                  <span className="text-sm font-bold text-slate-700">{fmt(store.othersRevenue)}</span>
                                  <span className="text-xs text-slate-400 w-10 text-right">
                                    {store.totalRevenue > 0 ? ((store.othersRevenue / store.totalRevenue) * 100).toFixed(1) : '0.0'}%
                                  </span>
                                </div>
                              </div>
                              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                                <div className="h-2 rounded-full bg-slate-300" style={{ width: `${allBarMax > 0 ? (store.othersRevenue / allBarMax) * 100 : 0}%` }} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function ProductRankCard({
  title, products, color, fmt, compact = false
}: {
  title: string;
  products: ProductItem[];
  color: 'emerald' | 'rose';
  fmt: (v: number) => string;
  compact?: boolean;
}) {
  const bg = color === 'emerald' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200';
  const badge = color === 'emerald' ? 'bg-emerald-600' : 'bg-rose-600';
  const icon = color === 'emerald'
    ? <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    : <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.981-1.742 2.981H4.42c-1.53 0-2.493-1.647-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />;

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-8 h-8 rounded-lg ${badge} flex items-center justify-center`}>
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">{icon}</svg>
        </div>
        <h3 className={`font-bold text-slate-900 ${compact ? 'text-base' : 'text-lg'}`}>{title}</h3>
      </div>
      {products.length === 0 ? (
        <p className="text-slate-500 text-sm text-center py-4">Not enough data</p>
      ) : (
        <div className="space-y-2">
          {products.map(p => (
            <div key={p.name} className={`p-3 rounded-lg border ${bg} flex items-center gap-3`}>
              <div className={`w-7 h-7 rounded-full ${badge} flex items-center justify-center text-white font-bold text-xs flex-shrink-0`}>
                {p.rank}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{p.name}</p>
                <p className="text-xs text-slate-500">{p.category} · qty {p.quantity} · avg {fmt(p.avgPrice)}</p>
              </div>
              <p className="text-sm font-bold text-slate-900 flex-shrink-0">{fmt(p.revenue)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
