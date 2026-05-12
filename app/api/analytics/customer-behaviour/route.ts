// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    newCustomers: 1843,
    returningCustomers: 976,
    totalCustomers: 2819,
    repeatRate: 34.62,
    avgPurchasesPerCustomer: 1.87,
    maxPurchases: 14,
    frequencySegments: { oneTime: 1843, twotoFive: 821, sixToTen: 127, moreThanTen: 28 },
    hasCustomerData: true,
  });
}
