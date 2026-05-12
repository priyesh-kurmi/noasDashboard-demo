// DEMO MODE
import { NextResponse } from "next/server";
const months = ["2024-10","2024-11","2024-12","2025-01","2025-02","2025-03","2025-04","2025-05"];
const labels = ["Oct 24","Nov 24","Dec 24","Jan 25","Feb 25","Mar 25","Apr 25","May 25"];
const revenues = [11102,12450,14320,11890,12345,13210,13980,14875];
const orders =   [432,489,562,467,484,518,541,583];
export async function GET() {
  const salesTrendMonthly = months.map((m,i) => ({
    month: m, label: labels[i], revenue: revenues[i], orders: orders[i],
    aov: Math.round((revenues[i]/orders[i])*100)/100,
    changeVsPrevMonth: i === 0 ? 0 : Math.round(((revenues[i]-revenues[i-1])/revenues[i-1])*10000)/100,
  }));
  const salesTrendWeekly = Array.from({length:12},(_,i) => ({
    week:`2025-W${String(i+19).padStart(2,"0")}`, label:`W${i+19}`,
    revenue: 2800+i*120+(i%3===0?400:0), orders: 110+i*4,
    aov: Math.round(((2800+i*120)/(110+i*4))*100)/100,
    changeVsPrevMonth: i===0?0:((i*120-((i-1)*120))/((i-1)*120+2800))*100,
  }));
  return NextResponse.json({
    bestSellingProducts: [
      {rank:1,name:"Flat White",category:"Hot Drinks",revenue:18432.5,quantity:1843,avgPrice:10.0},
      {rank:2,name:"Cappuccino",category:"Hot Drinks",revenue:14210.0,quantity:1421,avgPrice:10.0},
      {rank:3,name:"Croissant",category:"Bakery",revenue:9840.0,quantity:1640,avgPrice:6.0},
      {rank:4,name:"Avocado Toast",category:"Food",revenue:8925.0,quantity:595,avgPrice:15.0},
      {rank:5,name:"Iced Latte",category:"Cold Drinks",revenue:7480.0,quantity:935,avgPrice:8.0},
    ],
    salesTrendWeekly, salesTrendMonthly,
    topProductByStore: [
      {storeName:"Noas Cafe Manchester",topProduct:"Flat White",revenue:8200},
      {storeName:"Noas Cafe Leeds",topProduct:"Cappuccino",revenue:6100},
      {storeName:"Noas Cafe Birmingham",topProduct:"Croissant",revenue:4900},
    ],
    bestDayOfWeek: {day:6,dayName:"Saturday",orders:621,revenue:15432,aov:24.85},
    worstDayOfWeek: {day:1,dayName:"Monday",orders:312,revenue:7821,aov:25.07},
    dayOfWeekData: [
      {day:1,dayName:"Monday",revenue:7821,orders:312,aov:25.07},
      {day:2,dayName:"Tuesday",revenue:9104,orders:363,aov:25.08},
      {day:3,dayName:"Wednesday",revenue:10230,orders:408,aov:25.07},
      {day:4,dayName:"Thursday",revenue:11045,orders:440,aov:25.10},
      {day:5,dayName:"Friday",revenue:13280,orders:529,aov:25.10},
      {day:6,dayName:"Saturday",revenue:15432,orders:621,aov:24.85},
      {day:0,dayName:"Sunday",revenue:12480,orders:499,aov:25.01},
    ],
    repeatCustomerRate: 34.62,
    repeatCustomerNote: "34.6% of customers return within 30 days",
    hasProductData: true, totalOrders: 5638, totalRevenue: 142721.75,
  });
}
