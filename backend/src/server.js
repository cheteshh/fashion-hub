/**
 * FashionHub Aggregator API — Server Entry Point
 *
 * Lightweight Express server with JSON data store.
 * No external database required — just  npm install && npm start.
 *
 * API Prefix: /api/v1
 */

const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const simpleRoutes = require("./routes/simpleRoutes");
// const { loadProducts } = require("./data/productStore"); // Replaced by requiring whole store below

const app = express();
const PORT = process.env.PORT || 4000;

// ── Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());

// ── Health check ────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    name: "FashionHub Aggregator API",
    version: "1.0.0",
    simple_api: {
      allProducts:    "GET  /products",
      singleProduct:  "GET  /product/:id",
      byCategory:     "GET  /products?category=shoes",
      byBrand:        "GET  /products?brand=Nike",
    },
    advanced_api: {
      products:      "GET  /api/v1/products?category=Sneakers&brand=Nike&sort=rating&page=1",
      product:       "GET  /api/v1/products/:id",
      deals:         "GET  /api/v1/products/deals",
      trending:      "GET  /api/v1/products/trending",
      search:        "GET  /api/v1/search?q=air+force",
      priceHistory:  "GET  /api/v1/price-history/:productId",
      categories:    "GET  /api/v1/categories",
      brands:        "GET  /api/v1/brands",
      setAlert:      "POST /api/v1/alerts",
    },
  });
});

// ── Simple API (GET /products, GET /product/:id) ────────────
app.use(simpleRoutes);

// ── Advanced API (/api/v1/*) ────────────────────────────────
app.use("/api/v1", productRoutes);

// ── 404 handler ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Error handler ───────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ── Bootstrap ───────────────────────────────────────────────
function start() {
  try {
    const store = require("./data/productStore");
    store.loadProducts(); // hydrate in-memory store from products.json
    store.startPriceTracker(); // boot up 6-hour cron simulator

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║  🚀  FashionHub API — http://localhost:${PORT}      ║
╠══════════════════════════════════════════════════╣
║                                                  ║
║  Simple API:                                     ║
║  📦  GET  /products                              ║
║  📦  GET  /product/:id                           ║
║                                                  ║
║  Advanced API:                                   ║
║  📦  GET  /api/v1/products                       ║
║  📦  GET  /api/v1/products/:id                   ║
║  🔥  GET  /api/v1/products/deals                 ║
║  📈  GET  /api/v1/products/trending              ║
║  🔍  GET  /api/v1/search?q=nike                  ║
║  📊  GET  /api/v1/price-history/:productId       ║
║  🔔  POST /api/v1/alerts                         ║
║  🏷️   GET  /api/v1/categories                     ║
║  🏪  GET  /api/v1/brands                         ║
║                                                  ║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
