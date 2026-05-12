'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from './components/DashboardLayout';
import { Card, StatCard } from './components/ui';

interface DashboardStats {
  totalSales: number;
  totalTransactions: number;
  averageTransaction: number;
  totalStores: number;
  lastUploadDate: string | null;
  salesChange: number | null;
  transactionChange: number | null;
  avgChange: number | null;
  dataStartDate: string | null;
  dataEndDate: string | null;
}

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalTransactions: 0,
    averageTransaction: 0,
    totalStores: 0,
    lastUploadDate: null,
    salesChange: null,
    transactionChange: null,
    avgChange: null,
    dataStartDate: null,
    dataEndDate: null,
  });
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly' | 'all'>('monthly');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    // Show cached data immediately (stale-while-revalidate)
    const cacheKey = `stats_cache_${period}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setStats(JSON.parse(cached));
        setLoading(false); // show cached data right away, refresh silently
      }
    } catch {}

    try {
      const response = await fetch(`/api/stats?period=${period}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPeriodLabel = () => {
    const labels = {
      weekly: 'This Week',
      monthly: 'This Month',
      yearly: 'This Year',
      all: 'All Time'
    };
    return labels[period];
  };

  const getAnalyticsIcon = (type: string) => {
    const icons: Record<string, React.ReactElement> = {
      revenue: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
      trends: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
      performance: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>,
      sales: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
      comparison: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>,
      time: <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    };
    return icons[type];
  };

  const analyticsCards = [
    {
      title: 'Sales Performance',
      description: 'Track revenue, orders, and week-on-week growth',
      iconType: 'revenue',
      route: '/sales-performance',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Product Performance',
      description: 'Top products, categories, and food vs drinks split',
      iconType: 'sales',
      route: '/product-performance',
      color: 'from-emerald-500 to-emerald-600'
    },
    {
      title: 'Time-Based Demand',
      description: 'Sales patterns by hour and day of week',
      iconType: 'time',
      route: '/time-demand',
      color: 'from-violet-500 to-purple-600'
    },
    {
      title: 'Trends & Patterns',
      description: 'Best-selling products, weekly trends, and customer insights',
      iconType: 'trends',
      route: '/trends',
      color: 'from-indigo-500 to-indigo-600'
    },
    {
      title: 'Site Comparison',
      description: 'Compare performance, profit, and ROI across all stores',
      iconType: 'comparison',
      route: '/site-comparison',
      color: 'from-amber-500 to-orange-600'
    },
    {
      title: 'Buying & Spend',
      description: 'Booker purchasing costs, weekly spend, and % of sales',
      iconType: 'performance',
      route: '/buying-spend',
      color: 'from-rose-500 to-rose-600'
    }
  ];

  return (
    <DashboardLayout>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
              <p className="text-base text-slate-600 mt-2 font-medium">
                Comprehensive analytics for all your café locations
              </p>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 rounded-xl p-1">
              {(['weekly', 'monthly', 'yearly', 'all'] as const).map(p => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    period === p
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {p === 'weekly' ? 'This Week' : p === 'monthly' ? 'This Month' : p === 'yearly' ? 'This Year' : 'All Time'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Period Badge */}
        <div className="mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-semibold border border-blue-200">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Showing: {getPeriodLabel()}
          </span>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Revenue"
            value={`£${stats.totalSales.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            change={stats.salesChange ?? undefined}
          />
          <StatCard
            title="Total Orders"
            value={stats.totalTransactions.toLocaleString()}
            change={stats.transactionChange ?? undefined}
          />
          <StatCard
            title="Avg Order Value"
            value={`£${stats.averageTransaction.toFixed(2)}`}
            change={stats.avgChange ?? undefined}
          />
          <StatCard
            title="Active Stores"
            value={stats.totalStores.toString()}
          />
        </div>

        {/* Analytics Quick Access */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Analytics Suite</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyticsCards.map((card, index) => (
              <Card
                key={index}
                className="p-6 cursor-pointer hover:scale-105 transition-transform duration-200 group"
                onClick={() => router.push(card.route)}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  {getAnalyticsIcon(card.iconType)}
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-sm text-slate-600">{card.description}</p>
                <div className="mt-4 flex items-center text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                  View Analytics
                  <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Last Upload Info */}
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Data Status</h3>
              <p className="text-sm text-slate-600">
                {stats.lastUploadDate
                  ? `Last uploaded: ${new Date(stats.lastUploadDate).toLocaleString('en-GB', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}`
                  : 'No data uploaded yet — Upload data to see analytics'}
              </p>
              {stats.dataStartDate && stats.dataEndDate && (
                <p className="text-xs text-slate-500 mt-1">
                  Data range:{' '}
                  <span className="font-medium">
                    {new Date(stats.dataStartDate).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                  </span>
                  {' '}–{' '}
                  <span className="font-medium">
                    {new Date(stats.dataEndDate).toLocaleDateString('en-GB', { dateStyle: 'medium' })}
                  </span>
                </p>
              )}
            </div>
            <button
              onClick={() => router.push('/upload')}
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-semibold hover:bg-slate-800 transition-colors"
            >
              Upload Data
            </button>
          </div>
        </Card>

        {/* Quick Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Supported Platforms</h3>
            <p className="text-sm text-slate-600">
              <span className="font-semibold text-blue-700">TakeMyPayments (TMP)</span> — sales data from your café tills.
            </p>
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-semibold text-emerald-700">Booker</span> — purchasing/cost data (shown in Purchasing page only).
            </p>
            <p className="text-sm text-slate-600 mt-1">
              <span className="font-semibold text-purple-700">PayPal POS</span> — additional till sales data.
            </p>
          </Card>

          <Card className="p-6">
            <h3 className="text-sm font-medium text-slate-700 mb-2">Supported Formats</h3>
            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">.xlsx</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">.xls</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">.csv</span>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
