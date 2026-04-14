"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Star, Zap } from "lucide-react";
import { Product, getCheapestPlatform, getDiscountPercent, formatINR, PLATFORM_META } from "@/lib/api";
import { useState } from "react";

interface ProductCardProps {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgError, setImgError] = useState(false);

  const cheapest = getCheapestPlatform(product.platforms);
  const discount = cheapest ? getDiscountPercent(cheapest.originalPrice, cheapest.currentPrice) : 0;
  const cheapestMeta = cheapest ? PLATFORM_META[cheapest.platformDomain] : null;

  const isHotDeal = discount >= 25;
  const isNew = new Date(product.createdAt || '').getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.06, 0.4), ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/products/${product.id}`} className="group block">
        <div className="card overflow-hidden">
          {/* Image */}
          <div className="relative aspect-[3/4] bg-[#1e1e28] overflow-hidden">
            <img
              src={imgError ? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=533&fit=crop' : product.primaryImageUrl}
              alt={product.unifiedTitle}
              onError={() => setImgError(true)}
              className="w-full h-full object-cover transition-all duration-700 group-hover:scale-105 opacity-90 group-hover:opacity-100"
            />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1.5">
              {discount > 0 && (
                <span className="badge-deal flex items-center gap-1">
                  {isHotDeal && <Zap className="w-2.5 h-2.5" />}
                  {discount}% OFF
                </span>
              )}
              {isNew && <span className="badge-new">New</span>}
            </div>

            {/* Wishlist */}
            <button
              onClick={(e) => { e.preventDefault(); setIsWishlisted(!isWishlisted); }}
              className="absolute top-3 right-3 w-8 h-8 glass-card rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
            >
              <Heart className={`w-4 h-4 transition-colors ${isWishlisted ? "text-red-400 fill-red-400" : "text-white/70"}`} />
            </button>

            {/* Platform count badge */}
            <div className="absolute bottom-3 left-3 glass-card rounded-full px-2 py-1 text-[10px] text-white/70 font-medium">
              {product.platforms.length} platforms
            </div>
          </div>

          {/* Info */}
          <div className="p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-semibold text-white/40 uppercase tracking-wider truncate">
                {product.unifiedBrand}
              </span>
              {product.globalAverageRating > 0 && (
                <span className="flex items-center gap-1 text-[11px] text-amber-400 flex-shrink-0">
                  <Star className="w-3 h-3 fill-amber-400" />
                  {product.globalAverageRating.toFixed(1)}
                </span>
              )}
            </div>

            <p className="text-[13px] text-white/80 font-medium leading-snug line-clamp-2">
              {product.unifiedTitle}
            </p>

            {/* Price row */}
            {cheapest && (
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-bold text-white">
                    {formatINR(cheapest.currentPrice)}
                  </span>
                  {cheapest.originalPrice && cheapest.originalPrice > cheapest.currentPrice && (
                    <span className="text-[12px] text-white/30 line-through">
                      {formatINR(cheapest.originalPrice)}
                    </span>
                  )}
                </div>

                {/* Best platform chip */}
                {cheapestMeta && (
                  <span
                    className="text-[10px] font-semibold px-2 py-1 rounded-full flex-shrink-0"
                    style={{ background: cheapestMeta.bgColor, color: cheapestMeta.color }}
                  >
                    {cheapestMeta.label}
                  </span>
                )}
              </div>
            )}

            {/* Stock indicator */}
            {cheapest && !cheapest.inStock && (
              <p className="text-[11px] text-red-400 font-medium">Out of stock on cheapest platform</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
