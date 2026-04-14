import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "FashionHub — India's Smartest Price Tracker",
  description:
    "Compare fashion prices across Myntra, Amazon, Flipkart, Ajio & Tata CLiQ. Track price history, set alerts, and buy at the best price.",
  keywords: "price comparison india, myntra deals, amazon fashion, flipkart clothing, fashion price tracker",
  openGraph: {
    title: "FashionHub — India's Smartest Price Tracker",
    description: "Compare fashion prices across 5 major Indian e-commerce platforms.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
        style={{ background: "var(--bg-primary)", color: "var(--text-primary)", minHeight: "100vh" }}
      >
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
