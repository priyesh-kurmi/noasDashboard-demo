// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  const storePerformance = [
    { rank:1,storeName:"Noas Cafe Manchester",platform:"tmp",revenue:54231.5,transactions:2134,avgTransactionValue:25.42,performanceScore:87,consistency:82,growth:9.2 },
    { rank:2,storeName:"Noas Cafe Leeds",platform:"tmp",revenue:48670.25,transactions:1921,avgTransactionValue:25.33,performanceScore:79,consistency:76,growth:7.1 },
    { rank:3,storeName:"Noas Cafe Birmingham",platform:"tmp",revenue:39820.0,transactions:1583,avgTransactionValue:25.15,performanceScore:68,consistency:71,growth:5.4 },
  ];
  return NextResponse.json({
    storePerformance,
    platformPerformance: [
      {platform:"tmp",revenue:142721.75,transactions:5638,avgTransactionValue:25.32,revenueShare:72,storeCount:3,avgRevenuePerStore:47573.92},
      {platform:"paypal",revenue:55497.25,transactions:1785,avgTransactionValue:31.09,revenueShare:28,storeCount:1,avgRevenuePerStore:55497.25},
    ],
    topPerformers: storePerformance.slice(0,2),
    underperformers: [storePerformance[2]],
    efficiencyMetrics: {
      avgRevenuePerDay: 1856.39,
      avgTransactionsPerDay: 73.2,
      avgRevenuePerStore: 47573.92,
      avgTransactionsPerStore: 1879.33,
      peakDay: "Saturday",
      peakDayRevenue: 2847.5,
      daysCovered: 77,
      utilizationRate: 94.2,
    },
    performanceScores: { overall:78,revenue:82,consistency:76,growth:7.2 },
    salesSummary: { totalRevenue:142721.75,totalOrders:5638,avgOrderValue:25.32,storeCount:3 },
    spendPerSite: [
      {storeName:"Noas Cafe Manchester",spend:12430.5,orders:498,avgOrder:24.96},
      {storeName:"Noas Cafe Leeds",spend:10820.0,orders:433,avgOrder:24.99},
      {storeName:"Noas Cafe Birmingham",spend:8940.25,orders:358,avgOrder:24.97},
    ],
    scoringExplanation: {
      description:"Performance scores combine revenue, transaction volume, and consistency",
      weights:{ revenue:{label:"Revenue (40%)"}, transactions:{label:"Transactions (30%)"}, consistency:{label:"Consistency (30%)"} },
      scale:"0-100 - scores >= 80 = excellent, >= 60 = good, >= 40 = fair, < 40 = needs attention",
    },
    totalStores:3, totalPlatforms:2,
  });
}
