// DEMO MODE
import { NextResponse } from "next/server";
export async function GET() {
  return NextResponse.json({ success: true, message: "Demo mode: no database to initialise." });
}
