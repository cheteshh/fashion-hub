"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Search, TrendingUp, Tag, ChevronRight, Star, Zap,
  ArrowRight, ShoppingBag, BarChart2, Bell
} from "lucide-react";
import { getTrendingProducts, getDeals, formatINR, getCheapestPlatform, getDiscountPercent, PLATFORM_META, type Product, type DealProduct } from "@/lib/api";

// Animated counter
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const duration = 1500;
    const target = value;
    let start: number | null = null;
    const step = (ts: number) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    const raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span>{prefix}{displayed.toLocaleString("en-IN")}{suffix}</span>;
}

const CATEGORIES = [
  { name: "Sneakers", icon: "👟", href: "/products?category=Sneakers", count: "50+ products" },
  { name: "T-Shirts", icon: "👕", href: "/products?category=T-Shirts", count: "120+ products" },
  { name: "Jeans", icon: "👖", href: "/products?category=Jeans", count: "80+ products" },
  { name: "Dresses", icon: "👗", href: "/products?category=Dresses", count: "60+ products" },
  { name: "Jackets", icon: "🧥", href: "/products?category=Jackets", count: "40+ products" },
  { name: "Ethnic", icon: "🪬", href: "/products?category=Ethnic", count: "90+ products" },
  { name: "Hoodies", icon: "🧣", href: "/products?category=Hoodies", count: "35+ products" },
  { name: "Accessories", icon: "👜", href: "/products?category=Accessories", count: "70+ products" },
];

const BRANDS = [
  { name: "Nike", color: "#f97316" },
  { name: "Adidas", color: "#3b82f6" },
  { name: "Levi's", color: "#ef4444" },
  { name: "Zara", color: "#a855f7" },
  { name: "H&M", color: "#ec4899" },
  { name: "Mango", color: "#f59e0b" },
  { name: "Puma", color: "#10b981" },
  { name: "Ralph Lauren", color: "#6366f1" },
];

