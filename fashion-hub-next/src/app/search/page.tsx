"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
import { searchProducts, type PaginatedProducts } from "@/lib/api";
import ProductCard from "@/components/product-card";

const QUICK_FILTERS: { label: string; params: Record<string, string> }[] = [
  { label: "Under ₹999", params: { maxPrice: "999" } },
  { label: "₹999–₹2,999", params: { minPrice: "999", maxPrice: "2999" } },
  { label: "Just Sneakers", params: { category: "Sneakers" } },
  { label: "Women's", params: { gender: "Women" } },
  { label: "Men's", params: { gender: "Men" } },
  { label: "On Myntra", params: { platform: "myntra" } },
  { label: "On Amazon", params: { platform: "amazon" } },
];

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";
  const [inputValue, setInputValue] = useState(q);
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(false);

  const doSearch = useCallback((query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    const params: Record<string, string> = {};
    searchParams.forEach((v, k) => { params[k] = v; });
    searchProducts(query, params).then(d => { setData(d); setLoading(false); });
  }, [searchParams.toString()]);

  useEffect(() => {
    setInputValue(q);
    doSearch(q);
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      router.push(`/search?q=${encodeURIComponent(inputValue.trim())}`);
    }
  };

  const applyQuickFilter = (params: Record<string, string>) => {
    const url = new URLSearchParams({ q, ...params });
    router.push(`/search?${url.toString()}`);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Search header */}
      <div className="py-12 px-4" style={{ background: "linear-gradient(180deg, rgba(124,58,237,0.07) 0%, transparent 100%)" }}>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSearch} className="relative">
            <div className="flex items-center gap-3 px-5 py-4 rounded-2xl shadow-xl"
              style={{ background: "rgba(22,22,30,0.95)", border: "1px solid rgba(168,85,247,0.3)" }}>
              <Search className="w-5 h-5 text-purple-400 flex-shrink-0" />
              <input
                type="text"
                autoFocus
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                placeholder='Search products, brands, styles...'
                className="flex-1 bg-transparent text-white text-[16px] placeholder:text-white/25 outline-none"
              />
              {inputValue && (
                <button type="button" onClick={() => { setInputValue(""); router.push("/search"); }}>
                  <X className="w-4 h-4 text-white/40 hover:text-white/70" />
                </button>
              )}
              <button type="submit" className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
                style={{ background: "linear-gradient(135deg, var(--brand-from), var(--brand-to))" }}>
                Search
              </button>
            </div>
          </form>

          {/* Quick filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            {QUICK_FILTERS.map(f => (
              <button
                key={f.label}
                onClick={() => applyQuickFilter(f.params)}
                className="px-3 py-1.5 rounded-full text-[12px] text-white/50 hover:text-white/80 transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-[1400px] mx-auto px-4 md:px-8">
        {!q && !loading && (
          <div className="text-center py-24">
            <div className="text-5xl mb-4">🔍</div>
            <h2 className="text-xl font-semibold text-white/50">Start searching to find great deals</h2>
            <p className="text-white/30 text-[14px] mt-2">Try "Nike shoes", "Zara dress", or "Levi's jeans"</p>
          </div>
        )}

        {q && (
          <>
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
              <div>
                {loading ? (
                  <div className="shimmer h-6 w-48 rounded" />
                ) : (
                  <h2 className="text-[15px] font-semibold text-white/70">
                    {data && data.total > 0
                      ? <><span className="text-white font-bold">{data.total}</span> results for "<span className="gradient-brand-text font-bold">{q}</span>"</>
                      : `No results for "${q}"`}
                  </h2>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="shimmer rounded-2xl aspect-[3/4]" />
                ))}
              </div>
            ) : !data || data.products.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">😞</div>
                <h3 className="text-lg font-semibold text-white/50 mb-2">No results found</h3>
                <p className="text-white/30 text-[14px]">Try different keywords or remove filters</p>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
              >
                {data.products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
