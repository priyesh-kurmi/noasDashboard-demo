// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    hasData: true,
    summary: {
      totalSpend: 32190.75,
      totalQuantity: 8420,
      totalLines: 1240,
      totalInvoices: 89,
    },
    productBreakdown: [
      {productCode:"CS-001",description:"Whole Milk 2L",category:"Dairy",totalSpend:4820.5,totalQuantity:2410,orderCount:89,storeCount:3,monthCount:5,pct:15.0},
      {productCode:"CS-002",description:"Espresso Blend 1kg",category:"Coffee",totalSpend:6840.0,totalQuantity:684,orderCount:71,storeCount:3,monthCount:5,pct:21.2},
      {productCode:"CS-003",description:"Takeaway Cups 12oz x500",category:"Packaging",totalSpend:2140.0,totalQuantity:428,orderCount:42,storeCount:3,monthCount:5,pct:6.6},
      {productCode:"FI-001",description:"Sourdough Loaf",category:"Bakery Supplies",totalSpend:1920.0,totalQuantity:480,orderCount:38,storeCount:2,monthCount:5,pct:6.0},
      {productCode:"FI-002",description:"Avocado Case x12",category:"Food Ingredients",totalSpend:2280.0,totalQuantity:190,orderCount:31,storeCount:3,monthCount:5,pct:7.1},
    ],
    categoryBreakdown:[
      {category:"Coffee",totalSpend:6840.0,totalQuantity:684,lineCount:71,pct:21.2},
      {category:"Dairy",totalSpend:4820.5,totalQuantity:2410,lineCount:89,pct:15.0},
      {category:"Food Ingredients",totalSpend:9840.0,totalQuantity:1820,lineCount:124,pct:30.6},
      {category:"Packaging",totalSpend:4230.25,totalQuantity:1506,lineCount:53,pct:13.1},
      {category:"Bakery Supplies",totalSpend:6460.0,totalQuantity:1800,lineCount:81,pct:20.1},
    ],
    monthlyTrend:[
      {period:"2025-01",totalSpend:3820,totalQuantity:1010,invoiceCount:17},
      {period:"2025-02",totalSpend:3940,totalQuantity:1042,invoiceCount:18},
      {period:"2025-03",totalSpend:4120,totalQuantity:1089,invoiceCount:19},
      {period:"2025-04",totalSpend:4310,totalQuantity:1140,invoiceCount:20},
      {period:"2025-05",totalSpend:4200,totalQuantity:1110,invoiceCount:15},
    ],
    yearlyTrend:[
      {period:"2024",year:2024,totalSpend:15800,totalQuantity:4180,invoiceCount:44},
      {period:"2025",year:2025,totalSpend:20390,totalQuantity:5391,invoiceCount:89},
    ],
    storeBreakdown:[
      {store:"Demo Cafe Manchester",totalSpend:12430.5,totalQuantity:3284,invoiceCount:36,topCategory:"Coffee"},
      {store:"Demo Cafe Leeds",totalSpend:10820.0,totalQuantity:2860,invoiceCount:31,topCategory:"Dairy"},
      {store:"Demo Cafe Birmingham",totalSpend:8940.25,totalQuantity:2363,invoiceCount:26,topCategory:"Bakery Supplies"},
    ],
    topProductsPerStore:[
      {store:"Demo Cafe Manchester",topProduct:"Espresso Blend 1kg",spend:2840.0},
      {store:"Demo Cafe Leeds",topProduct:"Whole Milk 2L",spend:2010.5},
      {store:"Demo Cafe Birmingham",topProduct:"Sourdough Loaf",spend:1820.0},
    ],
    filters: {
      availableStores:["Demo Cafe Manchester","Demo Cafe Leeds","Demo Cafe Birmingham"],
      availableYears:[2024,2025],
      availableMonths:["2025-01","2025-02","2025-03","2025-04","2025-05"],
    },
  });
}

