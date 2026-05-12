// DEMO MODE — hardcoded demo data only
import { NextRequest, NextResponse } from "next/server";

const DEMO_STORES = ["Demo Cafe Manchester", "Demo Cafe Leeds", "Demo Cafe Birmingham"];

const STORES = [
  { storeName: "Demo Cafe Manchester", platform: "tmp", totalSales: 54231.5, transactions: 2134, avgTransaction: 25.42, bestProduct: "Flat White" },
  { storeName: "Demo Cafe Leeds", platform: "tmp", totalSales: 48670.25, transactions: 1921, avgTransaction: 25.33, bestProduct: "Cappuccino" },
  { storeName: "Demo Cafe Birmingham", platform: "tmp", totalSales: 39820.0, transactions: 1583, avgTransaction: 25.15, bestProduct: "Croissant" },
];

const PRODUCT_BREAKDOWN = [
  { product: "Hot Drinks", revenue: 58430.25, orders: 2980, percentage: 40.8 },
  { product: "Cold Drinks", revenue: 34210.0, orders: 1842, percentage: 23.9 },
  { product: "Food", revenue: 28640.5, orders: 1521, percentage: 20.0 },
  { product: "Bakery", revenue: 21441.0, orders: 1295, percentage: 14.98 },
  { product: "Other", revenue: 0.5, orders: 0, percentage: 0.3 },
];

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const storeName = searchParams.get("storeName");

  const filteredStores = storeName && storeName !== "All Stores"
    ? STORES.filter(s => s.storeName === storeName)
    : STORES;

  const totalSales = filteredStores.reduce((s, st) => s + st.totalSales, 0);
  const totalTransactions = filteredStores.reduce((s, st) => s + st.transactions, 0);

  return NextResponse.json({
    stores: filteredStores,
    topStores: filteredStores.slice(0, 5),
    totalSales: Math.round(totalSales * 100) / 100,
    totalTransactions,
    averageTransaction: totalTransactions > 0 ? Math.round((totalSales / totalTransactions) * 100) / 100 : 0,
    availableStores: DEMO_STORES,
    productBreakdown: PRODUCT_BREAKDOWN,
  });
}
