"use client";

import { use, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, ShoppingBag, Bell, Heart, Share2, ChevronLeft, Check, Tag, Shield, RefreshCw } from "lucide-react";
import Link from "next/link";
import {
  getProductById, formatINR, getCheapestPlatform,
  getDiscountPercent, PLATFORM_META, setAlert, type Product
} from "@/lib/api";
import PriceChart from "@/components/price-chart";
import PriceComparison from "@/components/price-comparison";

interface AlertFormState {
  open: boolean;
  email: string;
  price: string;
  sent: boolean;
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [alertForm, setAlertForm] = useState<AlertFormState>({ open: false, email: "", price: "", sent: false });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getProductById(id).then((p) => { setProduct(p); setLoading(false); });
  }, [id]);

  const handleSetAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    await setAlert(product.id, parseFloat(alertForm.price), alertForm.email);
    setAlertForm(prev => ({ ...prev, sent: true }));
    setTimeout(() => setAlertForm({ open: false, email: "", price: "", sent: false }), 3000);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen max-w-[1400px] mx-auto px-4 md:px-8 pt-8 grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
        <div className="shimmer rounded-2xl aspect-[3/4]" />
        <div className="space-y-4 pt-8">
          <div className="shimmer h-4 rounded w-1/3" />
          <div className="shimmer h-8 rounded w-full" />
          <div className="shimmer h-6 rounded w-1/4" />
          <div className="shimmer h-64 rounded" />
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <div className="text-6xl mb-4">😕</div>
        <h2 className="text-xl font-semibold text-white/70 mb-2">Product not found</h2>
        <Link href="/products" className="text-purple-400 hover:text-purple-300 text-[14px] mt-2 flex items-center gap-1">
          <ChevronLeft className="w-4 h-4" /> Back to products
        </Link>
      </div>
    );
  }

  const cheapest = getCheapestPlatform(product.platforms);
  const discount = cheapest ? getDiscountPercent(cheapest.originalPrice, cheapest.currentPrice) : 0;
  const allTimeLowest = cheapest?.lowestEverPrice ?? cheapest?.currentPrice ?? 0;
  const reviewsFormatted = product.totalReviews > 1000
    ? `${(product.totalReviews / 1000).toFixed(1)}k`
    : product.totalReviews.toString();

  return (
    <div className="min-h-screen pb-24" style={{ background: "var(--bg-primary)" }}>
      {/* Breadcrumb */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6 pb-2 flex items-center gap-2 text-[12px] text-white/30">
        <Link href="/" className="hover:text-white/60 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-white/60 transition-colors">Products</Link>
        <span>/</span>
        <Link href={`/products?category=${product.category}`} className="hover:text-white/60 transition-colors">{product.category}</Link>
        <span>/</span>
        <span className="text-white/50 truncate max-w-[200px]">{product.unifiedTitle}</span>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-4 grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* ── LEFT: Image ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          <div className="sticky top-20">
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-[#1e1e28]">
              <img
                src={product.primaryImageUrl}
                alt={product.unifiedTitle}
                className="w-full h-full object-cover"
              />
              {/* Discount badge */}
              {discount > 0 && (
                <div className="absolute top-4 left-4">
                  <span className="badge-deal text-sm px-4 py-1.5 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    {discount}% OFF
                  </span>
                </div>
              )}
              {/* Wishlist + Share floating buttons */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button
                  onClick={() => setIsWishlisted(!isWishlisted)}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                  style={{ background: "rgba(22,22,30,0.8)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "text-red-400 fill-red-400" : "text-white/70"}`} />
                </button>
                <button
                  onClick={handleShare}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-lg"
                  style={{ background: "rgba(22,22,30,0.8)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  {copied ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4 text-white/70" />}
                </button>
              </div>
            </div>

            {/* Platform thumbnails */}
            <div className="mt-4 flex gap-2 flex-wrap">
              {product.platforms.map(p => {
                const meta = PLATFORM_META[p.platformDomain];
                return (
                  <div
                    key={p.id}
                    className="flex-1 min-w-[60px] py-2 px-3 rounded-xl text-center text-[11px] font-semibold"
                    style={{ background: meta?.bgColor || "rgba(255,255,255,0.05)", color: meta?.color || "rgba(255,255,255,0.5)" }}
                  >
                    <div className="text-base font-bold">{meta?.logo}</div>
                    <div>{formatINR(p.currentPrice)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>

        {/* ── RIGHT: Product Info ──────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6"
        >
          {/* Brand + Category */}
          <div className="flex items-center gap-3">
            <Link
              href={`/products?brand=${encodeURIComponent(product.unifiedBrand)}`}
              className="text-[12px] font-bold uppercase tracking-widest transition-colors hover:text-purple-300"
              style={{ color: "var(--brand-mid)" }}
            >
              {product.unifiedBrand}
            </Link>
            <span className="text-white/20">·</span>
            <Link
              href={`/products?category=${encodeURIComponent(product.category)}`}
              className="text-[12px] text-white/40 hover:text-white/70 transition-colors"
            >
              {product.category}
            </Link>
            {product.gender && product.gender !== "Unisex" && (
              <>
                <span className="text-white/20">·</span>
                <span className="text-[12px] text-white/40">{product.gender}</span>
              </>
            )}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {product.unifiedTitle}
          </h1>

          {/* Rating */}
          {product.globalAverageRating > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl" style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-[14px] font-bold text-amber-400">{product.globalAverageRating.toFixed(1)}</span>
              </div>
              <span className="text-[13px] text-white/40">{reviewsFormatted} reviews across all platforms</span>
            </div>
          )}

          {/* Price hero */}
          {cheapest && (
            <div className="p-5 rounded-2xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <p className="text-[11px] text-white/40 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                <RefreshCw className="w-3 h-3" />
                Live Best Price
              </p>
              <div className="flex items-baseline gap-4 mb-3">
                <span className="text-4xl font-bold text-white">{formatINR(cheapest.currentPrice)}</span>
                {cheapest.originalPrice && cheapest.originalPrice > cheapest.currentPrice && (
                  <span className="text-lg text-white/30 line-through">{formatINR(cheapest.originalPrice)}</span>
                )}
                {discount > 0 && (
                  <span className="badge-deal text-[11px] px-3 py-1">{discount}% OFF</span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-[12px]">
                <div className="flex items-center gap-2 text-white/50">
                  <Shield className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  All-time low: <span className="text-green-400 font-semibold ml-1">{formatINR(allTimeLowest)}</span>
                </div>
                <div className="flex items-center gap-2 text-white/50">
                  <Tag className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  Best on: <span className="font-semibold ml-1" style={{ color: PLATFORM_META[cheapest.platformDomain]?.color }}>{PLATFORM_META[cheapest.platformDomain]?.label}</span>
                </div>
              </div>
            </div>
          )}

          {/* CTA buttons */}
          <div className="flex gap-3">
            {cheapest?.inStock ? (
              <a
                href={cheapest.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-bold text-white transition-all hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]"
                style={{ background: "linear-gradient(135deg, var(--brand-from), var(--brand-to))" }}
              >
                <ShoppingBag className="w-4 h-4" />
                Buy at Best Price
              </a>
            ) : (
              <div className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl text-[14px] font-medium text-white/40 cursor-not-allowed" style={{ background: "rgba(255,255,255,0.05)" }}>
                Out of Stock on Best Platform
              </div>
            )}
            <button
              onClick={() => setAlertForm(prev => ({ ...prev, open: true }))}
              className="flex items-center gap-2 px-5 py-3.5 rounded-2xl text-[14px] font-semibold text-amber-400 transition-all hover:bg-amber-400/10 hover:scale-[1.02]"
              style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}
            >
              <Bell className="w-4 h-4" />
              Alert
            </button>
          </div>

          {/* Color tag */}
          {product.color && (
            <div className="flex items-center gap-2 text-[13px] text-white/40">
              <span>Color:</span>
              <span className="text-white/70 font-medium">{product.color}</span>
            </div>
          )}

          {/* Price Comparison */}
          <PriceComparison platforms={product.platforms} />

          {/* Price History Chart */}
          <div>
            <h2 className="text-[15px] font-semibold text-white/80 mb-4 flex items-center gap-2">
              📈 Price History
              <span className="text-[11px] text-white/30 font-normal">Last 6 months</span>
            </h2>
            <PriceChart platforms={product.platforms} />
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            {[
              { icon: RefreshCw, label: "Updated every", sub: "15 minutes" },
              { icon: Shield, label: "Price alert", sub: "via email" },
              { icon: Star, label: "Real ratings", sub: "from platforms" },
            ].map(badge => (
              <div key={badge.label} className="p-3 rounded-xl text-[11px]" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
                <badge.icon className="w-4 h-4 text-purple-400 mx-auto mb-1.5" />
                <p className="text-white/40">{badge.label}</p>
                <p className="text-white/70 font-semibold">{badge.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Price Alert Modal ──────────────────────────────────── */}
      {alertForm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md rounded-2xl p-6 shadow-2xl"
            style={{ background: "var(--bg-secondary)", border: "1px solid rgba(168,85,247,0.3)" }}
          >
            {alertForm.sent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)" }}>
                  <Check className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Alert Set! 🎉</h3>
                <p className="text-white/50 text-[14px]">We'll email you when the price drops to your target.</p>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)" }}>
                    <Bell className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold text-white">Set Price Alert</h3>
                    <p className="text-[12px] text-white/40 mt-0.5">Get notified when price drops</p>
                  </div>
                </div>

                <div className="p-3 rounded-xl mb-5 flex items-center gap-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}>
                  <img src={product.primaryImageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-[12px] text-white/80 font-medium line-clamp-1">{product.unifiedTitle}</p>
                    <p className="text-[11px] text-white/40">Current best: <span className="text-white font-semibold">{cheapest && formatINR(cheapest.currentPrice)}</span></p>
                  </div>
                </div>

                <form onSubmit={handleSetAlert} className="space-y-4">
                  <div>
                    <label className="text-[12px] text-white/50 mb-1.5 block">Your Email</label>
                    <input
                      type="email"
                      required
                      placeholder="you@example.com"
                      value={alertForm.email}
                      onChange={e => setAlertForm(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div>
                    <label className="text-[12px] text-white/50 mb-1.5 block">Target Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder={`e.g. ${cheapest ? Math.floor(cheapest.currentPrice * 0.9) : 999}`}
                      value={alertForm.price}
                      onChange={e => setAlertForm(prev => ({ ...prev, price: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl text-[14px] text-white placeholder:text-white/25 outline-none transition-all focus:ring-2 focus:ring-purple-500/50"
                      style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}
                    />
                  </div>
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setAlertForm({ open: false, email: "", price: "", sent: false })}
                      className="flex-1 py-3 rounded-xl text-[14px] font-medium text-white/60 hover:bg-white/5 transition-all"
                      style={{ border: "1px solid var(--border)" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-xl text-[14px] font-bold text-white transition-all hover:opacity-90"
                      style={{ background: "linear-gradient(135deg, var(--brand-from), var(--brand-to))" }}
                    >
                      Set Alert
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
