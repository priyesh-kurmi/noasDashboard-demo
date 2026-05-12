'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Card, StatCard } from '../components/ui';

interface StorePerformance {
  storeName: string;
  platform: string;
  revenue: number;
  transactions: number;
  avgTransactionValue: number;
  revenuePerDay: number;
  consistencyScore: number;
  performanceScore: number;
  rank: number;
}

interface PlatformPerformance {
  platform: string;
  revenue: number;
  transactions: number;
  storeCount: number;
  avgTransactionValue: number;
  revenueShare: number;
  avgRevenuePerStore: number;
}

interface SpendSite {
  storeName: string;
  spend: number;
  orders: number;
  avgOrder: number;
}

interface PerformanceData {
  storePerformance: StorePerformance[];
  platformPerformance: PlatformPerformance[];
  topPerformers: StorePerformance[];
  underperformers: StorePerformance[];
  efficiencyMetrics: {
    avgRevenuePerDay: number;
    avgTransactionsPerDay: number;
    avgRevenuePerStore: number;
    avgTransactionsPerStore: number;
    peakDay: string;
    peakDayRevenue: number;
    daysCovered: number;
    utilizationRate: number;
  };
  performanceScores: {
    overall: number;
    revenue: number;
    consistency: number;
    growth: number;
  };
  salesSummary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    storeCount: number;
  };
  spendPerSite: SpendSite[];
  scoringExplanation: {
    description: string;
    weights: {
      revenue: { label: string; detail: string };
      transactions: { label: string; detail: string };
      consistency: { label: string; detail: string };
    };
    scale: string;
  };
}

