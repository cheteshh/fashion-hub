import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PLATFORMS = ['myntra', 'amazon', 'ajio', 'flipkart', 'tatacliq'];

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[rand(0, arr.length - 1)];
}
function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}
function roundToTen(n: number) {
  return Math.round(n / 10) * 10;
}

/** generate realistic fluctuating price history for 180 days */
function generatePriceHistory(basePrice: number, days = 180) {
  const history: { timestamp: Date; price: number }[] = [];
  let currentPrice = basePrice + rand(500, 2000);
  const now = new Date();

  for (let d = days; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);

    // Simulate sale events every ~30 days
    const isSaleDay = d % rand(25, 35) === 0;
    if (isSaleDay) {
      currentPrice = roundToTen(basePrice * (0.7 + Math.random() * 0.15));
    } else {
      const drift = rand(-150, 200);
      currentPrice = roundToTen(Math.max(basePrice * 0.6, currentPrice + drift));
    }
    history.push({ timestamp: date, price: currentPrice });
  }
  return history;
}

/** Generate platform price spread: each platform gets a different price tier */
function generatePlatformPrices(basePrice: number): Record<string, number> {
  const tiers = [-300, -100, 0, 200, 500];
  const shuffledTiers = shuffle(tiers);
  const result: Record<string, number> = {};
  PLATFORMS.forEach((p, i) => {
    result[p] = roundToTen(Math.max(299, basePrice + shuffledTiers[i] + rand(-50, 50)));
  });
  return result;
}

/** Platform URL builders for real product links */
function buildSourceUrl(platform: string, brand: string, name: string): string {
  const q = encodeURIComponent(`${brand} ${name}`);
  const urls: Record<string, string> = {
    myntra: `https://www.myntra.com/${q.replace(/%20/g, '-').toLowerCase()}`,
    amazon: `https://www.amazon.in/s?k=${q}`,
    ajio: `https://www.ajio.com/search/?query=${q}`,
    flipkart: `https://www.flipkart.com/search?q=${q}`,
    tatacliq: `https://www.tatacliq.com/search/?searchCategory=all&text=${q}`,
  };
  return urls[platform] || '#';
}

