import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, TrendingDown, ShieldCheck, Zap } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";

const CATEGORIES = [
  { label: "T-Shirts",    emoji: "👕", cat: "T-Shirts" },
  { label: "Shirts",      emoji: "👔", cat: "Shirts" },
  { label: "Hoodies",     emoji: "🧥", cat: "Hoodies" },
  { label: "Jackets",     emoji: "🧣", cat: "Jackets" },
  { label: "Jeans",       emoji: "👖", cat: "Jeans" },
  { label: "Dresses",     emoji: "👗", cat: "Dresses" },
  { label: "Ethnic",      emoji: "🪷",  cat: "Ethnic" },
  { label: "Sneakers",    emoji: "👟", cat: "Sneakers" },
  { label: "Accessories", emoji: "👜", cat: "Accessories" },
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

const Index = () => {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { products, loading } = useProducts();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) navigate(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const features = [
    { icon: TrendingDown, title: "Lowest Prices", desc: "Compare across 4 major platforms instantly" },
    { icon: ShieldCheck, title: "Trusted Sources", desc: "Only verified retailers like Myntra, Amazon & more" },
    { icon: Zap, title: "Price Alerts", desc: "Track price drops with local price history" },
  ];

  const featured = products.slice(0, 8);

  return (
    <div>
      {/* ── Hero with static photo background ── */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundImage: "url('/hero-bg.png')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        {/* Gradient overlays for text readability over the light image */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/75 via-background/50 to-background/25" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-transparent to-background/80" />

        <section className="relative z-10 py-28 md:py-44">
          <div className="mx-auto max-w-7xl px-4 text-center md:px-8">
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold leading-tight md:text-6xl lg:text-7xl"
            >
              Find the <span className="text-gradient">Best Price</span>
              <br />for Fashion
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground"
            >
              Compare {products.length > 0 ? `${products.length}+` : "hundreds of"} clothing items across Myntra, Amazon, Flipkart &amp; Ajio — save money on every purchase.
            </motion.p>
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mx-auto mt-8 max-w-lg"
            >
              <div className="relative">
                <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by brand, category, or color..."
                  className="h-14 w-full rounded-full border bg-card/80 backdrop-blur-sm pl-14 pr-6 text-base shadow-lg outline-none transition-all focus:ring-2 focus:ring-ring"
                />
              </div>
            </motion.form>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 1 }}
              className="mt-6 text-xs text-muted-foreground/70"
            >
              ↓ Scroll to explore the collection
            </motion.p>
          </div>
        </section>
      </div>


      {/* ── Category Quick Nav ── */}
      <section className="mx-auto max-w-7xl px-4 pt-12 pb-2 md:px-8">
        <h2 className="mb-5 text-2xl font-bold md:text-3xl">Shop by Category</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-9">
          {CATEGORIES.map((c, i) => (
            <motion.button
              key={c.cat}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(`/search?cat=${encodeURIComponent(c.cat)}`)}
              className="flex flex-col items-center gap-1.5 rounded-xl border bg-card px-2 py-4 text-center transition-all hover:border-accent hover:shadow-md"
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-xs font-medium text-foreground">{c.label}</span>
            </motion.button>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-xl border bg-card p-6 text-center"
            >
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <f.icon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="mx-auto max-w-7xl px-4 pb-20 md:px-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold md:text-3xl">Featured Products</h2>
          <button
            onClick={() => navigate("/search")}
            className="text-sm font-medium text-accent hover:underline"
          >
            View All {products.length > 0 && `(${products.length})`} →
          </button>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <ProductSkeleton key={i} />)
            : featured.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>
    </div>
  );
};

export default Index;