export default function PerformancePage() {
  const [data, setData] = useState<PerformanceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'stores' | 'platforms' | 'efficiency' | 'spending'>('stores');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchData = useCallback(async () => {
    const cacheKey = `cache_performance_${startDate}_${endDate}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) { setData(JSON.parse(cached)); setLoading(false); }
    } catch {}
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      const response = await fetch(`/api/analytics/performance?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
        try { localStorage.setItem(cacheKey, JSON.stringify(result)); } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch performance data:', error);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP'
    }).format(value);
  };

  const getPlatformBadgeColor = (platform: string) => {
    switch (platform) {
      case 'takemypayments':
        return 'bg-blue-100 text-blue-700 ring-1 ring-blue-200';
      case 'paypal':
        return 'bg-purple-100 text-purple-700 ring-1 ring-purple-200';
      default:
        return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200';
    }
  };

  const getPlatformLabel = (platform: string) => {
    if (platform === 'takemypayments') return 'TMP';
    if (platform === 'paypal') return 'PayPal';
    return platform;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-amber-100 text-amber-700 ring-2 ring-amber-300';
    if (rank === 2) return 'bg-slate-200 text-slate-700 ring-2 ring-slate-300';
    if (rank === 3) return 'bg-orange-100 text-orange-700 ring-2 ring-orange-300';
    return 'bg-slate-100 text-slate-600 ring-1 ring-slate-200';
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-100';
    if (score >= 60) return 'bg-blue-100';
    if (score >= 40) return 'bg-amber-100';
    return 'bg-rose-100';
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <div className="text-center py-12">
            <p className="text-slate-600">Loading performance metrics...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!data || data.storePerformance.length === 0) {
    return (
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight mb-2">Performance Metrics</h1>
          <p className="text-base text-slate-600 mb-8">Store and platform performance analysis</p>
          <Card className="p-12 text-center">
            <p className="text-slate-600">No performance data available. Please upload data files first.</p>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 max-w-full overflow-x-hidden">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Efficiency Metrics</h1>
          <p className="text-base text-slate-600 mt-2 font-medium">
            Comprehensive performance analysis and rankings — sales sites only
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex flex-wrap items-end gap-4 mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">From</label>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">To</label>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>
          {(startDate || endDate) && (
            <button
              onClick={() => { setStartDate(''); setEndDate(''); }}
              className="px-4 py-2 rounded-lg text-sm font-semibold bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors"
            >
              Clear Filter
            </button>
          )}
          {(startDate || endDate) && (
            <p className="text-xs text-slate-500 self-end pb-2">
              Showing data {startDate && endDate ? `${startDate} → ${endDate}` : startDate ? `from ${startDate}` : `up to ${endDate}`}
            </p>
          )}
        </div>

        {/* Sales Summary */}
        {data.salesSummary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Total Sales Revenue"
              value={formatCurrency(data.salesSummary.totalRevenue)}
            />
            <StatCard
              title="Total Orders"
              value={data.salesSummary.totalOrders.toLocaleString()}
            />
            <StatCard
              title="Avg Order Value"
              value={formatCurrency(data.salesSummary.avgOrderValue)}
            />
            <StatCard
              title="Active Sales Sites"
              value={String(data.salesSummary.storeCount)}
            />
          </div>
        )}

        {/* Scoring Methodology Callout */}
        {data.scoringExplanation && (
          <div className="mb-8 p-5 bg-blue-50 border-2 border-blue-200 rounded-xl">
            <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How Performance Scores Are Calculated
            </h3>
            <p className="text-sm text-blue-800 mb-3">{data.scoringExplanation.description}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {Object.values(data.scoringExplanation.weights).map((w, i) => (
                <div key={i} className="bg-white rounded-lg p-3 border border-blue-100">
                  <p className="font-semibold text-blue-800 text-sm mb-1">{w.label}</p>
                  <p className="text-xs text-slate-600">{w.detail}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-blue-700 mt-3 font-medium">Scale: {data.scoringExplanation.scale}</p>
          </div>
        )}

        {/* Performance Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Overall Score"
            value={data.performanceScores.overall.toFixed(1)}
            suffix="/100"
          />
          <StatCard
            title="Revenue Score"
            value={data.performanceScores.revenue.toFixed(1)}
            suffix="/100"
          />
          <StatCard
            title="Consistency Score"
            value={data.performanceScores.consistency.toFixed(1)}
            suffix="/100"
          />
          <StatCard
            title="Growth Score"
            value={data.performanceScores.growth.toFixed(1)}
            suffix="/100"
          />
        </div>

        {/* Top & Bottom Performers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Performers */}
          <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-2 border-emerald-200">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Top Performers
            </h3>
            <div className="space-y-3">
              {data.topPerformers.slice(0, 5).map((store, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(store.rank)}`}>
                      #{store.rank}
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900">{store.storeName}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getPlatformBadgeColor(store.platform)}`}>
                        {store.platform}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{formatCurrency(store.revenue)}</p>
                    <p className={`text-xs font-semibold ${getScoreColor(store.performanceScore)}`}>
                      Score: {store.performanceScore.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Underperformers */}
          {data.underperformers.length > 0 && (
            <Card className="p-6 bg-gradient-to-br from-amber-50 to-white border-2 border-amber-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Needs Attention
              </h3>
              <div className="space-y-3">
                {data.underperformers.map((store, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                        #{store.rank}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-900">{store.storeName}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getPlatformBadgeColor(store.platform)}`}>
                          {getPlatformLabel(store.platform)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">{formatCurrency(store.revenue)}</p>
                      <p className={`text-xs font-semibold ${getScoreColor(store.performanceScore)}`}>
                        Score: {store.performanceScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* View Selector */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setView('stores')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              view === 'stores'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Store Rankings
          </button>
          <button
            onClick={() => setView('platforms')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              view === 'platforms'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Platform Analysis
          </button>
          <button
            onClick={() => setView('efficiency')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              view === 'efficiency'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Efficiency Metrics
          </button>
          <button
            onClick={() => setView('spending')}
            className={`px-6 py-2 rounded-lg font-semibold transition-colors ${
              view === 'spending'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            Spend per Site
          </button>
        </div>

        {/* Content based on view */}
        {view === 'stores' && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Complete Store Rankings</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rank</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Store</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Platform</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Revenue</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Transactions</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Avg Value</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.storePerformance.map((store, index) => (
                    <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(store.rank)}`}>
                          #{store.rank}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{store.storeName}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${getPlatformBadgeColor(store.platform)}`}>
                          {getPlatformLabel(store.platform)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-900">
                        {formatCurrency(store.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">{store.transactions}</td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        {formatCurrency(store.avgTransactionValue)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className={`w-12 h-12 rounded-full ${getScoreBgColor(store.performanceScore)} flex items-center justify-center`}>
                            <span className={`text-sm font-bold ${getScoreColor(store.performanceScore)}`}>
                              {store.performanceScore.toFixed(0)}
                            </span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {view === 'platforms' && (
          <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-900 mb-6">Platform Performance Comparison</h3>
            <div className="space-y-6">
              {data.platformPerformance.map((platform, index) => (
                <div key={index} className="p-5 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-4 py-2 rounded-full text-base font-bold ${getPlatformBadgeColor(platform.platform)}`}>
                      {getPlatformLabel(platform.platform)}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-slate-900">{formatCurrency(platform.revenue)}</p>
                      <p className="text-sm text-slate-600">{platform.revenueShare.toFixed(1)}% of total</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Transactions</p>
                      <p className="text-lg font-bold text-slate-900">{platform.transactions}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Stores</p>
                      <p className="text-lg font-bold text-slate-900">{platform.storeCount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Avg Transaction</p>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(platform.avgTransactionValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Avg per Store</p>
                      <p className="text-lg font-bold text-slate-900">{formatCurrency(platform.avgRevenuePerStore)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {view === 'efficiency' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Daily Efficiency</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Avg Revenue per Day</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.efficiencyMetrics.avgRevenuePerDay)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Avg Transactions per Day</p>
                  <p className="text-2xl font-bold text-slate-900">{data.efficiencyMetrics.avgTransactionsPerDay.toFixed(0)}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg border-2 border-emerald-200">
                  <p className="text-sm text-slate-600 mb-1">Peak Day Revenue</p>
                  <p className="text-2xl font-bold text-emerald-700">{formatCurrency(data.efficiencyMetrics.peakDayRevenue)}</p>
                  <p className="text-xs text-slate-500 mt-1">{data.efficiencyMetrics.peakDay}</p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-6">Store Efficiency</h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Avg Revenue per Store</p>
                  <p className="text-2xl font-bold text-slate-900">{formatCurrency(data.efficiencyMetrics.avgRevenuePerStore)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Avg Transactions per Store</p>
                  <p className="text-2xl font-bold text-slate-900">{data.efficiencyMetrics.avgTransactionsPerStore.toFixed(0)}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Days Covered</p>
                  <p className="text-2xl font-bold text-slate-900">{data.efficiencyMetrics.daysCovered}</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                  <p className="text-sm text-slate-600 mb-1">Utilization Rate</p>
                  <p className="text-2xl font-bold text-blue-700">{data.efficiencyMetrics.utilizationRate.toFixed(2)}</p>
                  <p className="text-xs text-slate-500 mt-1">transactions per store per day</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {view === 'spending' && (
          <div className="space-y-6">
            {data.spendPerSite.length === 0 ? (
              <Card className="p-10 text-center">
                <p className="text-slate-500 text-base mb-1 font-medium">No purchasing data available</p>
                <p className="text-slate-400 text-sm">Upload Booker data files to see spend per site.</p>
              </Card>
            ) : (
              <>
                {/* Total spend summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <StatCard
                    title="Total Purchasing Spend"
                    value={formatCurrency(data.spendPerSite.reduce((s, x) => s + x.spend, 0))}
                  />
                  <StatCard
                    title="Total Booker Orders"
                    value={data.spendPerSite.reduce((s, x) => s + x.orders, 0).toLocaleString()}
                  />
                  <StatCard
                    title="Buying Sites"
                    value={String(data.spendPerSite.length)}
                  />
                </div>

                {/* Spend per site table */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Purchasing Spend by Site (Booker)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-slate-200">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Rank</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Site</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Total Spend</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Orders</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Avg Order</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-slate-700">Spend Share</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const totalSpend = data.spendPerSite.reduce((s, x) => s + x.spend, 0);
                          return data.spendPerSite.map((site, index) => (
                            <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                              <td className="py-3 px-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${getRankBadgeColor(index + 1)}`}>
                                  #{index + 1}
                                </span>
                              </td>
                              <td className="py-3 px-4 font-semibold text-slate-900">{site.storeName}</td>
                              <td className="py-3 px-4 text-right font-semibold text-slate-900">{formatCurrency(site.spend)}</td>
                              <td className="py-3 px-4 text-right text-slate-600">{site.orders}</td>
                              <td className="py-3 px-4 text-right text-slate-600">{formatCurrency(site.avgOrder)}</td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <div className="w-24 bg-slate-100 rounded-full h-2">
                                    <div
                                      className="bg-emerald-500 h-2 rounded-full"
                                      style={{ width: `${totalSpend > 0 ? (site.spend / totalSpend) * 100 : 0}%` }}
                                    />
                                  </div>
                                  <span className="text-xs font-semibold text-slate-600 w-10 text-right">
                                    {totalSpend > 0 ? ((site.spend / totalSpend) * 100).toFixed(1) : '0'}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </div>
                </Card>

                {/* Spend bar chart */}
                <Card className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-5">Spend Distribution</h3>
                  <div className="space-y-3">
                    {(() => {
                      const maxSpend = Math.max(...data.spendPerSite.map(s => s.spend));
                      return data.spendPerSite.map((site, index) => (
                        <div key={index} className="flex items-center gap-4">
                          <div className="w-32 text-sm font-medium text-slate-700 truncate text-right">{site.storeName}</div>
                          <div className="flex-1 bg-slate-100 rounded-full h-7 relative">
                            <div
                              className="bg-emerald-500 h-7 rounded-full transition-all"
                              style={{ width: `${maxSpend > 0 ? (site.spend / maxSpend) * 100 : 0}%` }}
                            />
                            <span className="absolute inset-0 flex items-center px-3 text-xs font-bold text-white mix-blend-difference">
                              {formatCurrency(site.spend)}
                            </span>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
