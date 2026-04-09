export interface Product {
  id: string;
  name: string;
  brand: string;
  color: string;
  sizes: string[];
  image: string;
  category: string;
  gender?: "Men" | "Women" | "Unisex";
  rating?: number;   // 0–5
  reviews?: number;  // review count
  prices: {
    myntra: number;
    amazon: number;
    flipkart: number;
    ajio: number;
  };
  priceHistory: { date: string; price: number }[];
}

export const getLowestPrice = (prices: Product["prices"]): number => {
  return Math.min(...Object.values(prices));
};

export const getLowestPricePlatform = (prices: Product["prices"]): string => {
  const entries = Object.entries(prices);
  const lowest = entries.reduce((a, b) => (a[1] < b[1] ? a : b));
  return lowest[0].charAt(0).toUpperCase() + lowest[0].slice(1);
};

export const platformUrls: Record<string, string> = {
  myntra: "https://www.myntra.com",
  amazon: "https://www.amazon.in",
  flipkart: "https://www.flipkart.com",
  ajio: "https://www.ajio.com",
};

// Keep backward-compatible empty export so old imports don't break
export const products: Product[] = [];
