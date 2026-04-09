import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ArrowUpDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import FilterSidebar from "@/components/FilterSidebar";
import Pagination from "@/components/Pagination";
import { useProducts } from "@/hooks/useProducts";
import { useFilters } from "@/hooks/useFilters";

const PAGE_SIZE = 24;

const SORT_OPTIONS = [
  { label: "Relevance", value: "relevance" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Rating", value: "rating" },
  { label: "Most Reviewed", value: "reviews" },
];

const ProductSkeleton = () => (
  <div className="animate-pulse overflow-hidden rounded-xl border bg-card">
    <div className="aspect-[4/5] bg-secondary" />
    <div className="p-4 space-y-2">
      <div className="h-3 w-1/3 rounded bg-secondary" />
      <div className="h-4 w-2/3 rounded bg-secondary" />
      <div className="h-3 w-1/2 rounded bg-secondary" />
      <div className="mt-3 h-8 rounded-lg bg-secondary" />
      <div className="mt-2 flex gap-2">
        <div className="h-8 flex-1 rounded-full bg-secondary" />
        <div className="h-8 flex-1 rounded-full bg-secondary" />
      </div>
    </div>
  </div>
);

const SearchResults = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const query = params.get("q") || "";
  const categoryParam = params.get("cat") || "";
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);

  const { products, loading, error } = useProducts();

  const {
    filters, filtered, availableCategories, availableBrands, availableGenders,
    globalMin, globalMax, updateFilter, toggleArrayFilter, resetFilters,
  } = useFilters(products);

  // Sync URL params into filters/query
  useEffect(() => {
    if (query) updateFilter("query", query);
    if (categoryParam) updateFilter("categories", [categoryParam]);
  }, [query, categoryParam]);

  // Apply URL query on top of panel filters
  const searchFiltered = useMemo(() => {
    if (!query && !categoryParam) return filtered;
    return filtered.filter((p) => {
      const q = query.toLowerCase();
      const matchesQ = !q ||
        p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) ||
        (p.gender?.toLowerCase().includes(q) ?? false);
      const matchesCat = !categoryParam || p.category === categoryParam;
      return matchesQ && matchesCat;
    });
  }, [filtered, query, categoryParam]);

  // Sort
  const sorted = useMemo(() => {
    const arr = [...searchFiltered];
    if (sortBy === "price_asc") arr.sort((a, b) => Math.min(...Object.values(a.prices)) - Math.min(...Object.values(b.prices)));
    else if (sortBy === "price_desc") arr.sort((a, b) => Math.min(...Object.values(b.prices)) - Math.min(...Object.values(a.prices)));
    else if (sortBy === "rating") arr.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    else if (sortBy === "reviews") arr.sort((a, b) => (b.reviews ?? 0) - (a.reviews ?? 0));
    return arr;
  }, [searchFiltered, sortBy]);

  // Reset page when filters/sort change
  useEffect(() => { setCurrentPage(1); }, [sorted.length, sortBy]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = sorted.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const hasActiveFilters =
    filters.categories.length > 0 || filters.brands.length > 0 ||
    filters.genders.length > 0 ||
    filters.priceMin > globalMin || filters.priceMax < globalMax;

  const activeFilterCount = filters.categories.length + filters.brands.length + filters.genders.length;

  const title = query
    ? `Results for "${query}"`
    : categoryParam
    ? categoryParam
    : "All Products";

  return (
    <div className="mx-auto min-h-[60vh] max-w-7xl px-4 py-10 md:px-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">{title}</h1>
          <p className="mt-1 text-muted-foreground">
            {loading ? "Loading..." : `${sorted.length} products found`}
            {hasActiveFilters && !loading && (
              <button onClick={resetFilters} className="ml-3 inline-flex items-center gap-1 text-xs text-accent hover:underline">
                <X className="h-3 w-3" /> Clear filters
              </button>
            )}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Sort */}
          <div className="relative flex items-center gap-2 rounded-full border bg-secondary px-4 py-2 text-sm">
            <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-sm font-medium outline-none cursor-pointer"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Mobile filter toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 rounded-full border bg-secondary px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80 lg:hidden"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="rounded-full bg-accent px-1.5 text-[10px] text-accent-foreground">{activeFilterCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <div className={`${showFilters ? "block" : "hidden"} lg:block`}>
          <FilterSidebar
            filters={filters}
            availableCategories={availableCategories}
            availableBrands={availableBrands}
            availableGenders={availableGenders}
            globalMin={globalMin}
            globalMax={globalMax}
            onToggleCategory={(c) => toggleArrayFilter("categories", c)}
            onToggleBrand={(b) => toggleArrayFilter("brands", b)}
            onToggleGender={(g) => toggleArrayFilter("genders", g)}
            onPriceChange={(min, max) => { updateFilter("priceMin", min); updateFilter("priceMax", max); }}
            onReset={resetFilters}
          />
        </div>

        {/* Products */}
        <div className="flex-1">
          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
              Failed to load products: {error}
            </div>
          )}
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : paginated.length > 0 ? (
            <>
              <motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paginated.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} />
                ))}
              </motion.div>
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={(p) => { setCurrentPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
              <p className="mt-4 text-center text-xs text-muted-foreground">
                Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, sorted.length)} of {sorted.length} products
              </p>
            </>
          ) : (
            <div className="mt-20 text-center text-muted-foreground">
              <p className="text-lg">No products found.</p>
              <button onClick={() => { resetFilters(); navigate("/search"); }} className="mt-3 text-sm text-accent hover:underline">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;
