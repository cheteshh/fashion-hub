/**
 * Product Controller — all business logic for product APIs.
 * Pure functions that operate on the in-memory product store.
 */

const { getAllProducts, getProductById, addAlert, getAlerts } = require("../data/productStore");

// ── Helpers ───────────────────────────────────────────────────
function fuzzyMatch(text, query) {
  if (!text || !query) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

function getCheapestPrice(platforms) {
  if (!platforms.length) return Infinity;
  return Math.min(...platforms.map((p) => p.currentPrice));
}

function getDiscountPct(original, current) {
  if (!original || original <= current) return 0;
  return Math.round(((original - current) / original) * 100);
}

// ═══════════════════════════════════════════════════════════════
//  CONTROLLERS
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/v1/products
 * Supports: category, brand, gender, q, minPrice, maxPrice,
 *           platform, sort, page, limit
 */
function listProducts(req, res) {
  try {
    const {
      category, brand, gender, q,
      minPrice, maxPrice, platform,
      sort = "createdAt",
      page = "1", limit = "24",
    } = req.query;

    let results = getAllProducts();

    // ── Filters ──────────────────────────────────────────────
    if (category) {
      results = results.filter((p) =>
        p.category.toLowerCase() === category.toLowerCase()
      );
    }
    if (brand) {
      results = results.filter((p) =>
        p.unifiedBrand.toLowerCase() === brand.toLowerCase()
      );
    }
    if (gender && gender !== "all") {
      results = results.filter(
        (p) => p.gender.toLowerCase() === gender.toLowerCase() || p.gender === "Unisex"
      );
    }
    if (q) {
      results = results.filter(
        (p) =>
          fuzzyMatch(p.unifiedTitle, q) ||
          fuzzyMatch(p.unifiedBrand, q) ||
          fuzzyMatch(p.category, q) ||
          p.tags.some((t) => fuzzyMatch(t, q))
      );
    }
    if (minPrice) {
      const min = parseFloat(minPrice);
      results = results.filter((p) =>
        p.platforms.some((pl) => pl.currentPrice >= min)
      );
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      results = results.filter((p) =>
        p.platforms.some((pl) => pl.currentPrice <= max)
      );
    }
    if (platform) {
      results = results.filter((p) =>
        p.platforms.some((pl) => pl.platformDomain.toLowerCase() === platform.toLowerCase())
      );
    }

    // ── Sort ─────────────────────────────────────────────────
    if (sort === "rating") {
      results.sort((a, b) => b.globalAverageRating - a.globalAverageRating);
    } else if (sort === "reviews") {
      results.sort((a, b) => b.totalReviews - a.totalReviews);
    } else if (sort === "price_asc") {
      results.sort((a, b) => getCheapestPrice(a.platforms) - getCheapestPrice(b.platforms));
    } else if (sort === "price_desc") {
      results.sort((a, b) => getCheapestPrice(b.platforms) - getCheapestPrice(a.platforms));
    } else {
      // Default: newest first
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // ── Pagination ───────────────────────────────────────────
    const total = results.length;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;
    const paginated = results.slice(skip, skip + limitNum);

    // Strip priceHistory from list responses for performance
    const stripped = paginated.map((p) => ({
      ...p,
      platforms: p.platforms.map(({ priceHistory, ...rest }) => rest),
    }));

    res.json({
      products: stripped,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("Error listing products:", err);
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/v1/products/deals — biggest price drops
 */
function listDeals(req, res) {
  try {
    const all = getAllProducts();
    const deals = [];

    for (const product of all) {
      for (const platform of product.platforms) {
        if (!platform.originalPrice || !platform.inStock) continue;
        const discountPct = getDiscountPct(platform.originalPrice, platform.currentPrice);
        if (discountPct > 10) {
          deals.push({
            ...platform,
            priceHistory: undefined,
            discountPct,
            product: {
              id: product.id,
              unifiedTitle: product.unifiedTitle,
              unifiedBrand: product.unifiedBrand,
              primaryImageUrl: product.primaryImageUrl,
              category: product.category,
            },
          });
        }
      }
    }

    // Sort by discount percentage, de-duplicate by product
    deals.sort((a, b) => b.discountPct - a.discountPct);
    const seen = new Set();
    const unique = deals.filter((d) => {
      if (seen.has(d.product.id)) return false;
      seen.add(d.product.id);
      return true;
    });

    res.json(unique.slice(0, 20));
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/v1/products/trending — highest rated products
 */
function listTrending(req, res) {
  try {
    const limit = parseInt(req.query.limit || "12");
    const all = getAllProducts();

    const sorted = [...all]
      .sort((a, b) => {
        const ratingDiff = b.globalAverageRating - a.globalAverageRating;
        return ratingDiff !== 0 ? ratingDiff : b.totalReviews - a.totalReviews;
      })
      .slice(0, limit);

    // Strip priceHistory
    const stripped = sorted.map((p) => ({
      ...p,
      platforms: p.platforms.map(({ priceHistory, ...rest }) => rest),
    }));

    res.json(stripped);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/v1/products/new-arrivals — newest products
 */
function listNewArrivals(req, res) {
  try {
    const all = getAllProducts();
    const sorted = [...all]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 12);

    const stripped = sorted.map((p) => ({
      ...p,
      platforms: p.platforms.map(({ priceHistory, ...rest }) => rest),
    }));

    res.json(stripped);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/v1/products/:id — full product with price history
 */
function getProduct(req, res) {
  try {
    const product = getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/v1/price-history/:productId
 */
function getPriceHistory(req, res) {
  try {
    const product = getProductById(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    const { days = "30", platform } = req.query;
    const daysNum = parseInt(days);
    const sinceDate = new Date(Date.now() - daysNum * 86400000);

    let listings = product.platforms;
    if (platform) {
      listings = listings.filter(
        (l) => l.platformDomain.toLowerCase() === platform.toLowerCase()
      );
    }

    const result = listings.map((l) => ({
      platformDomain: l.platformDomain,
      currentPrice: l.currentPrice,
      priceHistory: (l.priceHistory || []).filter(
        (h) => new Date(h.timestamp) >= sinceDate
      ),
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/v1/search — search products
 */
function searchProducts(req, res) {
  // Reuse listProducts with q parameter
  if (!req.query.q) {
    return res.status(400).json({ error: "q param required" });
  }
  return listProducts(req, res);
}

/**
 * GET /api/v1/categories — distinct categories with counts
 */
function listCategories(req, res) {
  try {
    const all = getAllProducts();
    const catMap = {};
    for (const product of all) {
      catMap[product.category] = (catMap[product.category] || 0) + 1;
    }
    const categories = Object.entries(catMap).map(([category, _count]) => ({
      category,
      _count,
    }));
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/v1/brands — distinct brands with counts
 */
function listBrands(req, res) {
  try {
    const all = getAllProducts();
    const brandMap = {};
    for (const product of all) {
      brandMap[product.unifiedBrand] = (brandMap[product.unifiedBrand] || 0) + 1;
    }
    const brands = Object.entries(brandMap)
      .map(([unifiedBrand, _count]) => ({ unifiedBrand, _count }))
      .sort((a, b) => b._count - a._count);
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * POST /api/v1/alerts — set a price alert
 */
function createAlert(req, res) {
  try {
    const { productId, targetPrice, email } = req.body;
    if (!productId || !targetPrice || !email) {
      return res.status(400).json({ error: "productId, targetPrice, and email required" });
    }
    const product = getProductById(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    const alert = addAlert({ productId, targetPrice: parseFloat(targetPrice), email });
    res.json({ message: "Alert set successfully", alert });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

/**
 * GET /api/v1/alerts — list all alerts
 */
function listAlerts(req, res) {
  try {
    res.json(getAlerts());
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
}

module.exports = {
  listProducts,
  listDeals,
  listTrending,
  listNewArrivals,
  getProduct,
  getPriceHistory,
  searchProducts,
  listCategories,
  listBrands,
  createAlert,
  listAlerts,
};
