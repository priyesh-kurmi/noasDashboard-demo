// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    stores: [
      { storeName:"Demo Cafe Manchester",platform:"tmp",totalSales:54231.5,totalOrders:2134,aov:25.42,overallAOV:25.42,currentWeekSales:3820,lastWeekSales:3540,currentWeekOrders:150,lastWeekOrders:139,bookerSpend:12430.5,grossProfit:41801.0,profit:41801.0,roi:336.3,bestProduct:"Flat White",profitMargin:77.1,weekOnWeekChange:7.9 },
      { storeName:"Demo Cafe Leeds",platform:"tmp",totalSales:48670.25,totalOrders:1921,aov:25.33,overallAOV:25.33,currentWeekSales:3420,lastWeekSales:3180,currentWeekOrders:135,lastWeekOrders:125,bookerSpend:10820.0,grossProfit:37850.25,profit:37850.25,roi:349.8,bestProduct:"Cappuccino",profitMargin:77.8,weekOnWeekChange:7.5 },
      { storeName:"Demo Cafe Birmingham",platform:"tmp",totalSales:39820.0,totalOrders:1583,aov:25.15,overallAOV:25.15,currentWeekSales:2810,lastWeekSales:2630,currentWeekOrders:111,lastWeekOrders:104,bookerSpend:8940.25,grossProfit:30879.75,profit:30879.75,roi:345.4,bestProduct:"Croissant",profitMargin:77.5,weekOnWeekChange:6.8 },
    ],
    storeCount: 3,
    totalSales: 142721.75,
    totalOrders: 5638,
    overallAOV: 25.32,
  });
}
