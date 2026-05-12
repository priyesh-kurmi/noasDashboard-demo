// DEMO MODE — returns hardcoded demo data, no database connection used
import { NextRequest, NextResponse } from "next/server";

const DEMO_STORES = [
  { storeName: "Demo Cafe Manchester", platform: "tmp" },
  { storeName: "Demo Cafe Leeds", platform: "tmp" },
  { storeName: "Demo Cafe Birmingham", platform: "tmp" },
  { storeName: "Demo Cafe Manchester", platform: "paypal" },
];

const MONTHLY_REVENUE = [
  { date: "2024-06", revenue: 8420.5, transactions: 312 },
  { date: "2024-07", revenue: 9105.75, transactions: 345 },
  { date: "2024-08", revenue: 9876.0, transactions: 378 },
  { date: "2024-09", revenue: 10234.25, transactions: 401 },
  { date: "2024-10", revenue: 11102.5, transactions: 432 },
  { date: "2024-11", revenue: 12450.0, transactions: 489 },
  { date: "2024-12", revenue: 14320.75, transactions: 562 },
  { date: "2025-01", revenue: 11890.0, transactions: 467 },
  { date: "2025-02", revenue: 12345.5, transactions: 484 },
  { date: "2025-03", revenue: 13210.0, transactions: 518 },
  { date: "2025-04", revenue: 13980.25, transactions: 541 },
  { date: "2025-05", revenue: 14875.0, transactions: 583 },
];

const WEEKLY_REVENUE = Array.from({ length: 12 }, (_, i) => {
  const base = 2800 + i * 120 + (i % 3 === 0 ? 400 : 0);
  return {
    date: `2025-W${String(i + 19).padStart(2, "0")}`,
    revenue: Math.round(base * 100) / 100,
    transactions: 110 + i * 4,
  };
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const period = searchParams.get("period") || "monthly";

  const revenueByPeriod = period === "weekly" ? WEEKLY_REVENUE : MONTHLY_REVENUE;

  const totalRevenue = revenueByPeriod.reduce((s, p) => s + p.revenue, 0);
  const totalCount = revenueByPeriod.reduce((s, p) => s + p.transactions, 0);

  const revenueByPlatform = [
    { platform: "tmp", revenue: Math.round(totalRevenue * 0.72 * 100) / 100, transactions: Math.round(totalCount * 0.72), avgValue: 24.35, percentage: 72 },
    { platform: "paypal", revenue: Math.round(totalRevenue * 0.28 * 100) / 100, transactions: Math.round(totalCount * 0.28), avgValue: 31.1, percentage: 28 },
  ];

  const revenueByStore = [
    { storeName: "Demo Cafe Manchester", platform: "tmp", revenue: Math.round(totalRevenue * 0.38 * 100) / 100, transactions: Math.round(totalCount * 0.38), percentage: 38 },
    { storeName: "Demo Cafe Leeds", platform: "tmp", revenue: Math.round(totalRevenue * 0.34 * 100) / 100, transactions: Math.round(totalCount * 0.34), percentage: 34 },
    { storeName: "Demo Cafe Birmingham", platform: "tmp", revenue: Math.round(totalRevenue * 0.28 * 100) / 100, transactions: Math.round(totalCount * 0.28), percentage: 28 },
  ];

  const platformBreakdown: Record<string, any> = {};
  revenueByPlatform.forEach((p) => { platformBreakdown[p.platform] = p; });

  const last = revenueByPeriod[revenueByPeriod.length - 1];
  const prev = revenueByPeriod[revenueByPeriod.length - 2];
  const revenueGrowth = prev ? Math.round(((last.revenue - prev.revenue) / prev.revenue) * 10000) / 100 : 0;

  return NextResponse.json({
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    revenueByPeriod,
    revenueByPlatform,
    revenueGrowth,
    averageOrderValue: Math.round((totalRevenue / totalCount) * 100) / 100,
    projectedRevenue: Math.round(totalRevenue * 1.08 * 100) / 100,
    platformBreakdown,
    periodComparison: {
      current: { revenue: last.revenue, transactions: last.transactions },
      previous: { revenue: prev?.revenue ?? 0, transactions: prev?.transactions ?? 0 },
      change: {
        revenue: Math.round((last.revenue - (prev?.revenue ?? 0)) * 100) / 100,
        revenuePercent: revenueGrowth,
        transactions: last.transactions - (prev?.transactions ?? 0),
        transactionPercent: prev ? Math.round(((last.transactions - prev.transactions) / prev.transactions) * 10000) / 100 : 0,
      },
    },
    revenueByStore,
    availableStores: DEMO_STORES,
  });
}
