const express = require("express");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const { loadProducts } = require("./data/productStore");

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({
    status: "ok",
    message: "Product Aggregator API is running",
    endpoints: {
      allProducts: "GET /products",
      singleProduct: "GET /product/:id",
      filterByCategory: "GET /products?category=shoes",
      filterByBrand: "GET /products?brand=Nike",
      search: "GET /products?search=air+force",
    },
  });
});

// ── Routes ──────────────────────────────────────────────────
app.use(productRoutes);

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
async function start() {
  try {
    loadProducts();                           // hydrate in-memory store
    app.listen(PORT, () => {
      console.log(`\n🚀  Server running at http://localhost:${PORT}`);
      console.log(`📦  GET /products`);
      console.log(`📦  GET /product/:id\n`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1);
  }
}

start();
