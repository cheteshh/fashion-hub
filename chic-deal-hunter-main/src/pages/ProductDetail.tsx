import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, ShoppingCart } from "lucide-react";
import { getLowestPrice, getLowestPricePlatform, platformUrls } from "@/data/products";
import PriceChart from "@/components/PriceChart";
import { useProducts } from "@/hooks/useProducts";
import { useCart } from "@/context/CartContext";

const ProductDetail = () => {
  const { id } = useParams();
  const { products, loading } = useProducts();
  const { addToCart } = useCart();
  const product = products.find((p) => p.id === id);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl animate-pulse px-4 py-8 md:px-8">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square rounded-2xl bg-secondary" />
          <div className="space-y-4">
            <div className="h-4 w-1/4 rounded bg-secondary" />
            <div className="h-8 w-3/4 rounded bg-secondary" />
            <div className="h-4 w-1/2 rounded bg-secondary" />
            <div className="mt-6 h-24 rounded-xl bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Product not found.</p>
      </div>
    );
  }

  const lowest = getLowestPrice(product.prices);
  const lowestPlatform = getLowestPricePlatform(product.prices);
  const platforms = Object.entries(product.prices) as [string, number][];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <Link to="/search" className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to results
      </Link>

      <div className="grid gap-10 md:grid-cols-2">
        {/* Image */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="overflow-hidden rounded-2xl">
          <img src={product.image} alt={product.name} className="h-auto w-full object-cover" />
        </motion.div>

        {/* Details */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">{product.brand}</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">{product.name}</h1>

          <div className="mt-4 flex gap-4 text-sm text-muted-foreground">
            <span>Color: <strong className="text-foreground">{product.color}</strong></span>
            <span>Sizes: <strong className="text-foreground">{product.sizes.join(", ")}</strong></span>
          </div>

          <div className="mt-6 rounded-xl border bg-accent/5 p-5">
            <p className="text-sm text-muted-foreground">Lowest Price</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-gradient">₹{lowest.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground">on {lowestPlatform}</span>
            </div>
          </div>

          {/* Add to Cart + Buy Now */}
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => addToCart(product)}
              className="flex flex-1 items-center justify-center gap-2 rounded-full border py-3 text-sm font-medium transition-colors hover:bg-secondary"
            >
              <ShoppingCart className="h-4 w-4" /> Add to Cart
            </button>
            <a
              href={platformUrls[lowestPlatform.toLowerCase()]}
              target="_blank"
              rel="noreferrer"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80"
            >
              Buy Now <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          {/* Price Comparison Table */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Compare Prices</h2>
            <div className="overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Website</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Price</th>
                    <th className="px-4 py-3 text-right font-medium text-muted-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {platforms.map(([platform, price]) => (
                    <tr key={platform} className="border-t transition-colors hover:bg-secondary/50">
                      <td className="px-4 py-3 font-medium capitalize">{platform}</td>
                      <td className="px-4 py-3">
                        <span className={price === lowest ? "font-bold text-accent" : ""}>
                          ₹{price.toLocaleString()}
                        </span>
                        {price === lowest && (
                          <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">Lowest</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={platformUrls[platform]}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-full bg-primary px-4 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-80"
                        >
                          Buy <ExternalLink className="h-3 w-3" />
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price History */}
          <div className="mt-8">
            <h2 className="mb-4 text-xl font-semibold">Price History</h2>
            <div className="rounded-xl border bg-card p-4">
              <PriceChart history={product.priceHistory} />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProductDetail;
