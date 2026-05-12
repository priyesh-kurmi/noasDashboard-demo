// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    stores: [
      { storeId:"manchester-tmp", storeName:"Demo Cafe Manchester", platform:"tmp" },
      { storeId:"leeds-tmp", storeName:"Demo Cafe Leeds", platform:"tmp" },
      { storeId:"birmingham-tmp", storeName:"Demo Cafe Birmingham", platform:"tmp" },
    ]
  });
}
