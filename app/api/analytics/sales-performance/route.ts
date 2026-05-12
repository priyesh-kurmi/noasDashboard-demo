// DEMO MODE
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "weekly";
  const weekly = [
    {date:"2025-03-10",label:"10 Mar",sales:13420,orders:528},{date:"2025-03-17",label:"17 Mar",sales:12980,orders:511},
    {date:"2025-03-24",label:"24 Mar",sales:14100,orders:554},{date:"2025-03-31",label:"31 Mar",sales:13500,orders:531},
    {date:"2025-04-07",label:"7 Apr",sales:15200,orders:597},{date:"2025-04-14",label:"14 Apr",sales:14600,orders:574},
    {date:"2025-04-21",label:"21 Apr",sales:15900,orders:625},{date:"2025-04-28",label:"28 Apr",sales:16300,orders:641},
    {date:"2025-05-05",label:"5 May",sales:15700,orders:617},{date:"2025-05-12",label:"12 May",sales:14875,orders:583},
  ];
  const monthly = [
    {date:"2024-10",label:"Oct 24",sales:11102,orders:432},{date:"2024-11",label:"Nov 24",sales:12450,orders:489},
    {date:"2024-12",label:"Dec 24",sales:14320,orders:562},{date:"2025-01",label:"Jan 25",sales:11890,orders:467},
    {date:"2025-02",label:"Feb 25",sales:12345,orders:484},{date:"2025-03",label:"Mar 25",sales:13210,orders:518},
    {date:"2025-04",label:"Apr 25",sales:13980,orders:541},{date:"2025-05",label:"May 25",sales:14875,orders:583},
  ];
  const breakdown = period === "monthly" ? monthly : weekly;
  const cur = breakdown[breakdown.length-1];
  const prev = breakdown[breakdown.length-2];
  const change = prev ? Math.round(((cur.sales-prev.sales)/prev.sales)*10000)/100 : 0;
  return NextResponse.json({
    totalSales:142721.75, ordersCount:5638, aov:25.32,
    periodChange:change, currentPeriodSales:cur.sales, lastPeriodSales:prev?.sales??0,
    currentPeriodOrders:cur.orders, lastPeriodOrders:prev?.orders??0,
    breakdown, periodLabel:period==="monthly"?"Monthly":"Weekly",
    currentPeriodLabel:cur.label, lastPeriodLabel:prev?.label??"",
    salesByStore: [
      {storeName:"Noas Cafe Manchester",platform:"tmp",sales:54231.5,orders:2134},
      {storeName:"Noas Cafe Leeds",platform:"tmp",sales:48670.25,orders:1921},
      {storeName:"Noas Cafe Birmingham",platform:"tmp",sales:39820.0,orders:1583},
    ],
    availableStores: [
      {storeName:"Noas Cafe Manchester",platform:"tmp"},
      {storeName:"Noas Cafe Leeds",platform:"tmp"},
      {storeName:"Noas Cafe Birmingham",platform:"tmp"},
    ],
  });
}
