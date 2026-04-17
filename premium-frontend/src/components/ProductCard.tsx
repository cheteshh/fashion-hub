"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface Platform {
  platform_name: string;
  price: number;
  product_url: string;
  rating: number;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  image_url: string;
  category: string;
  platforms: Platform[];
}

export default function ProductCard({ product }: { product: Product }) {
  // Find the lowest price among platforms
  const lowestPrice = product.platforms.length > 0 
    ? Math.min(...product.platforms.map(p => p.price))
    : 0;

  return (
    <Link href={`/product/${product.id}`} className="block group">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4 }}
        transition={{ duration: 0.4, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex flex-col gap-4"
      >
        <div className="relative aspect-[4/5] bg-[var(--color-muted)] rounded-2xl overflow-hidden">
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-brand group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
        </div>
        
        <div className="flex flex-col space-y-1 px-1">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-[var(--color-muted-foreground)] tracking-wider uppercase mb-1">
                {product.brand}
              </p>
              <h3 className="font-medium text-[var(--color-foreground)] leading-snug">
                {product.name}
              </h3>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="font-semibold text-lg">
                ₹{lowestPrice.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
