'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card } from '../components/ui';

interface ProductRow {
  productCode: string;
  description: string;
  category: string;
  totalQuantity: number;
  totalSpend: number;
  orderCount: number;
  storeCount: number;
  monthCount: number;
  pct: number;
}

interface CategoryRow {
  category: string;
  totalSpend: number;
  totalQuantity: number;
  lineCount: number;
  pct: number;
}

interface TrendEntry {
  period: string;
  year?: number;
  totalSpend: number;
  totalQuantity: number;
  invoiceCount: number;
}

interface StoreRow {
  store: string;
  totalSpend: number;
  totalQuantity: number;
  invoiceCount: number;
  topCategory: string;
}

interface PackagingData {
  hasData: boolean;
  summary: {
    totalSpend: number;
    totalQuantity: number;
    totalLines: number;
    totalInvoices: number;
  };
  productBreakdown: ProductRow[];
  categoryBreakdown: CategoryRow[];
  monthlyTrend: TrendEntry[];
  yearlyTrend: TrendEntry[];
  storeBreakdown: StoreRow[];
  filters: {
    availableStores: string[];
    availableYears: number[];
    availableMonths: string[];
  };
}

const SUPPLIER_CAT_COLORS: Record<string, string> = {
  'Cups': 'bg-amber-500',
  'Lids': 'bg-sky-500',
  'Boxes & Containers': 'bg-orange-500',
  'Bags & Packaging': 'bg-emerald-500',
  'Bowls & Pots': 'bg-teal-500',
  'Trays': 'bg-purple-500',
  'Cup Carriers': 'bg-indigo-400',
  'Napkins & Plates': 'bg-pink-400',
  'Cutlery & Stirrers': 'bg-lime-500',
  'Cup Sleeves': 'bg-yellow-500',
  'Syrups & Ingredients': 'bg-rose-500',
  'Charges': 'bg-slate-500',
  'Other Packaging': 'bg-slate-400',
};

