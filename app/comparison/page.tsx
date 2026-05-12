'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatCard } from '../components/ui';

interface StoreData {
  storeName: string;
  platform: string;
  totalSales: number;
  totalOrders: number;
  aov: number;
  bestProduct: string | null;
  grossProfit: number;
  profitMargin: number;
  roi: number | null;
  bookerSpend: number;
}

export default function ComparisonPage() {
  const [stores, setStores] = useState<StoreData[]>([]);
  const [store1, setStore1] = useState<string>('');
  const [store2, setStore2] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async (start = startDate, end = endDate) => {
    try {
      const params = new URLSearchParams();
      if (start) params.set('startDate', start);
      if (end) params.set('endDate', end);
      const url = `/api/analytics/site-comparison${params.toString() ? '?' + params.toString() : ''}`;
      const response = await fetch(url);
      if (response.ok) {
        const result = await response.json();
        const salesStores = result.stores || [];
        setStores(salesStores);
        if (salesStores.length >= 2) {
          setStore1(salesStores[0].storeName);
          setStore2(salesStores[1].storeName);
        }
      }
    } catch (error) {
      console.error('Failed to fetch stores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStoreData = (storeName: string) => {
    return stores.find(s => s.storeName === storeName);
  };

  const calculateDifference = (value1: number, value2: number) => {
    if (value2 === 0) return 0;
    return ((value1 - value2) / value2) * 100;
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'takemypayments':
        return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
      case 'booker':
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200';
      case 'paypal':
        return 'bg-purple-100 text-purple-700 ring-1 ring-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading stores...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (stores.length < 2) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Store Comparison</h1>
          <p className="text-base text-slate-600 mb-8">Compare performance between stores</p>
          <Card className="p-12 text-center">
            <p className="text-slate-600">Need at least 2 stores to compare. Please upload more data.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const data1 = getStoreData(store1);
  const data2 = getStoreData(store2);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Store Comparison</h1>
            {/* Date range filter */}
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              <span className="text-slate-500 text-sm">to</span>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
              <button
                onClick={() => fetchStores()}
                className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-700 transition-colors"
              >
                Apply
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={() => { setStartDate(''); setEndDate(''); fetchStores('', ''); }}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          <p className="text-base text-slate-600 mt-2 font-medium">Head-to-head performance analysis</p>
        </div>

        {/* Store Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Store 1</label>
            <select
              value={store1}
              onChange={(e) => setStore1(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              {stores.map((store) => (
                <option key={store.storeName} value={store.storeName}>
                  {store.storeName} ({store.platform})
                </option>
              ))}
            </select>
          </Card>

          <Card className="p-6">
            <label className="block text-sm font-semibold text-slate-700 mb-3">Store 2</label>
            <select
              value={store2}
              onChange={(e) => setStore2(e.target.value)}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              {stores.map((store) => (
                <option key={store.storeName} value={store.storeName}>
                  {store.storeName} ({store.platform})
                </option>
              ))}
            </select>
          </Card>
        </div>

        {data1 && data2 && (
          <>
            {/* Comparison Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Store 1 */}
              <Card className="p-6 border-2 border-blue-200 bg-blue-50/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">{data1.storeName}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformBadgeColor(data1.platform)}`}>
                    {data1.platform}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-slate-900">£{data1.totalSales.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Orders</p>
                    <p className="text-2xl font-bold text-slate-900">{data1.totalOrders.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold text-slate-900">£{data1.aov.toFixed(2)}</p>
                  </div>
                  {data1.bookerSpend > 0 && (
                    <>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Gross Profit</p>
                        <p className={`text-2xl font-bold ${data1.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>£{data1.grossProfit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">ROI</p>
                        <p className={`text-2xl font-bold ${(data1.roi ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{data1.roi !== null ? `${data1.roi.toFixed(1)}%` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
                        <p className={`text-2xl font-bold ${data1.profitMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{data1.profitMargin.toFixed(1)}%</p>
                      </div>
                    </>
                  )}
                  {data1.bestProduct && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Best-Selling Product</p>
                      <p className="text-lg font-bold text-slate-900">{data1.bestProduct}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Store 2 */}
              <Card className="p-6 border-2 border-emerald-200 bg-emerald-50/30">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-slate-900">{data2.storeName}</h2>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPlatformBadgeColor(data2.platform)}`}>
                    {data2.platform}
                  </span>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Total Sales</p>
                    <p className="text-2xl font-bold text-slate-900">£{data2.totalSales.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Orders</p>
                    <p className="text-2xl font-bold text-slate-900">{data2.totalOrders.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold text-slate-900">£{data2.aov.toFixed(2)}</p>
                  </div>
                  {data2.bookerSpend > 0 && (
                    <>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Gross Profit</p>
                        <p className={`text-2xl font-bold ${data2.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>£{data2.grossProfit.toLocaleString('en-GB', { minimumFractionDigits: 2 })}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">ROI</p>
                        <p className={`text-2xl font-bold ${(data2.roi ?? 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{data2.roi !== null ? `${data2.roi.toFixed(1)}%` : '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-slate-600 mb-1">Profit Margin</p>
                        <p className={`text-2xl font-bold ${data2.profitMargin >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>{data2.profitMargin.toFixed(1)}%</p>
                      </div>
                    </>
                  )}
                  {data2.bestProduct && (
                    <div>
                      <p className="text-sm text-slate-600 mb-1">Best-Selling Product</p>
                      <p className="text-lg font-bold text-slate-900">{data2.bestProduct}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Difference Analysis */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Performance Difference</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">Total Sales</p>
                  <p className={`text-2xl font-bold ${data1.totalSales > data2.totalSales ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {data1.totalSales > data2.totalSales ? data1.storeName : data2.storeName} leads
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    by £{Math.abs(data1.totalSales - data2.totalSales).toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ({Math.abs(calculateDifference(data1.totalSales, data2.totalSales)).toFixed(1)}% difference)
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">Order Volume</p>
                  <p className={`text-2xl font-bold ${data1.totalOrders > data2.totalOrders ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {data1.totalOrders > data2.totalOrders ? data1.storeName : data2.storeName} leads
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    by {Math.abs(data1.totalOrders - data2.totalOrders).toLocaleString()} orders
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ({Math.abs(calculateDifference(data1.totalOrders, data2.totalOrders)).toFixed(1)}% difference)
                  </p>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-2">Avg Order Value</p>
                  <p className={`text-2xl font-bold ${data1.aov > data2.aov ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {data1.aov > data2.aov ? data1.storeName : data2.storeName} leads
                  </p>
                  <p className="text-sm text-slate-600 mt-1">
                    by £{Math.abs(data1.aov - data2.aov).toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ({Math.abs(calculateDifference(data1.aov, data2.aov)).toFixed(1)}% difference)
                  </p>
                </div>

                {data1.bookerSpend > 0 && data2.bookerSpend > 0 && (
                  <>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-600 mb-2">Gross Profit</p>
                      <p className={`text-2xl font-bold ${data1.grossProfit > data2.grossProfit ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {data1.grossProfit > data2.grossProfit ? data1.storeName : data2.storeName} leads
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        by £{Math.abs(data1.grossProfit - data2.grossProfit).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-600 mb-2">ROI</p>
                      {data1.roi !== null && data2.roi !== null ? (
                        <>
                          <p className={`text-2xl font-bold ${data1.roi > data2.roi ? 'text-blue-600' : 'text-emerald-600'}`}>
                            {data1.roi > data2.roi ? data1.storeName : data2.storeName} leads
                          </p>
                          <p className="text-sm text-slate-600 mt-1">
                            {data1.roi.toFixed(1)}% vs {data2.roi.toFixed(1)}%
                          </p>
                        </>
                      ) : <p className="text-slate-400 text-sm">Not enough data</p>}
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm text-slate-600 mb-2">Profit Margin</p>
                      <p className={`text-2xl font-bold ${data1.profitMargin > data2.profitMargin ? 'text-blue-600' : 'text-emerald-600'}`}>
                        {data1.profitMargin > data2.profitMargin ? data1.storeName : data2.storeName} leads
                      </p>
                      <p className="text-sm text-slate-600 mt-1">
                        {data1.profitMargin.toFixed(1)}% vs {data2.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                  </>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
