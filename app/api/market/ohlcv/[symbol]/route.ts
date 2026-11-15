import { NextResponse } from "next/server";

// Public preview mode: TejHQ's free terms do not permit public display.
// Keep this endpoint disabled until a provider with public-display rights is configured.
export async function GET() {
  return NextResponse.json(
    { error: "Market data is temporarily unavailable while a public-display data provider is configured." },
    {
      status: 503,
      headers: { "Cache-Control": "no-store" },
    }
  );
}
