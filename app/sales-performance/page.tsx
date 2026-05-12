'use client';

import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatCard, Button } from '../components/ui';

type Period = 'weekly' | 'monthly' | 'yearly' | 'all';

interface SalesPerformanceData {
  totalSales: number;
  ordersCount: number;
  aov: number;
  periodChange: number;
  currentPeriodSales: number;
  lastPeriodSales: number;
  currentPeriodOrders: number;
  lastPeriodOrders: number;
  breakdown: {
    date: string;
    label: string;
    sales: number;
    orders: number;
  }[];
  salesByStore: { storeName: string; platform: string; sales: number; orders: number }[];
  availableStores: { storeName: string; platform: string }[];
  periodLabel: string;
  currentPeriodLabel: string;
  lastPeriodLabel: string;
}

export default function SalesPerformancePage() {
  const [data, setData] = useState<SalesPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<Period>('monthly');
  const [selectedStore, setSelectedStore] = useState('All Stores'); // 'All Stores' or 'storeName||platform'
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [period, selectedStore]);

  useEffect(() => {
    // Scroll to the right (most recent data) when data loads
    if (scrollContainerRef.current && data) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [data]);

  const fetchData = async () => {
    const cacheKey = `cache_sales_perf_v3_${period}_${selectedStore}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    try {
      const params = new URLSearchParams({ period });
      if (selectedStore !== 'All Stores') {
        const [sn, pl] = selectedStore.split('||');
        params.set('storeName', sn);
        if (pl) params.set('platform', pl);
      }
      const response = await fetch(`/api/analytics/sales-performance?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch sales performance:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading sales performance...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data || (data.totalSales === 0 && data.breakdown.length === 0)) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Sales Performance</h1>
          <p className="text-base text-slate-600 mb-8">Key performance metrics</p>
          <Card className="p-12 text-center">
            <p className="text-slate-600">No data available. Please upload data files first.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const maxBreakdownSales = data.breakdown && data.breakdown.length > 0
    ? Math.max(...data.breakdown.map(d => d.sales))
    : 0;

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Sales Performance</h1>
          <p className="text-base text-slate-600 mt-2 font-medium">
            Track revenue and orders across all stores
          </p>
        </div>

        {/* Store Filter */}
        {data.availableStores && data.availableStores.length > 0 && (() => {
          const stores = data.availableStores
            .map((s: any) => typeof s === 'string' ? null : s)
            .filter((s: any): s is { storeName: string; platform: string } => s !== null && !!s.storeName && !!s.platform);
          if (stores.length === 0) return null;
          return (
          <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">View by Store</p>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setSelectedStore('All Stores')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  selectedStore === 'All Stores'
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                }`}
              >
                All Stores
              </button>
              {stores.map(store => {
                const key = `${store.storeName}||${store.platform}`;
                const platformLabel = store.platform === 'takemypayments' ? 'TMP' : store.platform;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedStore(key)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      selectedStore === key
                        ? 'bg-slate-900 text-white shadow'
                        : 'bg-white border border-slate-300 text-slate-600 hover:border-slate-400 hover:bg-slate-50'
                    }`}
                  >
                    {store.storeName}
                    <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded ${
                      selectedStore === key
                        ? 'bg-white/20 text-white'
                        : 'bg-blue-100 text-blue-700'
                    }`}>{platformLabel}</span>
                  </button>
                );
              })}
            </div>
            {selectedStore !== 'All Stores' && (() => {
              const [sn, pl] = selectedStore.split('||');
              const platformLabel = pl === 'takemypayments' ? 'TakeMyPayments (TMP)' : pl;
              return (
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  Showing data for: <span className="text-slate-900 bg-slate-200 px-2 py-0.5 rounded">{sn}</span>
                  <span className="ml-2 text-xs text-slate-500">({platformLabel})</span>
                </p>
              );
            })()}
          </div>
        );
        })()}

        {/* Period Filter */}
        <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-2">
            {([
              ['weekly', 'Weekly'],
              ['monthly', 'Monthly'],
              ['yearly', 'This Year'],
              ['all', 'All Time'],
            ] as const).map(([p, label]) => (
              <Button key={p} variant={period === p ? 'primary' : 'outline'} onClick={() => setPeriod(p)}>{label}</Button>
            ))}
          </div>
          <div className="text-sm text-slate-500 font-medium bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
            Showing: <span className="font-bold text-slate-800">{data.currentPeriodLabel}</span>
            {data.lastPeriodLabel && <span className="text-slate-400 ml-1">vs {data.lastPeriodLabel}</span>}
          </div>
        </div>

        {/* Key Metrics — period-based */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Sales"
            value={`£${data.totalSales.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          />
          <StatCard
            title="Total Orders"
            value={data.ordersCount.toLocaleString()}
          />
          <StatCard
            title="Average Order Value"
            value={`£${data.aov.toFixed(2)}`}
          />
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <p className="text-sm font-semibold text-slate-600 mb-2">{data.periodLabel}</p>
            <div className="flex items-baseline gap-2">
              <p className={`text-3xl font-bold ${data.periodChange >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {data.periodChange >= 0 ? '+' : ''}{data.periodChange.toFixed(1)}%
              </p>
              {data.periodChange >= 0 ? (
                <svg className="w-6 h-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </Card>
        </div>

        {/* Period Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Period Comparison</h2>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{data.currentPeriodLabel} Sales</span>
                  <span className="text-lg font-bold text-slate-900">
                    £{data.currentPeriodSales.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: '100%' }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{data.currentPeriodOrders} orders</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-slate-700">{data.lastPeriodLabel} Sales</span>
                  <span className="text-lg font-bold text-slate-900">
                    £{data.lastPeriodSales.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-slate-400 to-slate-500 h-3 rounded-full transition-all duration-500"
                    style={{ 
                      width: data.currentPeriodSales > 0 
                        ? `${Math.min((data.lastPeriodSales / Math.max(data.currentPeriodSales, data.lastPeriodSales)) * 100, 100)}%` 
                        : '100%' 
                    }}
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">{data.lastPeriodOrders} orders</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Period Detail</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Revenue</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {data.currentPeriodLabel}: £{data.currentPeriodSales.toLocaleString('en-GB', { minimumFractionDigits: 2 })} ({data.currentPeriodOrders} orders)
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Previous Period</p>
                  <p className="text-sm text-slate-600 mt-1">
                    {data.lastPeriodLabel}: £{data.lastPeriodSales.toLocaleString('en-GB', { minimumFractionDigits: 2 })} ({data.lastPeriodOrders} orders)
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Period Breakdown - Horizontal Scroll */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">{data.currentPeriodLabel} Performance Breakdown</h2>
          <p className="text-sm text-slate-500 mb-4">← Scroll left to see historical data</p>
          <div className="relative max-w-full overflow-hidden">
            <div ref={scrollContainerRef} className="overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100">
              <div className="flex gap-6 min-w-max px-2">
                {data.breakdown && data.breakdown.length > 0 ? (
                  data.breakdown.map((item) => (
                    <div key={item.date} className="flex flex-col items-center min-w-[100px]">
                      <div className="text-xs font-semibold text-slate-600 mb-1">
                        {item.label}
                      </div>
                      <div className="text-xs text-slate-500 mb-2">
                        {new Date(item.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                      <div className="flex flex-col items-center justify-end h-72 relative pt-8">
                        <div className="absolute top-0 text-xs font-bold text-slate-900">
                          £{item.sales.toLocaleString('en-GB', { maximumFractionDigits: 0 })}
                        </div>
                        <div 
                          className="w-16 bg-gradient-to-t from-indigo-500 to-purple-600 rounded-t-lg transition-all duration-700 hover:from-indigo-600 hover:to-purple-700 cursor-pointer relative group"
                          style={{ 
                            height: maxBreakdownSales > 0 ? `${Math.max((item.sales / maxBreakdownSales) * 85, 8)}%` : '8%',
                            minHeight: '20px'
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-opacity">
                              {item.orders}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          {item.orders} orders
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="w-full py-12 text-center text-slate-500">
                    No breakdown data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Per-Site Revenue Breakdown (shown when viewing All Stores) */}
        {selectedStore === 'All Stores' && data.salesByStore && data.salesByStore.length > 0 && (
          <Card className="p-6 mt-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Revenue by Store</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Store</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-600">Total Sales</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-600">Orders</th>
                    <th className="text-right py-3 px-4 font-semibold text-slate-600">AOV</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-600">Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data.salesByStore.map((store, i) => {
                    const share = data.totalSales > 0 ? (store.sales / data.totalSales) * 100 : 0;
                    const aov = store.orders > 0 ? store.sales / store.orders : 0;
                    return (
                      <tr key={`${store.storeName}||${store.platform}`} className={`border-b border-slate-100 ${i === 0 ? 'bg-amber-50/40' : ''}`}>
                        <td className="py-3 px-4 font-medium text-slate-900">
                          {i === 0 && <span className="text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded mr-2">Top</span>}
                          {store.storeName}
                          {store.platform && <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{store.platform === 'takemypayments' ? 'TMP' : store.platform}</span>}
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">
                          £{store.sales.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-600">{store.orders.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-slate-600">£{aov.toFixed(2)}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-2">
                              <div className="bg-slate-700 h-2 rounded-full" style={{ width: `${share}%` }} />
                            </div>
                            <span className="text-xs text-slate-500 w-10 text-right">{share.toFixed(1)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
