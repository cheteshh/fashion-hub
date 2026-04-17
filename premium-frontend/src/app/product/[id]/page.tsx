import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ExternalLink, Check, Star } from "lucide-react";
import Navbar from "@/components/Navbar";

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

async function getProduct(id: string) {
  try {
    const res = await fetch(`http://localhost:4000/product/${id}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error("Failed to fetch product");
    }
    return res.json() as Promise<Product>;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProduct(resolvedParams.id);

  if (!product) {
    return (
      <main className="min-h-screen bg-[var(--color-background)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Product Not Found</h2>
          <Link href="/" className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
        </div>
      </main>
    );
  }

  // Sort platforms by price (lowest first)
  const sortedPlatforms = [...product.platforms].sort((a, b) => a.price - b.price);

  return (
    <main className="min-h-screen bg-[var(--color-background)]">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors mb-12"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          {/* Left Column: Image */}
          <div className="w-full lg:w-1/2">
            <div className="sticky top-32">
              <div className="relative aspect-[4/5] bg-[var(--color-muted)] rounded-3xl overflow-hidden">
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Right Column: Details & Pricing */}
          <div className="w-full lg:w-1/2 flex flex-col justify-center">
            <div className="mb-10">
              <p className="text-sm font-semibold tracking-widest text-[var(--color-muted-foreground)] uppercase mb-3">
                {product.brand}
              </p>
              <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--color-foreground)] leading-tight mb-4">
                {product.name}
              </h1>
              <p className="text-[var(--color-muted-foreground)]">
                Category: {product.category}
              </p>
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-medium mb-6">Available From</h2>
              
              <div className="flex flex-col gap-4">
                {sortedPlatforms.map((platform, idx) => {
                  const isLowest = idx === 0;
                  
                  return (
                    <div 
                      key={platform.platform_name} 
                      className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border transition-all ${
                        isLowest 
                          ? "border-[var(--color-foreground)] bg-white premium-shadow" 
                          : "border-[var(--color-border)] bg-transparent hover:border-black/20"
                      }`}
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 rounded-full bg-[var(--color-muted)] flex items-center justify-center font-semibold text-sm">
                          {platform.platform_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{platform.platform_name}</h3>
                            {isLowest && (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold bg-[var(--color-foreground)] text-[var(--color-background)] px-2.5 py-1 rounded-full">
                                <Check className="w-3 h-3" /> Best Price
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-sm text-[var(--color-muted-foreground)] mt-1">
                            <Star className="w-3.5 h-3.5 fill-[var(--color-foreground)] text-[var(--color-foreground)]" />
                            <span>{platform.rating.toFixed(1)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 justify-between sm:justify-end">
                        <div className="text-2xl font-medium tracking-tight">
                          ₹{platform.price.toLocaleString('en-IN')}
                        </div>
                        <a 
                          href={platform.product_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className={`inline-flex items-center justify-center h-12 px-6 rounded-full font-medium transition-transform active:scale-95 ${
                            isLowest
                              ? "bg-[var(--color-foreground)] text-[var(--color-background)] hover:opacity-90"
                              : "bg-[var(--color-muted)] text-[var(--color-foreground)] hover:bg-[#e5e5ea]"
                          }`}
                        >
                          Buy Now <ExternalLink className="w-4 h-4 ml-2 opacity-70" />
                        </a>
                      </div>
                    </div>
                  );
                })}
                
                {product.platforms.length === 0 && (
                  <p className="text-[var(--color-muted-foreground)] italic">Currently unavailable on tracking platforms.</p>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-[var(--color-border)]">
              <h3 className="font-medium text-sm text-[var(--color-muted-foreground)] uppercase tracking-wider mb-4">Highlights</h3>
              <ul className="space-y-3 text-[var(--color-foreground)]">
                <li className="flex gap-3">
                  <span className="opacity-50">—</span> 
                  <span>100% Original Brand Guarantee</span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-50">—</span> 
                  <span>Premium minimalist packaging directly from the seller</span>
                </li>
                <li className="flex gap-3">
                  <span className="opacity-50">—</span> 
                  <span>Easy returns as per platform policy</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
