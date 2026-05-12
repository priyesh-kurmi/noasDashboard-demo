// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    stores: [
      { storeId:"manchester-tmp", storeName:"Demo Cafe Manchester", platform:"tmp", transactionCount:2134, lastUploaded:"2025-05-10T14:32:00.000Z" },
      { storeId:"leeds-tmp", storeName:"Demo Cafe Leeds", platform:"tmp", transactionCount:1921, lastUploaded:"2025-05-09T11:20:00.000Z" },
      { storeId:"birmingham-tmp", storeName:"Demo Cafe Birmingham", platform:"tmp", transactionCount:1583, lastUploaded:"2025-05-08T09:45:00.000Z" },
    ]
  });
}