const HOW_IT_WORKS = [
  { icon: Search, title: "Search a Product", desc: "Find any fashion item — sneakers, jeans, kurtas, bags." },
  { icon: BarChart2, title: "Compare Prices", desc: "We show you prices across Myntra, Amazon, Flipkart, Ajio & Tata CLiQ." },
  { icon: Bell, title: "Set a Price Alert", desc: "Tell us your target price. We notify you when it drops." },
  { icon: ShoppingBag, title: "Buy at Best Price", desc: "Click through to the cheapest platform and save instantly." },
];

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [trending, setTrending] = useState<Product[]>([]);
  const [deals, setDeals] = useState<DealProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getTrendingProducts(), getDeals()]).then(([t, d]) => {
      setTrending(t);
      setDeals(d);
      setLoading(false);
    });
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="hero-bg min-h-[88vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
        {/* Radial glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[120px] opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--brand-from), transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full blur-[100px] opacity-15 pointer-events-none"
          style={{ background: 'radial-gradient(circle, var(--brand-to), transparent)' }} />

        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-4xl mx-auto z-10"
        >
          {/* Label */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8 text-[12px] font-semibold tracking-wider"
            style={{ background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', color: '#c084fc' }}
          >
            <Zap className="w-3.5 h-3.5" />
            INDIA'S SMARTEST PRICE TRACKER
          </motion.div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
            <span className="text-white">Find it cheaper.</span>
            <br />
            <span className="gradient-brand-text">Buy it smarter.</span>
          </h1>

          <p className="text-lg text-white/50 mb-12 max-w-2xl mx-auto font-light leading-relaxed">
            Compare prices across Myntra, Amazon, Flipkart, Ajio & Tata CLiQ in real-time.
            Track price drops, set alerts, and never overpay for fashion again.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-8">
            <div
              className={`flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 ${
                isFocused ? "shadow-[0_0_0_2px_rgba(124,58,237,0.6),0_20px_60px_rgba(0,0,0,0.4)]" : "shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
              }`}
              style={{ background: 'rgba(22,22,30,0.9)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Search className={`w-5 h-5 flex-shrink-0 transition-colors ${isFocused ? "text-purple-400" : "text-white/30"}`} />
              <input
                type="text"
                placeholder={`Try "Nike Air Force 1" or "Levi\u2019s Jeans"`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="flex-1 bg-transparent text-white text-[15px] placeholder:text-white/25 outline-none"
              />
              <button
                type="submit"
                className="flex-shrink-0 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:scale-105 active:scale-95"
                style={{ background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' }}
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick tags */}
          <div className="flex flex-wrap gap-2 justify-center">
            {["Nike Air Force 1", "Levi's 511 Jeans", "Adidas Ultraboost", "Zara Dress", "H&M Hoodie"].map(tag => (
              <button
                key={tag}
                onClick={() => router.push(`/search?q=${encodeURIComponent(tag)}`)}
                className="px-3 py-1.5 rounded-full text-[12px] text-white/50 hover:text-white/80 transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="absolute bottom-12 flex flex-wrap gap-8 md:gap-16 justify-center"
        >
          {[
            { label: "Products Tracked", value: 1200, suffix: "+" },
            { label: "Price History Points", value: 500000, prefix: "", suffix: "+" },
            { label: "Platforms Monitored", value: 5 },
            { label: "Price Alerts Sent", value: 10000, suffix: "+" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold gradient-brand-text">
                <AnimatedNumber value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </p>
              <p className="text-[11px] text-white/35 mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* ── HOT DEALS ─────────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Tag className="w-4 h-4 text-amber-400" />
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-widest">Hot Deals</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Biggest Price Drops Today</h2>
          </div>
          <Link href="/deals" className="hidden md:flex items-center gap-2 text-[13px] text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            See all deals <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="shimmer rounded-2xl h-32" />
            ))
          ) : deals.slice(0, 6).map((deal, i) => {
            const meta = PLATFORM_META[deal.platformDomain];
            return (
              <motion.div
                key={deal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
              >
                <Link href={`/products/${deal.product.id}`} className="group block">
                  <div className="card p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-[#1e1e28]">
                      <img
                        src={deal.product.primaryImageUrl}
                        alt={deal.product.unifiedTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-white/40 font-semibold uppercase tracking-wider mb-1">{deal.product.unifiedBrand}</p>
                      <p className="text-[13px] text-white/80 font-medium line-clamp-2 leading-snug mb-2">{deal.product.unifiedTitle}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-bold text-white">{formatINR(deal.currentPrice)}</span>
                        <span className="badge-deal">{deal.discountPct}% OFF</span>
                        {meta && (
                          <span className="text-[10px] font-semibold" style={{ color: meta.color }}>{meta.label}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-6 text-center md:hidden">
          <Link href="/deals" className="inline-flex items-center gap-2 text-[13px] text-purple-400 font-semibold">
            See all deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── CATEGORIES ────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-3">Browse by Category</p>
            <h2 className="text-2xl md:text-3xl font-bold text-white">What are you looking for?</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={cat.href} className="group flex flex-col items-center gap-3 p-4 rounded-2xl text-center transition-all hover:shadow-lg hover:-translate-y-1" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{cat.icon}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-white/80 group-hover:text-white transition-colors">{cat.name}</p>
                    <p className="text-[10px] text-white/30 mt-0.5">{cat.count}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING PRODUCTS ─────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-20">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-[11px] font-bold text-purple-400 uppercase tracking-widest">Trending Now</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-white">Most Loved Products</h2>
          </div>
          <Link href="/products?sort=rating" className="hidden md:flex items-center gap-2 text-[13px] text-purple-400 hover:text-purple-300 font-semibold transition-colors">
            View all <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {loading ? (
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="shimmer rounded-2xl aspect-[3/4]" />
            ))
          ) : trending.slice(0, 12).map((product, i) => {
            const cheapest = getCheapestPlatform(product.platforms);
            const discount = cheapest ? getDiscountPercent(cheapest.originalPrice, cheapest.currentPrice) : 0;
            const meta = cheapest ? PLATFORM_META[cheapest.platformDomain] : null;

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link href={`/products/${product.id}`} className="group block">
                  <div className="card overflow-hidden">
                    <div className="relative aspect-[3/4] bg-[#1e1e28] overflow-hidden">
                      <img
                        src={product.primaryImageUrl}
                        alt={product.unifiedTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-90 group-hover:opacity-100"
                      />
                      {discount > 0 && (
                        <div className="absolute top-2 left-2">
                          <span className="badge-deal text-[9px]">{discount}% OFF</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold mb-1">{product.unifiedBrand}</p>
                      <p className="text-[12px] text-white/80 font-medium line-clamp-2 leading-snug mb-2">{product.unifiedTitle}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-white">
                          {cheapest ? formatINR(cheapest.currentPrice) : "–"}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-amber-400">
                          <Star className="w-2.5 h-2.5 fill-amber-400" />
                          {product.globalAverageRating.toFixed(1)}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ── BRANDS ────────────────────────────────────────────────── */}
      <section className="py-16" style={{ background: 'rgba(255,255,255,0.015)' }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <p className="text-center text-[11px] font-bold text-white/30 uppercase tracking-widest mb-8">Top Brands We Track</p>
          <div className="flex flex-wrap gap-3 justify-center">
            {BRANDS.map((brand, i) => (
              <motion.div
                key={brand.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={`/products?brand=${encodeURIComponent(brand.name)}`}
                  className="px-5 py-2.5 rounded-full text-[13px] font-semibold transition-all hover:scale-105 hover:shadow-lg"
                  style={{
                    background: `${brand.color}15`,
                    border: `1px solid ${brand.color}40`,
                    color: brand.color,
                  }}
                >
                  {brand.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-4 md:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-3">How It Works</p>
          <h2 className="text-2xl md:text-3xl font-bold text-white">Start saving in 4 simple steps</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {HOW_IT_WORKS.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl relative"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div className="absolute -top-4 -left-2 w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold text-white"
                style={{ background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' }}>
                {i + 1}
              </div>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.2)' }}>
                <step.icon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-[15px] font-semibold text-white/90 mb-2">{step.title}</h3>
              <p className="text-[13px] text-white/45 leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center p-10 rounded-3xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(236,72,153,0.2))', border: '1px solid rgba(168,85,247,0.25)' }}
        >
          <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.3), transparent 70%)' }} />
          <div className="relative z-10">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to save on every purchase?</h2>
            <p className="text-white/50 mb-8 text-[15px]">Join thousands of smart shoppers tracking prices across India's top fashion platforms.</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl text-[14px] font-bold text-white transition-all hover:scale-105 hover:shadow-2xl active:scale-95"
              style={{ background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' }}
            >
              <ShoppingBag className="w-4 h-4" />
              Browse All Products
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t py-10" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 gradient-brand rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3 h-3 text-white" />
            </div>
            <span className="font-bold gradient-brand-text">FashionHub</span>
          </div>
          <p className="text-[12px] text-white/25 text-center">
            © 2026 FashionHub · Prices updated every 15 min · Affiliate links help us keep the lights on
          </p>
          <div className="flex gap-4 text-[12px] text-white/35">
            <Link href="/products" className="hover:text-white/60">Products</Link>
            <Link href="/deals" className="hover:text-white/60">Deals</Link>
            <Link href="/about" className="hover:text-white/60">About</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
