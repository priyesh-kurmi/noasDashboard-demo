'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatCard } from '../components/ui';

interface ProductBreakdown {
  product: string;
  revenue: number;
  orders: number;
  percentage?: number;
}

interface StoreData {
  storeName: string;
  platform: string;
  totalSales: number;
  transactions: number;
  avgTransaction: number;
  bestProduct?: string | null;
  productBreakdown?: ProductBreakdown[];
}

interface SalesData {
  stores: StoreData[];
  topStores: StoreData[];
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  availableStores: string[];
  productBreakdown: ProductBreakdown[];
}

export default function SalesPage() {
  const [data, setData] = useState<SalesData>({
    stores: [],
    topStores: [],
    totalSales: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    availableStores: [],
    productBreakdown: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState('All Stores');

  const fetchData = useCallback(async () => {
    const cacheKey = `cache_sales_${selectedStore}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    try {
      const params = new URLSearchParams();
      if (selectedStore !== 'All Stores') params.set('storeName', selectedStore);
      const response = await fetch(`/api/analytics/sales?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch sales data:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedStore]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(value);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading sales data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (data.stores.length === 0 && data.availableStores.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Sales Overview</h1>
          <p className="text-base text-slate-600 mb-8">Detailed sales analysis by store</p>
          <Card className="p-12 text-center">
            <p className="text-slate-600">No sales data available. Please upload data files first.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  const isFiltered = selectedStore !== 'All Stores';
  const selectedStoreData = isFiltered ? data.stores.find(s => s.storeName === selectedStore) : null;
  const maxProductRevenue = Math.max(...(data.productBreakdown.map(p => p.revenue)), 1);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Sales Summary</h1>
          <p className="text-base text-slate-600 mt-2 font-medium">
            {isFiltered ? `Detailed sales analysis — ${selectedStore}` : 'Detailed sales analysis across all stores'}
          </p>
        </div>

        {/* Store Filter */}
        {data.availableStores.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-8">
            {['All Stores', ...data.availableStores].map(store => (
              <button
                key={store}
                onClick={() => setSelectedStore(store)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  selectedStore === store
                    ? 'bg-slate-900 text-white shadow'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {store}
              </button>
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title={isFiltered ? 'Store Revenue' : 'Total Revenue'}
            value={formatCurrency(data.totalSales)}
          />
          <StatCard
            title={isFiltered ? 'Store Transactions' : 'Total Transactions'}
            value={data.totalTransactions.toLocaleString()}
          />
          <StatCard
            title="Average Transaction"
            value={formatCurrency(data.averageTransaction)}
          />
        </div>

        {/* Per-site detail view */}
        {isFiltered && selectedStoreData && (
          <>
            {/* Store info card */}
            <Card className="p-6 mb-8 bg-gradient-to-br from-slate-50 to-white border-2 border-slate-200">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">{selectedStoreData.storeName}</h2>
                  <span className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-medium ${getPlatformBadgeColor(selectedStoreData.platform)}`}>
                    {selectedStoreData.platform}
                  </span>
                </div>
                {selectedStoreData.bestProduct && (
                  <div className="text-right">
                    <p className="text-xs text-slate-500 mb-1">Best-Selling Category</p>
                    <p className="text-lg font-bold text-slate-900">{selectedStoreData.bestProduct}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Product breakdown for selected store */}
            {data.productBreakdown.length > 0 && (
              <Card className="p-6 mb-8">
                <h2 className="text-xl font-bold text-slate-900 mb-5">Sales by Product Category</h2>
                <div className="space-y-3">
                  {data.productBreakdown.map((p, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className="w-6 text-xs font-bold text-slate-400 text-right">#{i + 1}</div>
                      <div className="w-36 text-sm font-medium text-slate-700 truncate">{p.product}</div>
                      <div className="flex-1 bg-slate-100 rounded-full h-7 relative">
                        <div
                          className="bg-slate-800 h-7 rounded-full transition-all"
                          style={{ width: `${(p.revenue / maxProductRevenue) * 100}%` }}
                        />
                        <span className="absolute inset-0 flex items-center px-3 text-xs font-bold text-white mix-blend-difference">
                          {formatCurrency(p.revenue)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 w-20 text-right">{p.orders} orders</div>
                      {p.percentage !== undefined && (
                        <div className="text-xs font-semibold text-slate-600 w-12 text-right">{p.percentage}%</div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}

        {/* All Stores view (Top performers + full table) */}
        {!isFiltered && (
          <>
            <Card className="p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Top 5 Performing Stores</h2>
              <div className="space-y-3">
                {data.topStores.map((store, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
                    onClick={() => setSelectedStore(store.storeName)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-800 to-slate-600 flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{store.storeName}</p>
                        <p className="text-sm text-slate-600">{store.transactions.toLocaleString()} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-slate-900">{formatCurrency(store.totalSales)}</p>
                      <p className="text-sm text-slate-600">Avg: {formatCurrency(store.avgTransaction)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">All Stores Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Store Name</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Platform</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Total Sales</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Transactions</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Avg Transaction</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">% of Total</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700 uppercase tracking-wide">Best Product</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.stores.map((store, index) => (
                      <tr
                        key={index}
                        className={`border-b border-slate-100 cursor-pointer hover:bg-slate-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                        onClick={() => setSelectedStore(store.storeName)}
                      >
                        <td className="py-3 px-4 font-medium text-slate-900">{store.storeName}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPlatformBadgeColor(store.platform)}`}>
                            {store.platform}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-slate-900">{formatCurrency(store.totalSales)}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{store.transactions.toLocaleString()}</td>
                        <td className="py-3 px-4 text-right text-slate-700">{formatCurrency(store.avgTransaction)}</td>
                        <td className="py-3 px-4 text-right text-slate-700">
                          {data.totalSales > 0 ? ((store.totalSales / data.totalSales) * 100).toFixed(1) : '0'}%
                        </td>
                        <td className="py-3 px-4 text-slate-600 text-sm">{store.bestProduct || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-slate-400 mt-3">Click any row to view per-site breakdown</p>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}


interface StoreData {
  storeName: string;
  platform: string;
  totalSales: number;
  transactions: number;
  avgTransaction: number;
}


