import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingCart, Plus, Minus, Trash2, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { platformUrls, getLowestPrice } from "@/data/products";

const Cart = () => {
  const { items, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-center justify-center gap-4 px-4 py-20 text-center md:px-8">
        <ShoppingCart className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="text-muted-foreground">
          Browse products and add items you love.
        </p>
        <button
          onClick={() => navigate("/search")}
          className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80"
        >
          Browse Products
        </button>
      </div>
    );
  }

  const savings = items.reduce((sum, item) => {
    const prices = Object.values(item.product.prices);
    const highest = Math.max(...prices);
    const chosen = item.product.prices[item.selectedPlatform as keyof typeof item.product.prices] ?? getLowestPrice(item.product.prices);
    return sum + (highest - chosen) * item.quantity;
  }, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <Link
        to="/search"
        className="mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> Continue Shopping
      </Link>

      <h1 className="mb-8 text-3xl font-bold">Shopping Cart</h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Items */}
        <div className="space-y-4 lg:col-span-2">
          {items.map((item, i) => {
            const price =
              item.product.prices[item.selectedPlatform as keyof typeof item.product.prices] ??
              getLowestPrice(item.product.prices);
            const lowestPrice = getLowestPrice(item.product.prices);
            const isLowest = price === lowestPrice;

            return (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 rounded-xl border bg-card p-4"
              >
                {/* Image */}
                <Link to={`/product/${item.product.id}`} className="shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-24 w-20 rounded-lg object-cover"
                  />
                </Link>

                {/* Info */}
                <div className="flex flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {item.product.brand}
                      </p>
                      <Link to={`/product/${item.product.id}`}>
                        <h3 className="font-medium hover:text-accent">{item.product.name}</h3>
                      </Link>
                      <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                        Via: <span className="font-medium capitalize">{item.selectedPlatform}</span>
                        {isLowest && (
                          <span className="ml-2 rounded-full bg-accent/10 px-2 py-0.5 text-xs text-accent">
                            Best Price
                          </span>
                        )}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center gap-2 rounded-full border bg-secondary px-3 py-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {/* Price */}
                    <span className="text-lg font-bold">
                      ₹{(price * item.quantity).toLocaleString()}
                    </span>
                  </div>

                  {/* Buy direct link */}
                  <a
                    href={platformUrls[item.selectedPlatform]}
                    target="_blank"
                    rel="noreferrer"
                    className="self-start text-xs font-medium text-accent hover:underline"
                  >
                    Buy on {item.selectedPlatform.charAt(0).toUpperCase() + item.selectedPlatform.slice(1)} →
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="h-fit rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>
          <div className="space-y-3 text-sm">
            {items.map((item) => {
              const price =
                item.product.prices[item.selectedPlatform as keyof typeof item.product.prices] ??
                getLowestPrice(item.product.prices);
              return (
                <div key={item.product.id} className="flex justify-between text-muted-foreground">
                  <span className="truncate pr-2">{item.product.name} × {item.quantity}</span>
                  <span className="shrink-0">₹{(price * item.quantity).toLocaleString()}</span>
                </div>
              );
            })}
          </div>

          <div className="my-4 border-t" />

          {savings > 0 && (
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-muted-foreground">Your savings</span>
              <span className="font-medium text-accent">−₹{savings.toLocaleString()}</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>

          <p className="mt-1 text-xs text-muted-foreground">
            *Prices may vary. Click "Buy" links to complete purchase on retailer sites.
          </p>

          <button
            onClick={() => navigate("/search")}
            className="mt-5 w-full rounded-full border py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
