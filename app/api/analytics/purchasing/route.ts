// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    totalSpend: 32190.75,
    totalOrders: 892,
    avgOrderValue: 36.09,
    spendByStore: [
      {storeName:"Demo Cafe Manchester",spend:12430.5,orders:348,avgOrder:35.72,topCategory:"Coffee Supplies"},
      {storeName:"Demo Cafe Leeds",spend:10820.0,orders:301,avgOrder:35.95,topCategory:"Coffee Supplies"},
      {storeName:"Demo Cafe Birmingham",spend:8940.25,orders:243,avgOrder:36.79,topCategory:"Food Ingredients"},
    ],
    spendByCategory: [
      {category:"Coffee Supplies",spend:14320.0,orders:398,percentage:44.5},
      {category:"Food Ingredients",spend:10840.5,orders:301,percentage:33.7},
      {category:"Packaging",spend:4230.25,orders:123,percentage:13.1},
      {category:"Sundries",spend:2800.0,orders:70,percentage:8.7},
    ],
    spendByCategoryAndStore: [
      {storeName:"Demo Cafe Manchester",categories:[{category:"Coffee Supplies",spend:5840},{category:"Food Ingredients",spend:4320}]},
      {storeName:"Demo Cafe Leeds",categories:[{category:"Coffee Supplies",spend:5100},{category:"Food Ingredients",spend:3980}]},
      {storeName:"Demo Cafe Birmingham",categories:[{category:"Coffee Supplies",spend:3380},{category:"Packaging",spend:2100}]},
    ],
    availableStores:["Demo Cafe Manchester","Demo Cafe Leeds","Demo Cafe Birmingham"],
    periodData:[
      {period:"2025-01",spend:3820,orders:106},{period:"2025-02",spend:3940,orders:109},
      {period:"2025-03",spend:4120,orders:114},{period:"2025-04",spend:4310,orders:119},
      {period:"2025-05",spend:4200,orders:116},
    ],
  });
}
