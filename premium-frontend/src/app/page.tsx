import Navbar from "@/components/Navbar";
import ProductCard from "@/components/ProductCard";

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

async function getProducts() {
  try {
    const res = await fetch("http://localhost:4000/products", {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error("Failed to fetch products");
    return res.json() as Promise<Product[]>;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function Home() {
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-[var(--color-background)] pb-24">
      <Navbar />
      
      <div className="pt-32 pb-16 px-6 max-w-7xl mx-auto">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-[var(--color-foreground)] mb-4">
            New Arrivals.
          </h1>
          <p className="text-lg text-[var(--color-muted-foreground)] max-w-2xl">
            Compare prices across premium platforms and discover exactly what you need at the best possible value.
          </p>
        </header>

        {products.length === 0 ? (
          <div className="text-center py-20 bg-[var(--color-muted)] rounded-3xl">
            <p className="text-[var(--color-muted-foreground)] mb-4">Cannot connect to the backend API.</p>
            <p className="text-sm">Make sure you have run <code className="bg-white/50 px-2 py-1 rounded">npm start</code> in the backend directory.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
