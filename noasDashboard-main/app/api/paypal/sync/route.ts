// DEMO MODE
import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Demo mode: PayPal sync simulated successfully",
    transactionsImported: 1785,
    syncedFrom: "2024-06-01",
    syncedTo: "2025-05-10",
  });
}
