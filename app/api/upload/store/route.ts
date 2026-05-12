// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({
    stores: [
      { storeId:"manchester-tmp", storeName:"Noas Cafe Manchester", platform:"tmp" },
      { storeId:"leeds-tmp", storeName:"Noas Cafe Leeds", platform:"tmp" },
      { storeId:"birmingham-tmp", storeName:"Noas Cafe Birmingham", platform:"tmp" },
    ]
  });
}
