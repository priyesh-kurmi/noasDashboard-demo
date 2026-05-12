// DEMO MODE
import { NextResponse } from "next/server";
const DEMO_STORES = [
  {storeName:"Demo Cafe Manchester",platform:"tmp"},
  {storeName:"Demo Cafe Leeds",platform:"tmp"},
  {storeName:"Demo Cafe Birmingham",platform:"tmp"},
];
export async function GET() {
  const hourlyPattern = [0,0,0,0,0,0,5,48,142,198,187,164,192,178,155,143,121,98,72,43,28,14,6,2];
  const salesByHour = Array.from({length:24},(_,i) => ({
    hour:i,
    displayHour:i===0?"12 AM":i<12?`${i} AM`:i===12?"12 PM":`${i-12} PM`,
    orders:hourlyPattern[i],
    sales:Math.round(hourlyPattern[i]*25.3*100)/100,
    avgOrderValue:hourlyPattern[i]>0?25.3:0,
  }));
  const salesByDayOfWeek = [
    {day:0,dayName:"Sunday",orders:621,sales:15712.0,avgOrderValue:25.3},
    {day:1,dayName:"Monday",orders:312,sales:7893.6,avgOrderValue:25.3},
    {day:2,dayName:"Tuesday",orders:348,sales:8804.4,avgOrderValue:25.3},
    {day:3,dayName:"Wednesday",orders:392,sales:9917.6,avgOrderValue:25.3},
    {day:4,dayName:"Thursday",orders:421,sales:10651.3,avgOrderValue:25.3},
    {day:5,dayName:"Friday",orders:589,sales:14901.7,avgOrderValue:25.3},
    {day:6,dayName:"Saturday",orders:821,sales:20771.3,avgOrderValue:25.3},
  ];
  return NextResponse.json({
    salesByHour,
    ordersByHour:salesByHour.map(h=>({hour:h.hour,displayHour:h.displayHour,orders:h.orders})),
    salesByDayOfWeek,
    busiestPeriod:{hour:12,displayHour:"12 PM",orders:192,sales:4857.6},
    quietestPeriod:{hour:4,displayHour:"4 AM",orders:0,sales:0},
    hasRealTimeData:true,totalTransactions:3504, availableStores:DEMO_STORES,
  });
}
