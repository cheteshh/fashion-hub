import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FashionHub",
  description: "Real-time clothing price aggregator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900">{children}</body>
    </html>
  );
}