export default function PackagingPage() {
  const [ppData, setPpData] = useState<PackagingData | null>(null);
  const [ppLoading, setPpLoading] = useState(true);
  const [ppStore, setPpStore] = useState('All Stores');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');
  const [ppView, setPpView] = useState<'products' | 'categories' | 'trend' | 'by-store'>('products');
  const [ppSearch, setPpSearch] = useState('');
  const [ppSortKey, setPpSortKey] = useState<'totalSpend' | 'totalQuantity' | 'orderCount'>('totalSpend');

  const fetchPpData = useCallback(async () => {
    setPpLoading(true);
    try {
      const params = new URLSearchParams();
      if (ppStore !== 'All Stores') params.set('store', ppStore);
      if (appliedStartDate) params.set('startDate', appliedStartDate);
      if (appliedEndDate) params.set('endDate', appliedEndDate);
      const response = await fetch(`/api/analytics/product-purchasing?${params.toString()}`);
      if (response.ok) {
        const result = await response.json();
        setPpData(result);
      }
    } catch (error) {
      console.error('Failed to fetch packaging data:', error);
    } finally {
      setPpLoading(false);
    }
  }, [ppStore, appliedStartDate, appliedEndDate]);

  useEffect(() => { fetchPpData(); }, [fetchPpData]);

  const fmt = (v: number) =>
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v);

  const formatMonth = (period: string) => {
    const [year, month] = period.split('-');
    return new Date(Number(year), Number(month) - 1).toLocaleString('en-GB', { month: 'short', year: 'numeric' });
  };

  const applyFilters = () => {
    if (startDate && endDate && startDate > endDate) return;
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
    setPpStore('All Stores');
  };

  const rangeLabel = (() => {
    if (appliedStartDate && appliedEndDate) return `${appliedStartDate} to ${appliedEndDate}`;
    if (appliedStartDate) return `From ${appliedStartDate}`;
    if (appliedEndDate) return `Up to ${appliedEndDate}`;
    return 'All Time';
  })();

  const filteredProducts = (ppData?.productBreakdown ?? [])
    .filter(p => !ppSearch || p.description.toLowerCase().includes(ppSearch.toLowerCase()) || p.category.toLowerCase().includes(ppSearch.toLowerCase()))
    .sort((a, b) => b[ppSortKey] - a[ppSortKey]);

  const trendData = ppData?.monthlyTrend ?? [];
  const maxTrendSpend = Math.max(...trendData.map(t => t.totalSpend), 0);
  const maxCatSpend = Math.max(...(ppData?.categoryBreakdown?.map(c => c.totalSpend) ?? []), 0);

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Packaging Breakdown</h1>
        </div>

        {ppLoading && !ppData && (
          <div className="text-center py-12">
            <p className="text-slate-600">Loading packaging data...</p>
          </div>
        )}

        {!ppLoading && ppData && !ppData.hasData && (
          <Card className="p-12 text-center">
            <p className="text-slate-600 mb-2 font-medium">No supplier purchasing data found.</p>
            <p className="text-slate-400 text-sm">
              Go to <strong>Upload → Supplier Report</strong> and upload the Booker Excel file to see packaging breakdown.
            </p>
          </Card>
        )}

        {ppData && ppData.hasData && (
          <>
            {/* Filters Row */}
            <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
              {/* Start date */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-600">From</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* End date */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-600">To</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Store filter */}
              <div className="flex items-center gap-2">
                <label className="text-sm font-semibold text-slate-600">Store</label>
                <select
                  value={ppStore}
                  onChange={e => setPpStore(e.target.value)}
                  className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <option value="All Stores">All Stores</option>
                  {ppData.filters.availableStores.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-700 text-white rounded-lg text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Apply
              </button>

              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
              >
                Clear
              </button>

              {/* Active range badge */}
              <div className="ml-auto flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-bold text-blue-700">Showing: {rangeLabel}</span>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Spend', value: fmt(ppData.summary.totalSpend) },
                { label: 'Total Quantity', value: ppData.summary.totalQuantity.toLocaleString() },
                { label: 'Unique Products', value: ppData.productBreakdown.length.toLocaleString() },
                { label: 'Invoices', value: ppData.summary.totalInvoices.toLocaleString() },
              ].map(({ label, value }) => (
                <div key={label} className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                  <p className="text-sm text-slate-500 font-medium">{label}</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                </div>
              ))}
            </div>

            {/* Sub-tab Navigation */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {([
                ['products', 'Products'],
                ['categories', 'By Category'],
                ['trend', 'Monthly Trend'],
                ['by-store', 'By Store'],
              ] as const).map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setPpView(id)}
                  className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    ppView === id
                      ? 'bg-blue-700 text-white shadow'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Products Table */}
            {ppView === 'products' && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
                  <h3 className="text-lg font-bold text-slate-900">Product Breakdown</h3>
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={ppSearch}
                      onChange={e => setPpSearch(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 w-48"
                    />
                    <select
                      value={ppSortKey}
                      onChange={e => setPpSortKey(e.target.value as typeof ppSortKey)}
                      className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="totalSpend">Sort: Spend ↓</option>
                      <option value="totalQuantity">Sort: Quantity ↓</option>
                      <option value="orderCount">Sort: Orders ↓</option>
                    </select>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-3 px-3 font-semibold text-slate-700">#</th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-700">Product</th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-700">Category</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Total Spend</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Qty</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Orders</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Stores</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3 text-slate-400 font-medium">{i + 1}</td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 leading-tight">{p.description}</div>
                            <div className="text-xs text-slate-400 mt-0.5 font-mono">{p.productCode}</div>
                          </td>
                          <td className="py-3 px-3">
                            <span className={`text-xs px-2 py-1 rounded-full text-white ${SUPPLIER_CAT_COLORS[p.category] || 'bg-slate-400'}`}>
                              {p.category}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">{fmt(p.totalSpend)}</td>
                          <td className="py-3 px-3 text-right text-slate-700">{p.totalQuantity.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-slate-600">{p.orderCount}</td>
                          <td className="py-3 px-3 text-right text-slate-600">{p.storeCount}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-16 bg-slate-100 rounded-full h-1.5">
                                <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${p.pct}%` }} />
                              </div>
                              <span className="text-xs text-slate-500 w-10 text-right">{p.pct.toFixed(1)}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredProducts.length === 0 && (
                    <p className="text-center text-slate-400 py-8 text-sm">No products match your search.</p>
                  )}
                </div>
              </Card>
            )}

            {/* Category Breakdown */}
            {ppView === 'categories' && (
              <div className="space-y-6">
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Spend by Category</h3>
                  <div className="space-y-4">
                    {ppData.categoryBreakdown.map((cat, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${SUPPLIER_CAT_COLORS[cat.category] || 'bg-slate-400'}`} />
                        <div className="w-44 text-sm font-semibold text-slate-900 truncate">{cat.category}</div>
                        <div className="flex-1 bg-slate-100 rounded-full h-8 relative">
                          <div
                            className={`h-8 rounded-full transition-all ${SUPPLIER_CAT_COLORS[cat.category] || 'bg-slate-400'}`}
                            style={{ width: `${maxCatSpend > 0 ? (cat.totalSpend / maxCatSpend) * 100 : 0}%` }}
                          />
                        </div>
                        <div className="text-xs font-bold text-black whitespace-nowrap">
                          {fmt(cat.totalSpend)} · {cat.totalQuantity.toLocaleString()} units
                        </div>
                        <div className="text-sm font-bold text-slate-700 w-14 text-right">{cat.pct.toFixed(1)}%</div>
                      </div>
                    ))}
                  </div>
                </Card>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {ppData.categoryBreakdown.map((cat, i) => (
                    <div key={i} className="p-4 bg-white border border-slate-200 rounded-xl">
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-3 h-3 rounded-full ${SUPPLIER_CAT_COLORS[cat.category] || 'bg-slate-400'}`} />
                        <p className="text-xs font-semibold text-slate-700">{cat.category}</p>
                      </div>
                      <p className="text-lg font-bold text-slate-900">{fmt(cat.totalSpend)}</p>
                      <p className="text-xs text-slate-500">{cat.totalQuantity.toLocaleString()} units · {cat.pct.toFixed(1)}%</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trend */}
            {ppView === 'trend' && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Monthly Purchasing Trend</h3>
                {trendData.length === 0 ? (
                  <p className="text-slate-500 text-sm">No trend data for current filters.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <div style={{ minWidth: `${Math.max(trendData.length * 90, 400)}px` }}>
                        <div className="flex items-end gap-3 mb-3" style={{ height: '200px' }}>
                          {trendData.map((entry, i) => {
                            const barH = maxTrendSpend > 0 ? Math.max((entry.totalSpend / maxTrendSpend) * 200, entry.totalSpend > 0 ? 4 : 0) : 0;
                            const label = formatMonth(entry.period);
                            return (
                              <div key={i} style={{ width: '80px', flexShrink: 0 }} className="flex flex-col items-center gap-1">
                                <div
                                  style={{ height: `${barH}px`, width: '64px' }}
                                  className="rounded-t hover:opacity-80 transition-all cursor-default bg-blue-400"
                                  title={`${label}: ${fmt(entry.totalSpend)}`}
                                />
                              </div>
                            );
                          })}
                        </div>
                        <div className="flex gap-3">
                          {trendData.map((entry, i) => {
                            const label = formatMonth(entry.period);
                            return (
                              <div key={i} className="text-center" style={{ width: '80px', flexShrink: 0 }}>
                                <p className="text-xs font-medium leading-tight text-slate-600">{label}</p>
                                <p className="text-xs font-bold text-slate-900">{fmt(entry.totalSpend)}</p>
                                <p className="text-xs text-slate-400">{entry.totalQuantity} units</p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-slate-200">
                            <th className="text-left py-2 px-3 font-semibold text-slate-700">Period</th>
                            <th className="text-right py-2 px-3 font-semibold text-slate-700">Spend</th>
                            <th className="text-right py-2 px-3 font-semibold text-slate-700">Quantity</th>
                            <th className="text-right py-2 px-3 font-semibold text-slate-700">Invoices</th>
                          </tr>
                        </thead>
                        <tbody>
                          {trendData.map((entry, i) => {
                            const label = formatMonth(entry.period);
                            return (
                              <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-2 px-3 font-medium text-slate-800">{label}</td>
                                <td className="py-2 px-3 text-right font-bold text-slate-900">{fmt(entry.totalSpend)}</td>
                                <td className="py-2 px-3 text-right text-slate-600">{entry.totalQuantity.toLocaleString()}</td>
                                <td className="py-2 px-3 text-right text-slate-600">{entry.invoiceCount}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </Card>
            )}

            {/* By Store */}
            {ppView === 'by-store' && (
              <Card className="p-6">
                <h3 className="text-lg font-bold text-slate-900 mb-5">Spend by Store</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left py-3 px-3 font-semibold text-slate-700">Rank</th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-700">Store</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Total Spend</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Quantity</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Invoices</th>
                        <th className="text-left py-3 px-3 font-semibold text-slate-700">Top Category</th>
                        <th className="text-right py-3 px-3 font-semibold text-slate-700">Share</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ppData.storeBreakdown.map((s, i) => (
                        <tr key={i} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-100 text-amber-700' : i === 1 ? 'bg-slate-200 text-slate-700' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>#{i + 1}</span>
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">{s.store}</td>
                          <td className="py-3 px-3 text-right font-bold text-slate-900">{fmt(s.totalSpend)}</td>
                          <td className="py-3 px-3 text-right text-slate-600">{s.totalQuantity.toLocaleString()}</td>
                          <td className="py-3 px-3 text-right text-slate-600">{s.invoiceCount}</td>
                          <td className="py-3 px-3">
                            <span className={`text-xs px-2 py-1 rounded-full text-white ${SUPPLIER_CAT_COLORS[s.topCategory] || 'bg-slate-400'}`}>{s.topCategory}</span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <div className="w-20 bg-slate-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${ppData.summary.totalSpend > 0 ? (s.totalSpend / ppData.summary.totalSpend) * 100 : 0}%` }} />
                              </div>
                              <span className="text-xs font-semibold text-slate-600 w-10 text-right">
                                {ppData.summary.totalSpend > 0 ? ((s.totalSpend / ppData.summary.totalSpend) * 100).toFixed(1) : '0'}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
