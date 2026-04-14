"use client";

import { ExternalLink, ShieldCheck, Star, Package } from "lucide-react";
import { PlatformListing, PLATFORM_META, formatINR, getDiscountPercent } from "@/lib/api";

interface PriceComparisonProps {
  platforms: PlatformListing[];
}

export default function PriceComparison({ platforms }: PriceComparisonProps) {
  const sorted = [...platforms].sort((a, b) => a.currentPrice - b.currentPrice);
  const lowestPrice = sorted[0]?.currentPrice ?? 0;

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(22,22,30,0.5)' }}>
      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <h3 className="text-[13px] font-semibold text-white/70">Compare Prices Across Platforms</h3>
        <span className="text-[11px] text-white/30">{platforms.length} stores</span>
      </div>

      {/* Platform rows */}
      <div className="divide-y" style={{ '--divide-color': 'rgba(255,255,255,0.05)' } as any}>
        {sorted.map((listing, idx) => {
          const meta = PLATFORM_META[listing.platformDomain];
          const isCheapest = listing.currentPrice === lowestPrice;
          const discount = getDiscountPercent(listing.originalPrice, listing.currentPrice);
          const savings = listing.originalPrice ? listing.originalPrice - listing.currentPrice : 0;

          return (
            <div
              key={listing.id}
              className="px-5 py-4 flex items-center gap-4 transition-all hover:bg-white/[0.03]"
              style={{ borderBottom: idx < sorted.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}
            >
              {/* Platform logo */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: meta?.bgColor || 'rgba(255,255,255,0.08)', color: meta?.color || '#fff' }}
              >
                {meta?.logo || listing.platformDomain[0].toUpperCase()}
              </div>

              {/* Platform info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-white/90" style={{ color: meta?.color }}>
                    {meta?.label || listing.platformDomain}
                  </span>
                  {isCheapest && (
                    <span className="badge-deal text-[9px] py-0.5 px-2">BEST PRICE</span>
                  )}
                  {!listing.inStock && (
                    <span className="text-[9px] font-semibold text-red-400 uppercase tracking-wider">Out of stock</span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-white/40">
                  {listing.customPlatformRating > 0 && (
                    <span className="flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {listing.customPlatformRating.toFixed(1)}
                      <span className="text-white/25">({listing.platformReviews.toLocaleString('en-IN')})</span>
                    </span>
                  )}
                  {listing.lowestEverPrice && (
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-green-400" />
                      Lowest ever: {formatINR(listing.lowestEverPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Price block */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={`text-lg font-bold ${isCheapest ? "text-white" : "text-white/60"}`}>
                  {formatINR(listing.currentPrice)}
                </span>
                {listing.originalPrice && listing.originalPrice > listing.currentPrice && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-white/30 line-through">{formatINR(listing.originalPrice)}</span>
                    <span className="text-[10px] text-green-400 font-semibold">-{discount}%</span>
                  </div>
                )}
                {savings > 0 && isCheapest && (
                  <span className="text-[10px] text-green-400">You save {formatINR(savings)}</span>
                )}
              </div>

              {/* Buy button */}
              <a
                href={listing.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all ${
                  listing.inStock
                    ? "text-white hover:scale-105 active:scale-95"
                    : "opacity-40 pointer-events-none text-white/50"
                }`}
                style={listing.inStock ? {
                  background: isCheapest
                    ? 'linear-gradient(135deg, var(--brand-from), var(--brand-to))'
                    : 'rgba(255,255,255,0.08)',
                } : { background: 'rgba(255,255,255,0.05)' }}
              >
                {listing.inStock ? (
                  <>Buy <ExternalLink className="w-3 h-3" /></>
                ) : (
                  <><Package className="w-3 h-3" /> Unavailable</>
                )}
              </a>
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="px-5 py-3 text-[10px] text-white/20 flex items-center gap-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <ShieldCheck className="w-3 h-3" />
        Prices are refreshed every 15 minutes. Click Buy to check live price on the platform.
      </div>
    </div>
  );
}
