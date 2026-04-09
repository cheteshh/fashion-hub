import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Product, getLowestPrice, getLowestPricePlatform, platformUrls } from "@/data/products";
import { ArrowRight, ShoppingCart, ExternalLink, Star } from "lucide-react";
import { useCart } from "@/context/CartContext";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-3 w-3 ${star <= Math.round(rating) ? "fill-accent text-accent" : "text-muted-foreground/40"}`}
      />
    ))}
    <span className="ml-1 text-xs text-muted-foreground">{rating.toFixed(1)}</span>
  </div>
);

const ProductCard = ({ product, index = 0 }: { product: Product; index?: number }) => {
  const lowest = getLowestPrice(product.prices);
  const platform = getLowestPricePlatform(product.prices);
  const { addToCart } = useCart();
  const platforms = Object.entries(product.prices) as [string, number][];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
    >
      <div className="card-hover overflow-hidden rounded-xl border bg-card">
        {/* Image */}
        <Link to={`/product/${product.id}`} className="group block">
          <div className="relative aspect-[4/5] overflow-hidden">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              Best on {platform}
            </div>
            {product.gender && (
              <div className="absolute right-3 top-3 rounded-full bg-background/80 px-2 py-0.5 text-xs font-medium text-foreground backdrop-blur-sm">
                {product.gender}
              </div>
            )}
          </div>
        </Link>

        {/* Info */}
        <div className="p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {product.brand}
          </p>
          <Link to={`/product/${product.id}`}>
            <h3 className="mt-1 line-clamp-1 font-medium text-card-foreground hover:text-accent transition-colors">
              {product.name}
            </h3>
          </Link>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <span>{product.color}</span>
            <span>•</span>
            <span className="truncate">{product.sizes.join(", ")}</span>
          </div>

          {/* Rating */}
          {product.rating && (
            <div className="mt-1.5 flex items-center gap-2">
              <StarRating rating={product.rating} />
              {product.reviews && (
                <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
              )}
            </div>
          )}

          {/* Price row */}
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-foreground">₹{lowest.toLocaleString()}</span>
            <Link
              to={`/product/${product.id}`}
              className="flex items-center gap-1 text-xs font-medium text-accent transition-colors hover:text-foreground"
            >
              Compare <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* Price comparison mini-list */}
          <div className="mt-3 space-y-1 rounded-lg border bg-secondary/50 p-2">
            {platforms.map(([plat, price]) => (
              <div key={plat} className="flex items-center justify-between text-xs">
                <span className={`capitalize ${price === lowest ? "font-semibold text-accent" : "text-muted-foreground"}`}>
                  {plat}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className={price === lowest ? "font-bold text-accent" : "text-muted-foreground"}>
                    ₹{price.toLocaleString()}
                  </span>
                  {price === lowest && (
                    <span className="rounded-full bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">Low</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => addToCart(product)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border py-2 text-xs font-medium text-foreground transition-colors hover:bg-secondary"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to Cart
            </button>
            <a
              href={platformUrls[platform.toLowerCase()]}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-80"
            >
              Buy Now <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
