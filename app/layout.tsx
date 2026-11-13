import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketIQ | Indian Market Intelligence",
  description: "A professional workspace for Indian equity market research and analysis."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
