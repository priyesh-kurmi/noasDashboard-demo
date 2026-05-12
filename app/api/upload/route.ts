// DEMO MODE
import { NextRequest, NextResponse } from "next/server";
export async function POST(_request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: "Demo mode: file upload simulated. No data was actually stored.",
    transactionsImported: 0,
    storeName: "Demo Store",
  });
}
