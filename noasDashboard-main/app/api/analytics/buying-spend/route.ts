// DEMO MODE
import { NextResponse } from "next/server";
const weeks = ["2025-W10","2025-W11","2025-W12","2025-W13","2025-W14","2025-W15","2025-W16","2025-W17"];
const labels = ["10 Mar","17 Mar","24 Mar","31 Mar","7 Apr","14 Apr","21 Apr","28 Apr"];
const spends = [3120,2980,3340,3210,3580,3420,3760,3890];
const sales =  [13200,12800,14100,13500,15200,14600,15900,16300];
const storeRatios = [0.39,0.35,0.26];
const storeNames = ["Noas Cafe Manchester","Noas Cafe Leeds","Noas Cafe Birmingham"];
export async function GET() {
  const weeklySpend = weeks.map((w,i) => ({
    week:w, label:labels[i], spend:spends[i], sales:sales[i],
    avg4Week: Math.round(spends.slice(Math.max(0,i-3),i+1).reduce((a,b)=>a+b,0)/Math.min(i+1,4)*100)/100,
    wowChange: i===0?0:Math.round(((spends[i]-spends[i-1])/spends[i-1])*10000)/100,
    spendOfSalesPct: Math.round((spends[i]/sales[i])*10000)/100,
  }));
  const storeWeekly = storeNames.map((storeName, si) => {
    const ratio = storeRatios[si];
    const storeSpends = spends.map(s => Math.round(s*ratio*100)/100);
    const totalSpend = Math.round(storeSpends.reduce((a,b)=>a+b,0)*100)/100;
    const storeWeeks = weeks.map((w,i) => ({
      week:w, label:labels[i], spend:storeSpends[i],
      avg4Week: Math.round(storeSpends.slice(Math.max(0,i-3),i+1).reduce((a,b)=>a+b,0)/Math.min(i+1,4)*100)/100,
      wowChange: i===0?0:Math.round(((storeSpends[i]-storeSpends[i-1])/storeSpends[i-1])*10000)/100,
      spendOfSalesPct: Math.round((storeSpends[i]/sales[i])*10000)/100,
    }));
    return { storeName, totalSpend, weeks: storeWeeks };
  });
  return NextResponse.json({
    weeklySpend,
    storeWeekly,
    availableStores: storeNames,
    totalSpend: spends.reduce((a,b)=>a+b,0),
    avgWeeklySpend: Math.round(spends.reduce((a,b)=>a+b,0)/spends.length*100)/100,
  });
}

