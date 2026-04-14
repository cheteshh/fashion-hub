"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["T-Shirts", "Shirts", "Hoodies", "Jackets", "Jeans", "Dresses", "Pants", "Ethnic", "Skirts", "Sneakers", "Accessories"];
const BRANDS = ["Nike", "Adidas", "Puma", "H&M", "Zara", "Mango", "Levi's", "GAP", "Ralph Lauren", "Tommy Hilfiger", "W", "Biba", "Manyavar", "New Balance"];
const PLATFORMS = ["myntra", "amazon", "flipkart", "ajio", "tatacliq"];
const GENDERS = ["Men", "Women", "Unisex"];
const PRICE_RANGES = [
  { label: "Under ₹999", min: "0", max: "999" },
  { label: "₹999 – ₹2,999", min: "999", max: "2999" },
  { label: "₹2,999 – ₹5,999", min: "2999", max: "5999" },
  { label: "₹5,999 – ₹9,999", min: "5999", max: "9999" },
  { label: "₹9,999+", min: "9999", max: "99999" },
];
const PLATFORM_META: Record<string, { label: string; color: string }> = {
  myntra:   { label: "Myntra",    color: "#e31852" },
  amazon:   { label: "Amazon",    color: "#ff9900" },
  flipkart: { label: "Flipkart",  color: "#2874f0" },
  ajio:     { label: "AJIO",      color: "#cb1f27" },
  tatacliq: { label: "Tata CLiQ", color: "#0e3080" },
};

interface Section {
  key: string;
  label: string;
}

const SECTIONS: Section[] = [
  { key: "category", label: "Category" },
  { key: "brand", label: "Brand" },
  { key: "gender", label: "Gender" },
  { key: "price", label: "Price Range" },
  { key: "platform", label: "Platform" },
];

interface FilterSidebarProps {
  onClose?: () => void;
}

export default function FilterSidebar({ onClose }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    category: true, brand: true, gender: true, price: true, platform: true,
  });

  const getParam = (key: string) => searchParams.get(key) || "";

  const applyFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
    if (onClose) onClose();
  };

  const applyPriceRange = (min: string, max: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("minPrice") === min && params.get("maxPrice") === max) {
      params.delete("minPrice");
      params.delete("maxPrice");
    } else {
      params.set("minPrice", min);
      params.set("maxPrice", max);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
    if (onClose) onClose();
  };

  const clearAll = () => {
    router.push("/products");
    if (onClose) onClose();
  };

  const hasFilters = searchParams.toString().length > 0;

  const toggleSection = (key: string) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const SectionHeader = ({ section }: { section: Section }) => (
    <button
      onClick={() => toggleSection(section.key)}
      className="w-full flex items-center justify-between py-3 text-left"
    >
      <span className="text-[12px] font-semibold text-white/60 uppercase tracking-wider">{section.label}</span>
      {openSections[section.key]
        ? <ChevronUp className="w-3.5 h-3.5 text-white/40" />
        : <ChevronDown className="w-3.5 h-3.5 text-white/40" />}
    </button>
  );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-purple-400" />
          <span className="text-[13px] font-semibold text-white/80">Filters</span>
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="text-[11px] text-purple-400 hover:text-purple-300 font-medium flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}
      </div>

      <div className="space-y-1">
        {/* Category */}
        <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <SectionHeader section={SECTIONS[0]} />
          <AnimatePresence>
            {openSections.category && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden pb-3 space-y-1"
              >
                {CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => applyFilter("category", cat)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] transition-all ${
                      getParam("category") === cat
                        ? "text-purple-300 bg-purple-500/10 font-medium"
                        : "text-white/50 hover:text-white/80 hover:bg-white/4"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Brand */}
        <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <SectionHeader section={SECTIONS[1]} />
          <AnimatePresence>
            {openSections.brand && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-3 space-y-1"
              >
                {BRANDS.map(brand => (
                  <button
                    key={brand}
                    onClick={() => applyFilter("brand", brand)}
                    className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] transition-all ${
                      getParam("brand") === brand
                        ? "text-purple-300 bg-purple-500/10 font-medium"
                        : "text-white/50 hover:text-white/80 hover:bg-white/4"
                    }`}
                  >
                    {brand}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Gender */}
        <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <SectionHeader section={SECTIONS[2]} />
          <AnimatePresence>
            {openSections.gender && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-3 flex gap-2"
              >
                {GENDERS.map(gender => (
                  <button
                    key={gender}
                    onClick={() => applyFilter("gender", gender)}
                    className={`flex-1 py-2 rounded-xl text-[12px] font-medium transition-all ${
                      getParam("gender") === gender
                        ? "text-white"
                        : "text-white/40 hover:text-white/70"
                    }`}
                    style={getParam("gender") === gender
                      ? { background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))' }
                      : { background: 'rgba(255,255,255,0.05)' }}
                  >
                    {gender}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Price Range */}
        <div className="border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <SectionHeader section={SECTIONS[3]} />
          <AnimatePresence>
            {openSections.price && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-3 space-y-1"
              >
                {PRICE_RANGES.map(range => {
                  const isActive = getParam("minPrice") === range.min && getParam("maxPrice") === range.max;
                  return (
                    <button
                      key={range.label}
                      onClick={() => applyPriceRange(range.min, range.max)}
                      className={`w-full text-left px-2 py-1.5 rounded-lg text-[13px] transition-all ${
                        isActive
                          ? "text-purple-300 bg-purple-500/10 font-medium"
                          : "text-white/50 hover:text-white/80 hover:bg-white/4"
                      }`}
                    >
                      {range.label}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Platform */}
        <div>
          <SectionHeader section={SECTIONS[4]} />
          <AnimatePresence>
            {openSections.platform && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pb-3 space-y-2"
              >
                {PLATFORMS.map(platform => {
                  const meta = PLATFORM_META[platform];
                  const isActive = getParam("platform") === platform;
                  return (
                    <button
                      key={platform}
                      onClick={() => applyFilter("platform", platform)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-[12px] font-medium transition-all flex items-center gap-2 ${
                        isActive ? "ring-1" : "hover:bg-white/5"
                      }`}
                      style={{
                        background: isActive ? `${meta.color}18` : 'rgba(255,255,255,0.03)',
                        boxShadow: isActive ? `0 0 0 1px ${meta.color}60` : 'none',
                      }}
                    >
                      <span
                        className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                        style={{ background: `${meta.color}20`, color: meta.color }}
                      >
                        {meta.label[0]}
                      </span>
                      <span style={{ color: isActive ? meta.color : 'rgba(255,255,255,0.6)' }}>
                        {meta.label}
                      </span>
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