// ═══════════════════════════════════════════════════════════════
//  MASSIVE PRODUCT CATALOG — 100+ Real Products
// ═══════════════════════════════════════════════════════════════
const CATALOG = [
  // ── T-SHIRTS ──────────────────────────────────────────────────
  { cat: 'T-Shirts', gender: 'Men', brand: 'Nike', name: 'Dri-FIT Training T-Shirt', color: 'Black', base: 1499, rating: 4.5, reviews: 12840, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Men', brand: 'Nike', name: 'Sportswear Club T-Shirt', color: 'Grey', base: 1799, rating: 4.4, reviews: 9320, img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Men', brand: 'Adidas', name: 'Essentials 3-Stripes T-Shirt', color: 'White', base: 1299, rating: 4.3, reviews: 8750, img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Men', brand: 'Adidas', name: 'Trefoil Graphic T-Shirt', color: 'Black', base: 1599, rating: 4.2, reviews: 6210, img: 'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Men', brand: 'H&M', name: 'Slim Fit Cotton Crew Neck T-Shirt', color: 'White', base: 599, rating: 4.1, reviews: 22100, img: 'https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Men', brand: 'Zara', name: 'Ribbed Polo T-Shirt', color: 'Navy Blue', base: 1999, rating: 4.3, reviews: 3450, img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Men', brand: "Levi's", name: 'Graphic Logo T-Shirt', color: 'Red', base: 999, rating: 4.4, reviews: 7800, img: 'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Men', brand: 'Puma', name: 'Essential Logo Tee', color: 'Forest Green', base: 1199, rating: 4.2, reviews: 5430, img: 'https://images.unsplash.com/photo-1559582798-678dfc71ccd8?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Men', brand: 'Ralph Lauren', name: 'Classic Fit Polo T-Shirt', color: 'Navy', base: 4199, rating: 4.7, reviews: 3210, img: 'https://images.unsplash.com/photo-1625910513413-5fc830c70cb0?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Men', brand: 'Tommy Hilfiger', name: 'Regular Fit Tee', color: 'Sky Blue', base: 2799, rating: 4.5, reviews: 4120, img: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Women', brand: 'H&M', name: 'Ribbed Fitted T-Shirt', color: 'Pink', base: 599, rating: 4.2, reviews: 15600, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Women', brand: 'Zara', name: 'Cropped Logo T-Shirt', color: 'White', base: 1499, rating: 4.4, reviews: 6780, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4bae73?w=800&h=1000&fit=crop' },
  { cat: 'T-Shirts', gender: 'Women', brand: 'Mango', name: 'Slogan Print Crop Top', color: 'Black', base: 1199, rating: 4.3, reviews: 4320, img: 'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=800&h=1000&fit=crop' },

  // ── SHIRTS ────────────────────────────────────────────────────
  { cat: 'Shirts', gender: 'Men', brand: 'H&M', name: 'Slim Fit Oxford Shirt', color: 'Light Blue', base: 1299, rating: 4.3, reviews: 9870, img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=1000&fit=crop' },
  { cat: 'Shirts', gender: 'Men', brand: 'Zara', name: 'Linen Blend Casual Shirt', color: 'Beige', base: 2999, rating: 4.5, reviews: 5340, img: 'https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=800&h=1000&fit=crop' },
  { cat: 'Shirts', gender: 'Men', brand: 'Zara', name: 'Floral Print Cuban Shirt', color: 'Multicolor', base: 3499, rating: 4.4, reviews: 2890, img: 'https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=800&h=1000&fit=crop' },
  { cat: 'Shirts', gender: 'Men', brand: "Levi's", name: 'Western Denim Shirt', color: 'Medium Blue', base: 2499, rating: 4.6, reviews: 7230, img: 'https://images.unsplash.com/photo-1625910513413-5fc830c70cb0?w=800&h=1000&fit=crop' },
  { cat: 'Shirts', gender: 'Men', brand: 'Tommy Hilfiger', name: 'Oxford Button-Down Shirt', color: 'White', base: 3999, rating: 4.7, reviews: 4510, img: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=1000&fit=crop' },
  { cat: 'Shirts', gender: 'Men', brand: 'Ralph Lauren', name: 'Classic Fit Oxford Shirt', color: 'White', base: 5499, rating: 4.8, reviews: 3120, img: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&h=1000&fit=crop' },
  { cat: 'Shirts', gender: 'Men', brand: 'Mango', name: 'Slim Fit Poplin Shirt', color: 'Navy', base: 2799, rating: 4.4, reviews: 3890, img: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=1000&fit=crop' },
  { cat: 'Shirts', gender: 'Men', brand: 'Nike', name: 'Dri-FIT Polo Shirt', color: 'Black', base: 2499, rating: 4.5, reviews: 8760, img: 'https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=800&h=1000&fit=crop' },
  { cat: 'Shirts', gender: 'Women', brand: 'Zara', name: 'Satin Finish Shirt', color: 'Ivory', base: 2999, rating: 4.6, reviews: 4230, img: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&h=1000&fit=crop' },
  { cat: 'Shirts', gender: 'Women', brand: 'H&M', name: 'Relaxed Fit Linen Shirt', color: 'White', base: 1499, rating: 4.3, reviews: 7650, img: 'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=800&h=1000&fit=crop' },

  // ── HOODIES & SWEATSHIRTS ───────────────────────────────────
  { cat: 'Hoodies', gender: 'Men', brand: 'Nike', name: 'Club Fleece Pullover Hoodie', color: 'Black', base: 3499, rating: 4.7, reviews: 19320, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop' },
  { cat: 'Hoodies', gender: 'Men', brand: 'Adidas', name: 'Essentials Fleece Hoodie', color: 'Dark Grey', base: 3199, rating: 4.5, reviews: 14780, img: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&h=1000&fit=crop' },
  { cat: 'Hoodies', gender: 'Men', brand: 'Puma', name: 'Essential Logo Hoodie', color: 'Navy Blue', base: 2799, rating: 4.4, reviews: 8450, img: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&h=1000&fit=crop' },
  { cat: 'Hoodies', gender: 'Men', brand: 'H&M', name: 'Relaxed Fit Hoodie', color: 'Beige', base: 1599, rating: 4.2, reviews: 12300, img: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=1000&fit=crop' },
  { cat: 'Hoodies', gender: 'Men', brand: 'GAP', name: 'Vintage Soft Logo Hoodie', color: 'Heather Grey', base: 2799, rating: 4.5, reviews: 6780, img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800&h=1000&fit=crop' },
  { cat: 'Hoodies', gender: 'Men', brand: "Levi's", name: 'Standard Logo Pullover Hoodie', color: 'Blue', base: 2999, rating: 4.4, reviews: 5320, img: 'https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=800&h=1000&fit=crop' },
  { cat: 'Hoodies', gender: 'Women', brand: 'Nike', name: 'Sportswear Phoenix Fleece Hoodie', color: 'Black', base: 3799, rating: 4.8, reviews: 22100, img: 'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=800&h=1000&fit=crop' },
  { cat: 'Hoodies', gender: 'Women', brand: 'Adidas', name: 'All SZN Fleece Hoodie', color: 'Halo Blush', base: 2999, rating: 4.6, reviews: 11340, img: 'https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=800&h=1000&fit=crop' },

  // ── JACKETS ───────────────────────────────────────────────────
  { cat: 'Jackets', gender: 'Men', brand: "Levi's", name: 'Classic Trucker Denim Jacket', color: 'Medium Wash', base: 3599, rating: 4.7, reviews: 18920, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Men', brand: 'Nike', name: 'Windrunner Hooded Jacket', color: 'Navy/White', base: 4499, rating: 4.6, reviews: 12450, img: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Men', brand: 'Adidas', name: 'Tiro Track Jacket', color: 'Black', base: 2799, rating: 4.5, reviews: 9870, img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Men', brand: 'H&M', name: 'Regular Fit Padded Jacket', color: 'Black', base: 2999, rating: 4.3, reviews: 8760, img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Men', brand: 'Zara', name: 'Structured Blazer Jacket', color: 'Charcoal', base: 4999, rating: 4.6, reviews: 4320, img: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Men', brand: 'Mango', name: 'Leather Biker Jacket', color: 'Black', base: 5499, rating: 4.7, reviews: 3210, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Men', brand: 'Ralph Lauren', name: 'Down-Filled Quilted Vest', color: 'Navy', base: 6999, rating: 4.8, reviews: 2340, img: 'https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Women', brand: 'Zara', name: 'Faux Leather Biker Jacket', color: 'Camel', base: 5999, rating: 4.7, reviews: 6780, img: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Women', brand: 'H&M', name: 'Quilted Puffer Jacket', color: 'Bubblegum Pink', base: 2799, rating: 4.4, reviews: 11230, img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Women', brand: 'Mango', name: 'Structured Blazer', color: 'Off-White', base: 4499, rating: 4.6, reviews: 5670, img: 'https://images.unsplash.com/photo-1548369937-47519962c11a?w=800&h=1000&fit=crop' },
  { cat: 'Jackets', gender: 'Women', brand: "Levi's", name: 'Sherpa Trucker Jacket', color: 'Denim Blue', base: 4999, rating: 4.7, reviews: 8920, img: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop' },

  // ── JEANS ─────────────────────────────────────────────────────
  { cat: 'Jeans', gender: 'Men', brand: "Levi's", name: '511 Slim Fit Jeans', color: 'Dark Indigo', base: 3499, rating: 4.8, reviews: 48320, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop' },
  { cat: 'Jeans', gender: 'Men', brand: "Levi's", name: '501 Original Straight Jeans', color: 'Medium Blue', base: 3999, rating: 4.9, reviews: 62100, img: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&h=1000&fit=crop' },
  { cat: 'Jeans', gender: 'Men', brand: 'H&M', name: 'Slim Tapered Jeans', color: 'Black', base: 1999, rating: 4.2, reviews: 18430, img: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&h=1000&fit=crop' },
  { cat: 'Jeans', gender: 'Men', brand: 'Zara', name: 'Skinny Fit Jeans', color: 'Dark Wash', base: 3299, rating: 4.4, reviews: 9870, img: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&h=1000&fit=crop' },
  { cat: 'Jeans', gender: 'Men', brand: 'Mango', name: 'Carrot Fit Jeans', color: 'Sand', base: 2799, rating: 4.3, reviews: 5450, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop' },
  { cat: 'Jeans', gender: 'Men', brand: 'Tommy Hilfiger', name: 'Slim Bleecker Jeans', color: 'Dark Blue', base: 4499, rating: 4.6, reviews: 7230, img: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&h=1000&fit=crop' },
  { cat: 'Jeans', gender: 'Women', brand: "Levi's", name: '724 High Rise Straight Jeans', color: 'Dark Stonewash', base: 3799, rating: 4.7, reviews: 31450, img: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=800&h=1000&fit=crop' },
  { cat: 'Jeans', gender: 'Women', brand: 'H&M', name: 'Mom Jeans', color: 'Light Blue', base: 1999, rating: 4.3, reviews: 19870, img: 'https://images.unsplash.com/photo-1604176354204-9268737828e4?w=800&h=1000&fit=crop' },
  { cat: 'Jeans', gender: 'Women', brand: 'Zara', name: 'High-Waist Wide Leg Jeans', color: 'Blue', base: 3499, rating: 4.5, reviews: 12340, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=1000&fit=crop' },
  { cat: 'Jeans', gender: 'Women', brand: 'Mango', name: 'Straight Leg Jeans', color: 'White', base: 2999, rating: 4.4, reviews: 8760, img: 'https://images.unsplash.com/photo-1475178626620-a4d074967452?w=800&h=1000&fit=crop' },

  // ── DRESSES ───────────────────────────────────────────────────
  { cat: 'Dresses', gender: 'Women', brand: 'Zara', name: 'Floral Print Midi Dress', color: 'Red Floral', base: 2399, rating: 4.6, reviews: 14320, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop' },
  { cat: 'Dresses', gender: 'Women', brand: 'Zara', name: 'Satin Slip Dress', color: 'Champagne', base: 3499, rating: 4.7, reviews: 9870, img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&h=1000&fit=crop' },
  { cat: 'Dresses', gender: 'Women', brand: 'H&M', name: 'Jersey Wrap Midi Dress', color: 'Black', base: 1799, rating: 4.3, reviews: 18430, img: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1000&fit=crop' },
  { cat: 'Dresses', gender: 'Women', brand: 'Mango', name: 'Ruffle Asymmetric Midi Dress', color: 'White', base: 3999, rating: 4.6, reviews: 6780, img: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=800&h=1000&fit=crop' },
  { cat: 'Dresses', gender: 'Women', brand: 'Ralph Lauren', name: 'Linen Shirt Dress', color: 'White', base: 6499, rating: 4.8, reviews: 3120, img: 'https://images.unsplash.com/photo-1508162326617-69e6e7c79dd4?w=800&h=1000&fit=crop' },
  { cat: 'Dresses', gender: 'Women', brand: 'Tommy Hilfiger', name: 'Polka Dot Wrap Dress', color: 'Navy', base: 4999, rating: 4.7, reviews: 4230, img: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&h=1000&fit=crop' },
  { cat: 'Dresses', gender: 'Women', brand: 'H&M', name: 'Broderie Anglaise Cotton Dress', color: 'White', base: 2299, rating: 4.4, reviews: 11230, img: 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=800&h=1000&fit=crop' },

  // ── SNEAKERS ──────────────────────────────────────────────────
  { cat: 'Sneakers', gender: 'Unisex', brand: 'Nike', name: 'Air Force 1 \'07', color: 'White', base: 7999, rating: 4.9, reviews: 89320, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Unisex', brand: 'Nike', name: 'Air Max 270', color: 'Black/Anthracite', base: 8999, rating: 4.8, reviews: 56780, img: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Unisex', brand: 'Nike', name: 'Revolution 6 Next Nature', color: 'Black', base: 4499, rating: 4.5, reviews: 34560, img: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Unisex', brand: 'Nike', name: 'Pegasus 40 Running Shoe', color: 'Blue/White', base: 9999, rating: 4.7, reviews: 28430, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Unisex', brand: 'Adidas', name: 'Stan Smith Sneakers', color: 'White/Green', base: 6999, rating: 4.8, reviews: 72100, img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Unisex', brand: 'Adidas', name: 'Ultraboost 22 Running Shoes', color: 'Core Black', base: 12999, rating: 4.9, reviews: 45670, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Unisex', brand: 'Adidas', name: 'Samba OG Shoes', color: 'White/Black', base: 7999, rating: 4.8, reviews: 38920, img: 'https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Unisex', brand: 'Adidas', name: 'Forum Low Shoes', color: 'White', base: 5999, rating: 4.6, reviews: 21340, img: 'https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Unisex', brand: 'Puma', name: 'Suede Classic XXI', color: 'Black', base: 4999, rating: 4.5, reviews: 18760, img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Men', brand: 'New Balance', name: '574 Core Sneakers', color: 'Grey', base: 6499, rating: 4.7, reviews: 29450, img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=800&h=1000&fit=crop' },
  { cat: 'Sneakers', gender: 'Men', brand: 'New Balance', name: '990v5 Made in USA', color: 'Grey', base: 14999, rating: 4.9, reviews: 9870, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop' },

  // ── PANTS & TROUSERS ──────────────────────────────────────────
  { cat: 'Pants', gender: 'Men', brand: 'Nike', name: 'Tech Fleece Jogger Pants', color: 'Black', base: 4499, rating: 4.7, reviews: 31240, img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop' },
  { cat: 'Pants', gender: 'Men', brand: 'Adidas', name: 'Tiro 23 Track Pants', color: 'Black', base: 2499, rating: 4.5, reviews: 22340, img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop' },
  { cat: 'Pants', gender: 'Men', brand: 'H&M', name: 'Slim Fit Chino Pants', color: 'Khaki', base: 1799, rating: 4.2, reviews: 16780, img: 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=800&h=1000&fit=crop' },
  { cat: 'Pants', gender: 'Men', brand: 'Zara', name: 'Relaxed Fit Cargo Pants', color: 'Olive Green', base: 3299, rating: 4.5, reviews: 8870, img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop' },
  { cat: 'Pants', gender: 'Men', brand: 'Mango', name: 'Slim Fit Carrot Pants', color: 'Sand', base: 2999, rating: 4.3, reviews: 5670, img: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&h=1000&fit=crop' },
  { cat: 'Pants', gender: 'Women', brand: 'Zara', name: 'High-Waist Wide Leg Trousers', color: 'Camel', base: 3299, rating: 4.5, reviews: 12340, img: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=800&h=1000&fit=crop' },
  { cat: 'Pants', gender: 'Women', brand: 'Nike', name: 'Sportswear Essential Leggings', color: 'Black', base: 2999, rating: 4.6, reviews: 28760, img: 'https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=800&h=1000&fit=crop' },
  { cat: 'Pants', gender: 'Women', brand: 'H&M', name: 'Flared Suit Trousers', color: 'Black', base: 1999, rating: 4.3, reviews: 14230, img: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800&h=1000&fit=crop' },

  // ── ETHNIC WEAR ──────────────────────────────────────────────
  { cat: 'Ethnic', gender: 'Women', brand: 'W', name: 'Cotton Embroidered Kurti', color: 'Navy Blue', base: 899, rating: 4.5, reviews: 34560, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop' },
  { cat: 'Ethnic', gender: 'Women', brand: 'W', name: 'Chanderi Silk Anarkali Kurta', color: 'Mint Green', base: 1799, rating: 4.6, reviews: 18920, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop' },
  { cat: 'Ethnic', gender: 'Women', brand: 'Biba', name: 'Floral Print Kurta', color: 'Yellow', base: 1299, rating: 4.4, reviews: 22340, img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&h=1000&fit=crop' },
  { cat: 'Ethnic', gender: 'Women', brand: 'Biba', name: 'Embroidered Palazzo Suit', color: 'Peach', base: 2499, rating: 4.5, reviews: 14560, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop' },
  { cat: 'Ethnic', gender: 'Women', brand: 'Kurtis By Varsha', name: 'Block Print Rayon Kurti', color: 'Teal', base: 799, rating: 4.2, reviews: 9870, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop' },
  { cat: 'Ethnic', gender: 'Men', brand: 'Manyavar', name: 'Cotton Kurta Pajama Set', color: 'White', base: 2999, rating: 4.8, reviews: 28430, img: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&h=1000&fit=crop' },
  { cat: 'Ethnic', gender: 'Men', brand: 'Manyavar', name: 'Silk Blend Sherwani', color: 'Cream Gold', base: 12999, rating: 4.7, reviews: 6780, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=800&h=1000&fit=crop' },
  { cat: 'Ethnic', gender: 'Men', brand: 'W', name: 'Handloom Cotton Kurta', color: 'Off White', base: 1299, rating: 4.4, reviews: 11230, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&h=1000&fit=crop' },

  // ── ACCESSORIES ───────────────────────────────────────────────
  { cat: 'Accessories', gender: 'Unisex', brand: "Levi's", name: 'Reversible Leather Belt', color: 'Black/Brown', base: 1299, rating: 4.4, reviews: 9870, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1000&fit=crop' },
  { cat: 'Accessories', gender: 'Unisex', brand: 'Nike', name: 'Heritage 86 Cap', color: 'Black', base: 1299, rating: 4.5, reviews: 12340, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop' },
  { cat: 'Accessories', gender: 'Unisex', brand: 'Adidas', name: 'Classic Backpack', color: 'Black', base: 2499, rating: 4.6, reviews: 18760, img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop' },
  { cat: 'Accessories', gender: 'Unisex', brand: 'H&M', name: 'Canvas Shopper Tote Bag', color: 'Natural', base: 699, rating: 4.1, reviews: 6780, img: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=1000&fit=crop' },
  { cat: 'Accessories', gender: 'Women', brand: 'Zara', name: 'Crossbody Mini Bag', color: 'Black', base: 3999, rating: 4.6, reviews: 8920, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1000&fit=crop' },
  { cat: 'Accessories', gender: 'Women', brand: 'Mango', name: 'Quilted Mini Shoulder Bag', color: 'Camel', base: 2999, rating: 4.5, reviews: 5670, img: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop' },
  { cat: 'Accessories', gender: 'Men', brand: 'Ralph Lauren', name: 'Pebbled Leather Wallet', color: 'Dark Brown', base: 3499, rating: 4.7, reviews: 4320, img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&h=1000&fit=crop' },
  { cat: 'Accessories', gender: 'Unisex', brand: 'H&M', name: 'Retro Oval Sunglasses', color: 'Tortoise Shell', base: 999, rating: 4.3, reviews: 7650, img: 'https://images.unsplash.com/photo-1590736969955-71cc94901144?w=800&h=1000&fit=crop' },
  { cat: 'Accessories', gender: 'Unisex', brand: 'Tommy Hilfiger', name: 'Signature Logo Backpack', color: 'Navy', base: 3999, rating: 4.6, reviews: 9870, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1000&fit=crop' },
  { cat: 'Accessories', gender: 'Unisex', brand: 'Fossil', name: 'Gen 6 Smartwatch', color: 'Rose Gold', base: 19999, rating: 4.5, reviews: 6780, img: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=1000&fit=crop' },

  // ── SKIRTS ────────────────────────────────────────────────────
  { cat: 'Skirts', gender: 'Women', brand: 'Zara', name: 'Pleated Mini Skirt', color: 'Black', base: 2799, rating: 4.5, reviews: 11230, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4bae73?w=800&h=1000&fit=crop' },
  { cat: 'Skirts', gender: 'Women', brand: 'Zara', name: 'Satin Midi Skirt', color: 'Chocolate Brown', base: 3199, rating: 4.6, reviews: 8920, img: 'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=800&h=1000&fit=crop' },
  { cat: 'Skirts', gender: 'Women', brand: 'H&M', name: 'Flowy Maxi Boho Skirt', color: 'Mustard Yellow', base: 1699, rating: 4.3, reviews: 14560, img: 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&h=1000&fit=crop' },
  { cat: 'Skirts', gender: 'Women', brand: 'Mango', name: 'Denim Mini Skirt', color: 'Light Wash', base: 2299, rating: 4.4, reviews: 9870, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4bae73?w=800&h=1000&fit=crop' },
  { cat: 'Skirts', gender: 'Women', brand: 'H&M', name: 'Jersey Mini Skirt', color: 'Black', base: 999, rating: 4.2, reviews: 21340, img: 'https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=800&h=1000&fit=crop' },
];

async function main() {
  console.log('🌱 Seeding FashionHub database with', CATALOG.length, 'products...\n');

  // Clean previous data
  await prisma.priceHistory.deleteMany({});
  await prisma.platformListing.deleteMany({});
  await prisma.product.deleteMany({});

  let productCount = 0;
  let listingCount = 0;
  let historyCount = 0;

  for (const item of CATALOG) {
    const productHash = `${item.brand}-${item.name}-${item.cat}`.toLowerCase().replace(/\s+/g, '-');

    const product = await prisma.product.create({
      data: {
        unifiedTitle: item.name,
        unifiedBrand: item.brand,
        category: item.cat,
        gender: item.gender,
        color: item.color,
        primaryImageUrl: item.img,
        globalAverageRating: item.rating,
        totalReviews: item.reviews,
        productHash,
        tags: [item.cat, item.brand, item.gender, item.color],
        basePrice: item.base,
      },
    });
    productCount++;

    const platformPrices = generatePlatformPrices(item.base);

    for (const platform of PLATFORMS) {
      const currentPrice = platformPrices[platform];
      const originalPrice = roundToTen(currentPrice * (1 + rand(10, 40) / 100));
      const platformRating = parseFloat((item.rating + (Math.random() * 0.4 - 0.2)).toFixed(1));
      const platformReviews = Math.floor(item.reviews * (0.1 + Math.random() * 0.6));

      const listing = await prisma.platformListing.create({
        data: {
          productId: product.id,
          platformDomain: platform,
          sourceUrl: buildSourceUrl(platform, item.brand, item.name),
          currentPrice,
          originalPrice,
          customPlatformRating: Math.min(5, Math.max(1, platformRating)),
          platformReviews,
          inStock: Math.random() > 0.07, // 93% in stock
        },
      });
      listingCount++;

      // Generate 180-day price history
      const history = generatePriceHistory(item.base);
      await prisma.priceHistory.createMany({
        data: history.map(h => ({
          listingId: listing.id,
          priceRecorded: h.price,
          timestamp: h.timestamp,
        })),
      });
      historyCount += history.length;
    }

    if (productCount % 10 === 0) {
      console.log(`  ✅ Seeded ${productCount} products...`);
    }
  }

  // Compute lowest ever price for each listing based on its history
  const allListings = await prisma.platformListing.findMany({ include: { priceHistory: true } });
  for (const listing of allListings) {
    if (listing.priceHistory.length > 0) {
      const lowestEver = Math.min(...listing.priceHistory.map(h => h.priceRecorded));
      await prisma.platformListing.update({
        where: { id: listing.id },
        data: { lowestEverPrice: lowestEver },
      });
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log(`📦 Products: ${productCount}`);
  console.log(`🏪 Platform Listings: ${listingCount} (${productCount} × ${PLATFORMS.length} platforms)`);
  console.log(`📈 Price History Records: ${historyCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
