import { NextResponse } from "next/server";

export const revalidate = 3600;

type SnapshotRow = {
  symbol?: string;
  close?: number | string;
  prev_close?: number | string;
};

function indiaDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export async function GET() {
  const today = new Date();
  const attempts: string[] = [];

  for (let offset = 0; offset < 8; offset++) {
    const candidate = new Date(today);
    candidate.setUTCDate(candidate.getUTCDate() - offset);
    const date = indiaDate(candidate);
    attempts.push(date);

    try {
      const url = new URL("https://api.tejhq.dev/v1/snapshot/nse");
      url.searchParams.set("date", date);
      const response = await fetch(url, {
        headers: { Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) continue;

      const payload: unknown = await response.json();
      const rows = typeof payload === "object" && payload !== null && "data" in payload
        ? (payload as { data?: unknown }).data
        : null;
      if (!Array.isArray(rows) || rows.length === 0) continue;

      let advances = 0;
      let declines = 0;
      let unchanged = 0;
      for (const item of rows as SnapshotRow[]) {
        const close = Number(item.close);
        const previous = Number(item.prev_close);
        if (!Number.isFinite(close) || !Number.isFinite(previous)) continue;
        if (close > previous) advances++;
        else if (close < previous) declines++;
        else unchanged++;
      }

      return NextResponse.json(
        { source: "TejHQ", exchange: "NSE", date, advances, declines, unchanged, total: advances + declines + unchanged },
        { headers: { "Cache-Control": "private, max-age=3600, stale-while-revalidate=82800" } }
      );
    } catch {
      // Try the previous calendar day; weekends and exchange holidays have no snapshot.
    }
  }

  return NextResponse.json(
    { error: "No recent NSE snapshot was available from TejHQ.", attemptedDates: attempts },
    { status: 502 }
  );
}
