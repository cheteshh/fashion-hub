const db = require('./db');

const initialProducts = [
  {
    id: "p1",
    name: "Oversized Graphic T-Shirt",
    brand: "Urban Basics",
    color: "Black",
    sizes: JSON.stringify(["S", "M", "L", "XL"]),
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab",
    category: "T-Shirts",
    gender: "Unisex",
    rating: 4.5,
    reviews: 128,
    prices: JSON.stringify({ myntra: 899, amazon: 950, flipkart: 890, ajio: 999 }),
    priceHistory: JSON.stringify([
        { date: "2026-03-01", price: 950 },
        { date: "2026-03-15", price: 899 }
    ])
  },
  {
    id: "p2",
    name: "Classic Denim Jacket",
    brand: "Denim Co.",
    color: "Blue",
    sizes: JSON.stringify(["M", "L", "XL"]),
    image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1",
    category: "Jackets",
    gender: "Unisex",
    rating: 4.8,
    reviews: 245,
    prices: JSON.stringify({ myntra: 2499, amazon: 2599, flipkart: 2399, ajio: 2799 }),
    priceHistory: JSON.stringify([])
  },
  {
    id: "p3",
    name: "Minimalist Sneakers",
    brand: "Step Ahead",
    color: "White",
    sizes: JSON.stringify(["7", "8", "9", "10", "11"]),
    image: "https://images.unsplash.com/photo-1516822003754-cca485356ecb",
    category: "Footwear",
    gender: "Men",
    rating: 4.3,
    reviews: 89,
    prices: JSON.stringify({ myntra: 1999, amazon: 1899, flipkart: 1950, ajio: 2099 }),
    priceHistory: JSON.stringify([])
  },
  {
    id: "p4",
    name: "Summer Floral Dress",
    brand: "Chic Style",
    color: "Pink",
    sizes: JSON.stringify(["XS", "S", "M"]),
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8",
    category: "Dresses",
    gender: "Women",
    rating: 4.6,
    reviews: 156,
    prices: JSON.stringify({ myntra: 1499, amazon: 1550, flipkart: 1450, ajio: 1599 }),
    priceHistory: JSON.stringify([])
  }
];

db.serialize(() => {
  const stmt = db.prepare(`INSERT INTO products (id, name, brand, color, sizes, image, category, gender, rating, reviews, prices, priceHistory) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

  initialProducts.forEach((p) => {
    stmt.run([p.id, p.name, p.brand, p.color, p.sizes, p.image, p.category, p.gender, p.rating, p.reviews, p.prices, p.priceHistory], function(err) {
      if (err) {
        if (!err.message.includes('UNIQUE constraint failed')) {
          console.error("Error inserting product:", err.message);
        }
      } else {
        console.log(`Inserted product: ${p.name}`);
      }
    });
  });

  stmt.finalize(() => {
    console.log("Seeding complete.");
    // Do not close so that async insert queue can flush normally
    // For a real script we would wrap in Promises, but for sqlite3 serialize it handles it
  });
});
