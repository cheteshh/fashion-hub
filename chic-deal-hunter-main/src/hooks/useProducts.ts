import { useState, useEffect } from "react";
import { Product } from "@/data/products";

interface UseProductsResult {
  products: Product[];
  loading: boolean;
  error: string | null;
}

export const useProducts = (): UseProductsResult => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("http://localhost:5000/api/products");
        if (!res.ok) throw new Error("Failed to load products");
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return { products, loading, error };
};
