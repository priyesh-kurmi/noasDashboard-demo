'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatCard } from '../components/ui';

interface TimeDemandData {
  salesByHour: {
    hour: number;
    displayHour: string;
    sales: number;
    orders: number;
    avgOrderValue: number;
  }[];
  salesByDayOfWeek: {
    day: number;
    dayName: string;
    sales: number;
    orders: number;
    avgOrderValue: number;
  }[];
  busiestPeriod: {
    hour: number;
    displayHour: string;
    orders: number;
    sales: number;
  } | null;
  quietestPeriod: {
    hour: number;
    displayHour: string;
    orders: number;
    sales: number;
  } | null;
  hasRealTimeData: boolean;
  totalTransactions: number;
  availableStores: { storeName: string; platform: string }[];
}

export default function TimeDemandPage() {
  const [data, setData] = useState<TimeDemandData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState('All Stores');

  useEffect(() => {
    fetchData();
  }, [selectedStore]);

  const fetchData = async () => {
    const cacheKey = `cache_time_demand_v2_${selectedStore}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    try {
      const params = new URLSearchParams();
      if (selectedStore !== 'All Stores') {
        const [sn, pl] = selectedStore.split('||');
        params.set('storeName', sn);
        params.set('platform', pl);
      }
      const response = await fetch(`/api/analytics/time-demand?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch time demand data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading peak hours analysis...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data || data.totalTransactions === 0) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Time-Based Demand</h1>
          <p className="text-base text-slate-600 mb-8">Sales patterns by hour and day</p>
          <Card className="p-12 text-center">
            <p className="text-slate-600">No data available. Upload product-sales data files to see time-based demand patterns.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const maxHourlySales = Math.max(...data.salesByHour.map(h => h.sales), 1);
  const maxDailySales = Math.max(...data.salesByDayOfWeek.map(d => d.sales), 1);
  const activeHours = data.salesByHour.filter(h => h.orders > 0);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Time-Based Demand</h1>
          <p className="text-base text-slate-600 mt-2 font-medium">
            Understand when your cafés are busiest
          </p>
        </div>

        {/* Store Filter */}
        {(() => {
          const stores = (data.availableStores || [])
            .map((s: any) => typeof s === 'string' ? null : s)
            .filter((s: any): s is { storeName: string; platform: string } => s !== null && !!s.storeName && !!s.platform && s.platform !== 'booker');
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
                  const platformLabel = store.platform === 'takemypayments' ? 'TMP' : store.platform === 'booker' ? 'Booker' : store.platform;
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
                          : store.platform === 'booker' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>{platformLabel}</span>
                    </button>
                  );
                })}
              </div>
              {selectedStore !== 'All Stores' && (() => {
                const [sn, pl] = selectedStore.split('||');
                const platformLabel = pl === 'takemypayments' ? 'TakeMyPayments' : pl === 'booker' ? 'Booker' : pl;
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

        {/* Data Quality Notice */}
        {!data.hasRealTimeData && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-amber-800">Time data not available</p>
              <p className="text-xs text-amber-700 mt-1">
                {selectedStore === 'All Stores'
                  ? 'The overall view is skewed by Booker data (no timestamps). Filter to a specific TMP store for accurate peak hours.'
                  : 'This TakePayments export does not include transaction times — all records appear at midnight. Re-upload using a CSV that includes the time in the Date column (e.g., "14/04/2026 14:46").'}
              </p>
            </div>
          </div>
        )}

        {/* Peak Hours Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {data.busiestPeriod && (
            <Card className="p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-700 mb-1">Busiest Hour</p>
                  <p className="text-3xl font-bold text-slate-900">{data.busiestPeriod.displayHour}</p>
                  <p className="text-sm text-slate-600 mt-2">
                    {data.busiestPeriod.orders} orders · £{data.busiestPeriod.sales.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {data.quietestPeriod && (
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-700 mb-1">Quietest Hour</p>
                  <p className="text-3xl font-bold text-slate-900">{data.quietestPeriod.displayHour}</p>
                  <p className="text-sm text-slate-600 mt-2">
                    {data.quietestPeriod.orders} orders · £{data.quietestPeriod.sales.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
            <p className="text-sm font-semibold text-slate-600 mb-1">Active Hours</p>
            <p className="text-3xl font-bold text-slate-900">{activeHours.length}</p>
            <p className="text-sm text-slate-500 mt-2">{(data.totalTransactions ?? 0).toLocaleString()} total transactions</p>
          </Card>
        </div>

        {/* Sales by Hour */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sales by Hour</h2>
          {activeHours.length === 0 ? (
            <p className="text-slate-500 text-center py-8">No hourly data available</p>
          ) : (
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-max px-2">
                {data.salesByHour
                  .filter(h => h.orders > 0 || data.hasRealTimeData)
                  .map((hour) => (
                    <div key={hour.hour} className="flex flex-col items-center min-w-[64px]">
                      <div className="text-xs font-semibold text-slate-700 mb-2 text-center">
                        {hour.displayHour}
                      </div>
                      <div className="flex flex-col items-center justify-end h-48 relative pt-8">
                        <div className="absolute top-0 text-xs font-bold text-slate-900 whitespace-nowrap">
                          £{hour.sales >= 1000 ? (hour.sales / 1000).toFixed(1) + 'k' : hour.sales.toFixed(0)}
                        </div>
                        <div
                          className={`w-12 rounded-t-lg transition-all duration-700 cursor-pointer relative group ${
                            hour.hour === data.busiestPeriod?.hour
                              ? 'bg-gradient-to-t from-emerald-500 to-emerald-400'
                              : 'bg-gradient-to-t from-violet-500 to-purple-400'
                          }`}
                          style={{
                            height: `${Math.max((hour.sales / maxHourlySales) * 80, hour.orders > 0 ? 8 : 0)}%`,
                            minHeight: hour.orders > 0 ? '16px' : '0'
                          }}
                        />
                        <div className="mt-2 text-xs text-slate-500 text-center">
                          {hour.orders} ord
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </Card>

        {/* Sales by Day of Week */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Sales by Day of Week</h2>
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-4 min-w-max px-2 justify-center md:justify-start">
              {data.salesByDayOfWeek.map((day) => (
                <div key={day.day} className="flex flex-col items-center min-w-[90px]">
                  <p className="text-sm font-semibold text-slate-700 mb-2">{day.dayName}</p>
                  <div className="flex flex-col items-center justify-end h-48 relative pt-8">
                    <div className="absolute top-0 text-xs font-bold text-slate-900 whitespace-nowrap">
                      £{day.sales >= 1000 ? (day.sales / 1000).toFixed(1) + 'k' : day.sales.toFixed(0)}
                    </div>
                    <div
                      className="w-16 bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-700 hover:from-indigo-600 hover:to-indigo-500 cursor-pointer"
                      style={{
                        height: `${Math.max((day.sales / maxDailySales) * 80, day.orders > 0 ? 8 : 0)}%`,
                        minHeight: day.orders > 0 ? '20px' : '4px',
                        opacity: day.orders > 0 ? 1 : 0.2
                      }}
                    />
                    <div className="mt-2 text-center">
                      <p className="text-xs text-slate-500">{day.orders} orders</p>
                      <p className="text-xs text-slate-400 mt-0.5">AOV £{day.avgOrderValue.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
