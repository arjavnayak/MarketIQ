import { NextResponse } from "next/server";

export const revalidate = 86400;

type TejRow = {
  date?: string;
  close?: number;
  [key: string]: unknown;
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ symbol: string }> }
) {
  const { symbol: rawSymbol } = await context.params;
  const symbol = rawSymbol.toUpperCase();

  if (!/^[A-Z0-9&-]{1,30}$/.test(symbol)) {
    return NextResponse.json({ error: "Invalid NSE symbol." }, { status: 400 });
  }

  const from = new Date();
  from.setDate(from.getDate() - 14);
  const fromDate = from.toISOString().slice(0, 10);

  const url = new URL(`https://api.tejhq.dev/v1/ohlcv/nse/${encodeURIComponent(symbol)}`);
  url.searchParams.set("from", fromDate);

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `TejHQ returned ${response.status} for ${symbol}.` },
        { status: response.status === 404 ? 404 : 502 }
      );
    }

    const payload: unknown = await response.json();
    const rows = Array.isArray(payload)
      ? payload
      : typeof payload === "object" && payload !== null && "data" in payload && Array.isArray((payload as { data: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : null;

    if (!rows) {
      return NextResponse.json({ error: "Unexpected TejHQ response format." }, { status: 502 });
    }

    const validRows = (rows as TejRow[])
      .filter((row) => typeof row.date === "string" && typeof row.close === "number")
      .sort((a, b) => String(a.date).localeCompare(String(b.date)));

    return NextResponse.json(
      { symbol, exchange: "NSE", source: "TejHQ", data: validRows },
      { headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=82800" } }
    );
  } catch {
    return NextResponse.json({ error: "Unable to reach TejHQ. Try again later." }, { status: 502 });
  }
}
