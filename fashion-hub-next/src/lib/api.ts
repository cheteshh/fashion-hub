/**
 * FashionHub Production API Client
 * Fetches from Express backend with structured fallback mock data
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// ── Types ─────────────────────────────────────────────────────────
export interface PriceHistoryRecord {
  id: string;
  priceRecorded: number;
  timestamp: string;
}

export interface PlatformListing {
  id: string;
  platformDomain: string;
  sourceUrl: string;
  currentPrice: number;
  originalPrice: number | null;
  lowestEverPrice: number | null;
  customPlatformRating: number;
  platformReviews: number;
  inStock: boolean;
  priceHistory?: PriceHistoryRecord[];
}

export interface Product {
  id: string;
  unifiedTitle: string;
  unifiedBrand: string;
  category: string;
  gender: string;
  color: string;
  primaryImageUrl: string;
  globalAverageRating: number;
  totalReviews: number;
  basePrice: number;
  tags: string[];
  platforms: PlatformListing[];
  createdAt?: string;
}

export interface DealProduct extends PlatformListing {
  discountPct: number;
  product: Product;
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SearchParams {
  q?: string;
  category?: string;
  brand?: string;
  gender?: string;
  minPrice?: string;
  maxPrice?: string;
  platform?: string;
  sort?: string;
  page?: string;
  limit?: string;
}

// ── Platform metadata ─────────────────────────────────────────────
export const PLATFORM_META: Record<string, { label: string; color: string; bgColor: string; logo: string }> = {
  myntra:   { label: 'Myntra',   color: '#e31852', bgColor: 'rgba(227,24,82,0.1)',   logo: 'M' },
  amazon:   { label: 'Amazon',   color: '#ff9900', bgColor: 'rgba(255,153,0,0.1)',   logo: 'A' },
  flipkart: { label: 'Flipkart', color: '#2874f0', bgColor: 'rgba(40,116,240,0.1)', logo: 'F' },
  ajio:     { label: 'AJIO',     color: '#cb1f27', bgColor: 'rgba(203,31,39,0.1)',   logo: 'J' },
  tatacliq: { label: 'Tata CLiQ',color: '#0e3080', bgColor: 'rgba(14,48,128,0.1)',  logo: 'T' },
};

// ── Helpers ──────────────────────────────────────────────────────
export function getCheapestPlatform(platforms: PlatformListing[]): PlatformListing | null {
  if (!platforms.length) return null;
  return platforms.reduce((a, b) => (a.currentPrice <= b.currentPrice ? a : b));
}

export function getDiscountPercent(original: number | null, current: number): number {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ── Mock fallback data ─────────────────────────────────────────────
function makeMockPriceHistory(basePrice: number, days: number = 30) {
  const history = [];
  let price = basePrice + 800;
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const isSale = i % 10 === 0;
    if (isSale) price = Math.round(basePrice * 0.8);
    else price += Math.floor(Math.random() * 200) - 100;
    price = Math.max(basePrice * 0.6, price);
    history.push({ id: `h_${i}`, priceRecorded: Math.round(price / 10) * 10, timestamp: d.toISOString() });
  }
  return history;
}

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'nike-af1-white', unifiedTitle: "Nike Air Force 1 '07", unifiedBrand: 'Nike',
    category: 'Sneakers', gender: 'Unisex', color: 'White',
    primaryImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop',
    globalAverageRating: 4.9, totalReviews: 89320, basePrice: 7999, tags: ['Sneakers', 'Nike'],
    platforms: [
      { id: 'l1', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/nike-air-force-1', currentPrice: 7999, originalPrice: 9499, lowestEverPrice: 7199, customPlatformRating: 4.8, platformReviews: 34200, inStock: true, priceHistory: makeMockPriceHistory(7999) },
      { id: 'l2', platformDomain: 'amazon', sourceUrl: 'https://www.amazon.in/s?k=nike+air+force+1', currentPrice: 8299, originalPrice: 9499, lowestEverPrice: 7499, customPlatformRating: 4.9, platformReviews: 42100, inStock: true, priceHistory: makeMockPriceHistory(8299) },
      { id: 'l3', platformDomain: 'flipkart', sourceUrl: 'https://www.flipkart.com/search?q=nike+air+force+1', currentPrice: 8999, originalPrice: 9499, lowestEverPrice: 7999, customPlatformRating: 4.7, platformReviews: 12980, inStock: true, priceHistory: makeMockPriceHistory(8999) },
    ],
  },
  {
    id: 'levis-511-slim', unifiedTitle: "Levi's 511 Slim Fit Jeans", unifiedBrand: "Levi's",
    category: 'Jeans', gender: 'Men', color: 'Dark Indigo',
    primaryImageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop',
    globalAverageRating: 4.8, totalReviews: 48320, basePrice: 3499, tags: ['Jeans', "Levi's"],
    platforms: [
      { id: 'l4', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/levis-511', currentPrice: 3499, originalPrice: 4499, lowestEverPrice: 2799, customPlatformRating: 4.8, platformReviews: 18200, inStock: true, priceHistory: makeMockPriceHistory(3499) },
      { id: 'l5', platformDomain: 'amazon', sourceUrl: 'https://www.amazon.in/s?k=levis+511', currentPrice: 3299, originalPrice: 4499, lowestEverPrice: 2999, customPlatformRating: 4.7, platformReviews: 22100, inStock: true, priceHistory: makeMockPriceHistory(3299) },
      { id: 'l6', platformDomain: 'flipkart', sourceUrl: 'https://www.flipkart.com/search?q=levis+511', currentPrice: 3799, originalPrice: 4499, lowestEverPrice: 3199, customPlatformRating: 4.6, platformReviews: 8780, inStock: true, priceHistory: makeMockPriceHistory(3799) },
    ],
  },
  {
    id: 'zara-floral-dress', unifiedTitle: 'Zara Floral Print Midi Dress', unifiedBrand: 'Zara',
    category: 'Dresses', gender: 'Women', color: 'Red Floral',
    primaryImageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop',
    globalAverageRating: 4.6, totalReviews: 14320, basePrice: 2399, tags: ['Dresses', 'Zara'],
    platforms: [
      { id: 'l7', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/zara-dress', currentPrice: 2399, originalPrice: 3499, lowestEverPrice: 1999, customPlatformRating: 4.6, platformReviews: 5600, inStock: true, priceHistory: makeMockPriceHistory(2399) },
      { id: 'l8', platformDomain: 'tatacliq', sourceUrl: 'https://www.tatacliq.com/search/?text=zara+dress', currentPrice: 2599, originalPrice: 3499, lowestEverPrice: 2199, customPlatformRating: 4.5, platformReviews: 2340, inStock: true, priceHistory: makeMockPriceHistory(2599) },
    ],
  },
  {
    id: 'adidas-ultraboost', unifiedTitle: 'Adidas Ultraboost 22 Running Shoes', unifiedBrand: 'Adidas',
    category: 'Sneakers', gender: 'Unisex', color: 'Core Black',
    primaryImageUrl: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=800&h=1000&fit=crop',
    globalAverageRating: 4.9, totalReviews: 45670, basePrice: 12999, tags: ['Sneakers', 'Adidas', 'Running'],
    platforms: [
      { id: 'l9', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/adidas-ultraboost', currentPrice: 12999, originalPrice: 15999, lowestEverPrice: 10999, customPlatformRating: 4.9, platformReviews: 18900, inStock: true, priceHistory: makeMockPriceHistory(12999) },
      { id: 'l10', platformDomain: 'amazon', sourceUrl: 'https://www.amazon.in/s?k=adidas+ultraboost+22', currentPrice: 13499, originalPrice: 15999, lowestEverPrice: 11499, customPlatformRating: 4.8, platformReviews: 22100, inStock: true, priceHistory: makeMockPriceHistory(13499) },
      { id: 'l11', platformDomain: 'ajio', sourceUrl: 'https://www.ajio.com/search/?query=adidas+ultraboost', currentPrice: 12699, originalPrice: 15999, lowestEverPrice: 10999, customPlatformRating: 4.7, platformReviews: 4570, inStock: true, priceHistory: makeMockPriceHistory(12699) },
    ],
  },
  {
    id: 'nike-club-hoodie', unifiedTitle: 'Nike Club Fleece Pullover Hoodie', unifiedBrand: 'Nike',
    category: 'Hoodies', gender: 'Men', color: 'Black',
    primaryImageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop',
    globalAverageRating: 4.7, totalReviews: 19320, basePrice: 3499, tags: ['Hoodies', 'Nike'],
    platforms: [
      { id: 'l12', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/nike-hoodie', currentPrice: 3499, originalPrice: 4299, lowestEverPrice: 2999, customPlatformRating: 4.7, platformReviews: 8200, inStock: true, priceHistory: makeMockPriceHistory(3499) },
      { id: 'l13', platformDomain: 'flipkart', sourceUrl: 'https://www.flipkart.com/search?q=nike+club+hoodie', currentPrice: 3699, originalPrice: 4299, lowestEverPrice: 3199, customPlatformRating: 4.6, platformReviews: 5400, inStock: true, priceHistory: makeMockPriceHistory(3699) },
      { id: 'l14', platformDomain: 'amazon', sourceUrl: 'https://www.amazon.in/s?k=nike+club+fleece+hoodie', currentPrice: 3299, originalPrice: 4299, lowestEverPrice: 2899, customPlatformRating: 4.8, platformReviews: 12300, inStock: false, priceHistory: makeMockPriceHistory(3299) },
    ],
  },
  {
    id: 'ralph-lauren-polo', unifiedTitle: 'Ralph Lauren Classic Fit Polo Shirt', unifiedBrand: 'Ralph Lauren',
    category: 'Shirts', gender: 'Men', color: 'Navy',
    primaryImageUrl: 'https://images.unsplash.com/photo-1625910513413-5fc830c70cb0?w=800&h=1000&fit=crop',
    globalAverageRating: 4.8, totalReviews: 3210, basePrice: 4199, tags: ['Shirts', 'Ralph Lauren'],
    platforms: [
      { id: 'l15', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/ralph-lauren', currentPrice: 4199, originalPrice: 5499, lowestEverPrice: 3799, customPlatformRating: 4.8, platformReviews: 1200, inStock: true, priceHistory: makeMockPriceHistory(4199) },
      { id: 'l16', platformDomain: 'amazon', sourceUrl: 'https://www.amazon.in/s?k=ralph+lauren+polo', currentPrice: 4499, originalPrice: 5499, lowestEverPrice: 3999, customPlatformRating: 4.7, platformReviews: 1800, inStock: true, priceHistory: makeMockPriceHistory(4499) },
      { id: 'l17', platformDomain: 'tatacliq', sourceUrl: 'https://www.tatacliq.com/search/?text=ralph+lauren', currentPrice: 3999, originalPrice: 5499, lowestEverPrice: 3599, customPlatformRating: 4.9, platformReviews: 450, inStock: true, priceHistory: makeMockPriceHistory(3999) },
    ],
  },
  {
    id: 'manyavar-kurta', unifiedTitle: 'Manyavar Cotton Kurta Pajama Set', unifiedBrand: 'Manyavar',
    category: 'Ethnic', gender: 'Men', color: 'White',
    primaryImageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&h=1000&fit=crop',
    globalAverageRating: 4.8, totalReviews: 28430, basePrice: 2999, tags: ['Ethnic', 'Manyavar'],
    platforms: [
      { id: 'l18', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/manyavar', currentPrice: 2999, originalPrice: 3999, lowestEverPrice: 2499, customPlatformRating: 4.8, platformReviews: 12400, inStock: true, priceHistory: makeMockPriceHistory(2999) },
      { id: 'l19', platformDomain: 'ajio', sourceUrl: 'https://www.ajio.com/search/?query=manyavar+kurta', currentPrice: 2799, originalPrice: 3999, lowestEverPrice: 2299, customPlatformRating: 4.7, platformReviews: 8900, inStock: true, priceHistory: makeMockPriceHistory(2799) },
    ],
  },
  {
    id: 'new-balance-574', unifiedTitle: 'New Balance 574 Core Sneakers', unifiedBrand: 'New Balance',
    category: 'Sneakers', gender: 'Men', color: 'Grey',
    primaryImageUrl: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=1000&fit=crop',
    globalAverageRating: 4.7, totalReviews: 29450, basePrice: 6499, tags: ['Sneakers', 'New Balance'],
    platforms: [
      { id: 'l20', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/new-balance', currentPrice: 6499, originalPrice: 7999, lowestEverPrice: 5499, customPlatformRating: 4.7, platformReviews: 12100, inStock: true, priceHistory: makeMockPriceHistory(6499) },
      { id: 'l21', platformDomain: 'amazon', sourceUrl: 'https://www.amazon.in/s?k=new+balance+574', currentPrice: 6799, originalPrice: 7999, lowestEverPrice: 5799, customPlatformRating: 4.6, platformReviews: 9800, inStock: true, priceHistory: makeMockPriceHistory(6799) },
      { id: 'l22', platformDomain: 'flipkart', sourceUrl: 'https://www.flipkart.com/search?q=new+balance+574', currentPrice: 6299, originalPrice: 7999, lowestEverPrice: 5299, customPlatformRating: 4.8, platformReviews: 7550, inStock: false, priceHistory: makeMockPriceHistory(6299) },
    ],
  },
  {
    id: 'w-kurti', unifiedTitle: 'W Cotton Embroidered Kurti', unifiedBrand: 'W',
    category: 'Ethnic', gender: 'Women', color: 'Navy Blue',
    primaryImageUrl: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop',
    globalAverageRating: 4.5, totalReviews: 34560, basePrice: 899, tags: ['Ethnic', 'W', 'Kurti'],
    platforms: [
      { id: 'l23', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/w-kurti', currentPrice: 899, originalPrice: 1299, lowestEverPrice: 699, customPlatformRating: 4.5, platformReviews: 18200, inStock: true, priceHistory: makeMockPriceHistory(899) },
      { id: 'l24', platformDomain: 'ajio', sourceUrl: 'https://www.ajio.com/search/?query=w+kurti', currentPrice: 849, originalPrice: 1299, lowestEverPrice: 649, customPlatformRating: 4.4, platformReviews: 9800, inStock: true, priceHistory: makeMockPriceHistory(849) },
      { id: 'l25', platformDomain: 'flipkart', sourceUrl: 'https://www.flipkart.com/search?q=w+kurti', currentPrice: 949, originalPrice: 1299, lowestEverPrice: 749, customPlatformRating: 4.6, platformReviews: 6560, inStock: true, priceHistory: makeMockPriceHistory(949) },
    ],
  },
  {
    id: 'adidas-stan-smith', unifiedTitle: 'Adidas Stan Smith Sneakers', unifiedBrand: 'Adidas',
    category: 'Sneakers', gender: 'Unisex', color: 'White/Green',
    primaryImageUrl: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=1000&fit=crop',
    globalAverageRating: 4.8, totalReviews: 72100, basePrice: 6999, tags: ['Sneakers', 'Adidas', 'Classic'],
    platforms: [
      { id: 'l26', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/adidas-stan-smith', currentPrice: 6999, originalPrice: 8499, lowestEverPrice: 5999, customPlatformRating: 4.8, platformReviews: 32100, inStock: true, priceHistory: makeMockPriceHistory(6999) },
      { id: 'l27', platformDomain: 'amazon', sourceUrl: 'https://www.amazon.in/s?k=adidas+stan+smith', currentPrice: 7299, originalPrice: 8499, lowestEverPrice: 6299, customPlatformRating: 4.9, platformReviews: 28900, inStock: true, priceHistory: makeMockPriceHistory(7299) },
      { id: 'l28', platformDomain: 'flipkart', sourceUrl: 'https://www.flipkart.com/search?q=adidas+stan+smith', currentPrice: 6799, originalPrice: 8499, lowestEverPrice: 5799, customPlatformRating: 4.7, platformReviews: 11100, inStock: true, priceHistory: makeMockPriceHistory(6799) },
    ],
  },
  {
    id: 'levis-trucker', unifiedTitle: "Levi's Classic Trucker Denim Jacket", unifiedBrand: "Levi's",
    category: 'Jackets', gender: 'Men', color: 'Medium Wash',
    primaryImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop',
    globalAverageRating: 4.7, totalReviews: 18920, basePrice: 3599, tags: ['Jackets', "Levi's", 'Denim'],
    platforms: [
      { id: 'l29', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/levis-jacket', currentPrice: 3599, originalPrice: 4999, lowestEverPrice: 2999, customPlatformRating: 4.7, platformReviews: 8900, inStock: true, priceHistory: makeMockPriceHistory(3599) },
      { id: 'l30', platformDomain: 'ajio', sourceUrl: 'https://www.ajio.com/search/?query=levis+denim+jacket', currentPrice: 3399, originalPrice: 4999, lowestEverPrice: 2799, customPlatformRating: 4.6, platformReviews: 5600, inStock: true, priceHistory: makeMockPriceHistory(3399) },
    ],
  },
  {
    id: 'hm-hoodie', unifiedTitle: 'H&M Relaxed Fit Hoodie', unifiedBrand: 'H&M',
    category: 'Hoodies', gender: 'Men', color: 'Beige',
    primaryImageUrl: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&h=1000&fit=crop',
    globalAverageRating: 4.2, totalReviews: 12300, basePrice: 1599, tags: ['Hoodies', 'H&M'],
    platforms: [
      { id: 'l31', platformDomain: 'myntra', sourceUrl: 'https://www.myntra.com/hm-hoodie', currentPrice: 1599, originalPrice: 2299, lowestEverPrice: 1299, customPlatformRating: 4.2, platformReviews: 6200, inStock: true, priceHistory: makeMockPriceHistory(1599) },
      { id: 'l32', platformDomain: 'ajio', sourceUrl: 'https://www.ajio.com/search/?query=hm+hoodie', currentPrice: 1499, originalPrice: 2299, lowestEverPrice: 1199, customPlatformRating: 4.1, platformReviews: 3500, inStock: true, priceHistory: makeMockPriceHistory(1499) },
    ],
  },
];

// ── API Functions ─────────────────────────────────────────────────
async function fetchAPI<T>(path: string, opts?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      ...opts,
      headers: { 'Content-Type': 'application/json', ...opts?.headers },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getProducts(params: SearchParams = {}): Promise<PaginatedProducts> {
  const qs = new URLSearchParams(params as Record<string, string>).toString();
  const result = await fetchAPI<PaginatedProducts>(`/products?${qs}`);
  if (result) return result;
  // Fallback
  const filtered = MOCK_PRODUCTS.filter(p => {
    if (params.category && !p.category.toLowerCase().includes(params.category.toLowerCase())) return false;
    if (params.brand && !p.unifiedBrand.toLowerCase().includes(params.brand.toLowerCase())) return false;
    if (params.gender && params.gender !== 'all' && p.gender !== params.gender) return false;
    if (params.q) {
      const q = params.q.toLowerCase();
      return p.unifiedTitle.toLowerCase().includes(q) || p.unifiedBrand.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    }
    return true;
  });
  return { products: filtered, total: filtered.length, page: 1, limit: 24, totalPages: 1 };
}

export async function getProductById(id: string): Promise<Product> {
  const result = await fetchAPI<Product>(`/products/${id}`);
  if (result) return result;
  const mock = MOCK_PRODUCTS.find(p => p.id === id) || MOCK_PRODUCTS[0];
  return mock;
}

export async function getTrendingProducts(): Promise<Product[]> {
  const result = await fetchAPI<Product[]>('/products/trending?limit=12');
  if (result && Array.isArray(result)) return result;
  return MOCK_PRODUCTS.slice(0, 8);
}

export async function getDeals(): Promise<DealProduct[]> {
  const result = await fetchAPI<DealProduct[]>('/products/deals');
  if (result && Array.isArray(result)) return result;
  // Build mock deals from mock products
  return MOCK_PRODUCTS.slice(0, 6).map(p => {
    const cheapest = getCheapestPlatform(p.platforms)!;
    return {
      ...cheapest,
      discountPct: getDiscountPercent(cheapest.originalPrice, cheapest.currentPrice),
      product: p,
    };
  });
}

export async function searchProducts(q: string, params: SearchParams = {}): Promise<PaginatedProducts> {
  return getProducts({ ...params, q });
}

export async function setAlert(productId: string, targetPrice: number, email: string) {
  const result = await fetchAPI('/alerts', {
    method: 'POST',
    body: JSON.stringify({ productId, targetPrice, email }),
  });
  return result;
}
