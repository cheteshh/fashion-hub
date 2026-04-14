"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { SlidersHorizontal, Grid3X3, List, ArrowUpDown, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import FilterSidebar from "@/components/filter-sidebar";
import ProductCard from "@/components/product-card";
import { getProducts } from "@/lib/api";
import { useEffect } from "react";
import type { Product, PaginatedProducts } from "@/lib/api";

const SORT_OPTIONS = [
  { value: "createdAt", label: "Newest First" },
  { value: "rating", label: "Highest Rated" },
  { value: "reviews", label: "Most Reviewed" },
];

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [data, setData] = useState<PaginatedProducts | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const sort = searchParams.get("sort") || "createdAt";
  const page = searchParams.get("page") || "1";

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    searchParams.forEach((v, k) => { params[k] = v; });
    getProducts(params).then((d) => { setData(d); setLoading(false); });
  }, [searchParams.toString()]);

  const setSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", value);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const setPage = (p: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(p));
    router.push(`/products?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Active filter chips
  const activeFilters: { key: string; value: string; label: string }[] = [];
  const filterMap: Record<string, string> = {
    category: "Category", brand: "Brand", gender: "Gender", platform: "Platform",
  };
  searchParams.forEach((v, k) => {
    if (filterMap[k]) activeFilters.push({ key: k, value: v, label: `${filterMap[k]}: ${v}` });
    if (k === "minPrice") activeFilters.push({ key: "price", value: v, label: `Min: ₹${Number(v).toLocaleString("en-IN")}` });
  });

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "price") { params.delete("minPrice"); params.delete("maxPrice"); }
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 pt-8 pb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              {searchParams.get("category") || searchParams.get("brand") || "All Products"}
            </h1>
            <p className="text-[13px] text-white/40 mt-1">
              {loading ? "Loading..." : `${data?.total?.toLocaleString("en-IN") ?? 0} products found`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Sort */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] text-white/70" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <ArrowUpDown className="w-4 h-4 text-white/40" />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="bg-transparent outline-none text-white/80 cursor-pointer text-[13px]"
              >
                {SORT_OPTIONS.map(o => (
                  <option key={o.value} value={o.value} className="bg-[#111]">{o.label}</option>
                ))}
              </select>
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>
              <button onClick={() => setViewMode("grid")} className={`p-2 rounded-lg transition-all ${viewMode === "grid" ? "bg-purple-600/30 text-purple-300" : "text-white/40 hover:text-white/70"}`}>
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button onClick={() => setViewMode("list")} className={`p-2 rounded-lg transition-all ${viewMode === "list" ? "bg-purple-600/30 text-purple-300" : "text-white/40 hover:text-white/70"}`}>
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile filter */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium text-white/70 transition-all"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {activeFilters.length > 0 && <span className="w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ background: "var(--brand-from)" }}>{activeFilters.length}</span>}
            </button>
          </div>
        </div>

        {/* Active filter chips */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {activeFilters.map(f => (
              <button
                key={f.key}
                onClick={() => removeFilter(f.key)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium text-purple-300 transition-all hover:bg-red-500/10 hover:text-red-400"
                style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(168,85,247,0.3)" }}
              >
                {f.label}
                <X className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Layout */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] overflow-y-auto hide-scrollbar">
          <FilterSidebar />
        </aside>

        {/* Products grid */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"}`}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="shimmer rounded-2xl aspect-[3/4]" />
              ))}
            </div>
          ) : !data || data.products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-white/60 mb-2">No products found</h3>
              <p className="text-white/30 text-[14px] mb-6">Try adjusting your filters or searching for something else</p>
              <button onClick={() => router.push("/products")} className="px-6 py-2.5 rounded-xl text-[13px] font-semibold text-white" style={{ background: "linear-gradient(135deg, var(--brand-from), var(--brand-to))" }}>
                Clear filters
              </button>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 ${viewMode === "grid" ? "grid-cols-2 sm:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 max-w-2xl"}`}>
                {data.products.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  {Array.from({ length: Math.min(data.totalPages, 7) }).map((_, i) => {
                    const p = i + 1;
                    const isActive = p === data.page;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-xl text-[13px] font-semibold transition-all ${isActive ? "text-white scale-110" : "text-white/40 hover:text-white/80 hover:bg-white/5"}`}
                        style={isActive ? { background: "linear-gradient(135deg, var(--brand-from), var(--brand-to))" } : {}}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile filter drawer */}
      <AnimatePresence>
        {isMobileFilterOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={() => setIsMobileFilterOpen(false)} />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 z-50 overflow-y-auto p-6 hide-scrollbar"
              style={{ background: "var(--bg-secondary)", borderRight: "1px solid var(--border)" }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold text-white">Filters</span>
                <button onClick={() => setIsMobileFilterOpen(false)}>
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              <FilterSidebar onClose={() => setIsMobileFilterOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
