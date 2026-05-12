// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    success: true,
    synced: true,
    transactionCount: 1785,
    lastSynced: "2025-05-10T12:00:00.000Z",
    syncedFrom: "2024-06-01",
    syncedTo: "2025-05-10",
  });
}
