// DEMO MODE
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "monthly";
  const salesMap: Record<string,number> = { weekly:14875, monthly:13980, yearly:142721, all:142721 };
  const prevMap: Record<string,number> = { weekly:13420, monthly:11890, yearly:118430, all:118430 };
  const ordersMap: Record<string,number> = { weekly:583, monthly:541, yearly:5638, all:5638 };
  const cur = salesMap[period] ?? 13980;
  const prev = prevMap[period] ?? 11890;
  const curOrders = ordersMap[period] ?? 541;
  const prevOrders = ordersMap[period === "weekly" ? "monthly" : "yearly"] ?? 489;
  const salesChange = Math.round(((cur - prev) / prev) * 10000) / 100;
  const transactionChange = Math.round(((curOrders - prevOrders) / prevOrders) * 10000) / 100;
  const curAov = Math.round((cur / curOrders) * 100) / 100;
  const prevAov = Math.round((prev / prevOrders) * 100) / 100;
  const avgChange = Math.round(((curAov - prevAov) / prevAov) * 10000) / 100;
  return NextResponse.json({
    totalSales: cur,
    totalTransactions: curOrders,
    averageTransaction: curAov,
    totalStores: 3,
    salesChange,
    transactionChange,
    avgChange,
    lastUploadDate: "2025-05-10T14:32:00.000Z",
    dataStartDate: "2024-06-01T00:00:00.000Z",
    dataEndDate: "2025-05-12T00:00:00.000Z",
    distinctStores: ["Noas Cafe Manchester","Noas Cafe Leeds","Noas Cafe Birmingham"],
    lastUpload: { storeName:"Noas Cafe Manchester", lastUploaded:"2025-05-10T14:32:00.000Z" },
  });
}
