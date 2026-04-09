import { useState, useMemo } from "react";
import { Product } from "@/data/products";

export interface Filters {
  query: string;
  categories: string[];
  brands: string[];
  genders: string[];
  priceMin: number;
  priceMax: number;
}

export const DEFAULT_FILTERS: Filters = {
  query: "",
  categories: [],
  brands: [],
  genders: [],
  priceMin: 0,
  priceMax: 100000,
};

export const useFilters = (products: Product[]) => {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const availableCategories = useMemo(
    () => [...new Set(products.map((p) => p.category))].sort(),
    [products]
  );
  const availableBrands = useMemo(
    () => [...new Set(products.map((p) => p.brand))].sort(),
    [products]
  );
  const availableGenders = useMemo(
    () => [...new Set(products.map((p) => p.gender).filter(Boolean))].sort() as string[],
    [products]
  );

  const allPrices = useMemo(
    () => products.flatMap((p) => Object.values(p.prices)),
    [products]
  );
  const globalMin = allPrices.length ? Math.min(...allPrices) : 0;
  const globalMax = allPrices.length ? Math.max(...allPrices) : 100000;

  const filtered = useMemo(() => {
    const q = filters.query.toLowerCase();
    return products.filter((p) => {
      const lowest = Math.min(...Object.values(p.prices));
      const matchesQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.gender?.toLowerCase().includes(q) ?? false) ||
        p.sizes.some((s) => s.toLowerCase() === q);
      const matchesCategory =
        filters.categories.length === 0 || filters.categories.includes(p.category);
      const matchesBrand =
        filters.brands.length === 0 || filters.brands.includes(p.brand);
      const matchesGender =
        filters.genders.length === 0 ||
        !p.gender ||
        filters.genders.includes(p.gender) ||
        filters.genders.includes("Unisex");
      const matchesPrice = lowest >= filters.priceMin && lowest <= filters.priceMax;
      return matchesQuery && matchesCategory && matchesBrand && matchesGender && matchesPrice;
    });
  }, [products, filters]);

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  const toggleArrayFilter = (key: "categories" | "brands" | "genders", value: string) =>
    setFilters((prev) => {
      const arr = prev[key];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return {
    filters,
    filtered,
    availableCategories,
    availableBrands,
    availableGenders,
    globalMin,
    globalMax,
    updateFilter,
    toggleArrayFilter,
    resetFilters,
  };
};
