"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, Zap, TrendingDown, ChevronRight, Star, ExternalLink } from "lucide-react";
import { getDeals, formatINR, PLATFORM_META, type DealProduct } from "@/lib/api";

export default function DealsPage() {
  const [deals, setDeals] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "myntra" | "amazon" | "flipkart" | "ajio" | "tatacliq">("all");

  useEffect(() => {
    getDeals().then(d => { setDeals(d); setLoading(false); });
  }, []);

  const filtered = filter === "all" ? deals : deals.filter(d => d.platformDomain === filter);

  return (
    <div className="min-h-screen pb-24">
      {/* Hero */}
      <div className="py-16 px-4 text-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(239,68,68,0.08) 100%)" }}>
        <div className="absolute inset-0 opacity-20" style={{ background: "radial-gradient(ellipse at center top, rgba(245,158,11,0.3), transparent 70%)" }} />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-[12px] font-bold"
            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)", color: "#f59e0b" }}>
            <Zap className="w-3.5 h-3.5" />
            LIMITED TIME DEALS
          </div>
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Today's <span style={{ color: "#f59e0b" }}>Biggest</span> Price Drops
          </h1>
          <p className="text-white/50 text-[15px]">
            {loading ? "Loading..." : `${deals.length} products with verified price drops across all platforms`}
          </p>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-8">
        {/* Platform filter tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {(["all", "myntra", "amazon", "flipkart", "ajio", "tatacliq"] as const).map(p => {
            const meta = p !== "all" ? PLATFORM_META[p] : null;
            const isActive = filter === p;
            return (
              <button
                key={p}
                onClick={() => setFilter(p)}
                className="px-4 py-2 rounded-full text-[12px] font-semibold transition-all hover:scale-105"
                style={{
                  background: isActive
                    ? meta ? meta.bgColor : "rgba(255,255,255,0.1)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${isActive ? (meta?.color || "rgba(255,255,255,0.3)") + "60" : "rgba(255,255,255,0.08)"}`,
                  color: isActive ? (meta?.color || "white") : "rgba(255,255,255,0.45)",
                  boxShadow: isActive && meta ? `0 0 12px ${meta.color}30` : "none",
                }}
              >
                {p === "all" ? "All Platforms" : meta?.label}
              </button>
            );
          })}
        </div>

        {/* Deals grid */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="shimmer rounded-2xl h-28" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold text-white/50">No deals on this platform right now</h3>
            <p className="text-white/30 text-sm mt-2">Check back in a few minutes as prices update live</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((deal, i) => {
              const meta = PLATFORM_META[deal.platformDomain];
              const savings = deal.originalPrice ? deal.originalPrice - deal.currentPrice : 0;

              return (
                <motion.div
                  key={deal.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link href={`/products/${deal.product.id}`} className="group block">
                    <div className="card p-4 flex gap-4">
                      {/* Image */}
                      <div className="w-24 h-28 rounded-xl overflow-hidden flex-shrink-0 bg-[#1e1e28]">
                        <img
                          src={deal.product.primaryImageUrl}
                          alt={deal.product.unifiedTitle}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold text-white/40 uppercase tracking-wider">{deal.product.unifiedBrand}</span>
                            {deal.product.globalAverageRating > 0 && (
                              <span className="flex items-center gap-1 text-[10px] text-amber-400">
                                <Star className="w-3 h-3 fill-amber-400" />
                                {deal.product.globalAverageRating.toFixed(1)}
                              </span>
                            )}
                          </div>
                          <p className="text-[14px] text-white/85 font-semibold line-clamp-2 leading-snug">
                            {deal.product.unifiedTitle}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-lg font-bold text-white">{formatINR(deal.currentPrice)}</span>
                            {deal.originalPrice && (
                              <span className="text-[12px] text-white/30 line-through">{formatINR(deal.originalPrice)}</span>
                            )}
                            <span className="badge-deal flex items-center gap-1 text-[10px]">
                              <TrendingDown className="w-2.5 h-2.5" />
                              {deal.discountPct}% OFF
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            {meta && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: meta.bgColor, color: meta.color }}>
                                {meta.label}
                              </span>
                            )}
                            {savings > 0 && (
                              <span className="text-[11px] text-green-400 font-medium">Save {formatINR(savings)}</span>
                            )}
                          </div>
                          <a
                            href={deal.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors"
                          >
                            Buy now <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
