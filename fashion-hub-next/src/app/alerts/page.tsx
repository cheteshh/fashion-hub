"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bell, Trash2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { getProducts, formatINR, type Product } from "@/lib/api";

interface Alert {
  id: string;
  product: Product;
  targetPrice: number;
  currentPrice: number;
  status: "active" | "triggered";
  createdAt: string;
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Generate some mock alerts from the products data
    getProducts({ limit: "3" }).then(data => {
      const mockAlerts: Alert[] = data.products.slice(0, 3).map((p, i) => {
        const currentP = p.platforms[0]?.currentPrice || p.basePrice;
        return {
          id: `alert-${i}`,
          product: p,
          targetPrice: Math.floor(currentP * 0.8), // 20% off target
          currentPrice: currentP,
          status: i === 0 ? "triggered" : "active",
          createdAt: new Date().toISOString(),
        };
      });
      setAlerts(mockAlerts);
      setLoading(false);
    });
  }, []);

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg-primary)" }}>
      {/* Header */}
      <div className="py-12 px-4" style={{ background: "linear-gradient(180deg, rgba(245,158,11,0.05) 0%, transparent 100%)" }}>
        <div className="max-w-[1000px] mx-auto flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20"
               style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.2), rgba(239,68,68,0.2))", border: "1px solid rgba(245,158,11,0.3)" }}>
            <Bell className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Price Alerts</h1>
            <p className="text-[14px] text-white/50 mt-1">We'll notify you when prices hit your target.</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1000px] mx-auto px-4 mt-8">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => <div key={i} className="shimmer h-24 rounded-2xl" />)}
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-24 glass-card rounded-3xl">
            <Bell className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white/80">No active alerts</h2>
            <p className="text-white/40 text-[14px] mt-2 mb-6">Set up price alerts from any product page.</p>
            <Link href="/products" className="px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                  style={{ background: "linear-gradient(135deg, var(--brand-from), var(--brand-to))" }}>
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert, i) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-4 rounded-2xl transition-all hover:bg-white/[0.02]"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
              >
                <Link href={`/products/${alert.product.id}`} className="shrink-0 bg-[#1e1e28] rounded-xl overflow-hidden w-20 h-20">
                  <img src={alert.product.primaryImageUrl} alt="" className="w-full h-full object-cover" />
                </Link>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {alert.status === "triggered" ? (
                      <span className="badge-deal text-[9px] bg-green-500/20 text-green-400 border border-green-500/30">🎯 TARGET REACHED</span>
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Tracking
                      </span>
                    )}
                  </div>
                  <Link href={`/products/${alert.product.id}`} className="text-[15px] font-semibold text-white truncate block hover:text-purple-300 transition-colors">
                    {alert.product.unifiedTitle}
                  </Link>
                  <p className="text-[12px] text-white/40 mt-1">
                    Target: <span className="text-white font-medium">{formatINR(alert.targetPrice)}</span> • Current best: {formatINR(alert.currentPrice)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link href={`/products/${alert.product.id}`} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors tooltip" aria-label="View Product">
                    <ArrowUpRight className="w-5 h-5 text-white/70" />
                  </Link>
                  <button onClick={() => removeAlert(alert.id)} className="w-10 h-10 rounded-xl flex items-center justify-center hover:bg-red-500/10 hover:text-red-400 transition-colors text-white/40">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
