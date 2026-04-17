/**
 * Product Routes — maps API endpoints to controller functions.
 * All routes are prefixed with /api/v1 in server.js.
 */

const { Router } = require("express");
const ctrl = require("../controllers/productController");

const router = Router();

// ── Product listing & discovery ──────────────────────────────
router.get("/products",           ctrl.listProducts);
router.get("/products/deals",     ctrl.listDeals);
router.get("/products/trending",  ctrl.listTrending);
router.get("/products/new-arrivals", ctrl.listNewArrivals);

// ── Single product (must be AFTER /products/:special routes) ─
router.get("/products/:id",       ctrl.getProduct);

// ── Price history ────────────────────────────────────────────
router.get("/price-history/:productId", ctrl.getPriceHistory);

// ── Search ───────────────────────────────────────────────────
router.get("/search",             ctrl.searchProducts);

// ── Metadata ─────────────────────────────────────────────────
router.get("/categories",         ctrl.listCategories);
router.get("/brands",             ctrl.listBrands);

// ── Price alerts ─────────────────────────────────────────────
router.post("/alerts",            ctrl.createAlert);
router.get("/alerts",             ctrl.listAlerts);

module.exports = router;
