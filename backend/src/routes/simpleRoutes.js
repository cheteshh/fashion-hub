/**
 * Simple Product Routes — matches the user's exact API spec:
 *   GET /products
 *   GET /product/:id
 *
 * Uses the simplified field naming:
 *   { id, name, brand, image_url, category, platforms: [{ platform_name, price, product_url, rating }] }
 */

const { Router } = require("express");
const { getAllProducts, getProductById } = require("../data/productStore");

const router = Router();

// ── Transform to simple format ──────────────────────────────
function toSimpleFormat(product) {
  return {
    id: product.id,
    name: product.unifiedTitle,
    brand: product.unifiedBrand,
    image_url: product.primaryImageUrl,
    category: product.category,
    platforms: product.platforms.map((p) => ({
      platform_name: formatPlatformName(p.platformDomain),
      price: p.currentPrice,
      product_url: p.sourceUrl,
      rating: p.customPlatformRating,
    })),
  };
}

function formatPlatformName(domain) {
  const names = {
    myntra: "Myntra",
    amazon: "Amazon",
    flipkart: "Flipkart",
    ajio: "AJIO",
    tatacliq: "Tata CLiQ",
  };
  return names[domain] || domain;
}

// ── GET /products ────────────────────────────────────────────
router.get("/products", (req, res) => {
  try {
    const { category, brand } = req.query;
    let products = getAllProducts();

    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (brand) {
      products = products.filter(
        (p) => p.unifiedBrand.toLowerCase() === brand.toLowerCase()
      );
    }

    res.json(products.map(toSimpleFormat));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── GET /product/:id ─────────────────────────────────────────
router.get("/product/:id", (req, res) => {
  try {
    const product = getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(toSimpleFormat(product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
