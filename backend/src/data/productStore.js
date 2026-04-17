/**
 * In-memory product store with price history generation.
 * Loads products.json and enriches each platform listing with
 * 180-day synthetic price history for charts.
 */

const fs = require("fs");
const path = require("path");

let products = [];
let alerts = [];

// ── Price History Generator ───────────────────────────────────
function generatePriceHistory(basePrice, days = 180) {
  const history = [];
  let price = basePrice + Math.floor(Math.random() * 1500) + 500;
  const now = new Date();

  for (let d = days; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(date.getDate() - d);

    // Simulate sale events every ~25-35 days
    const isSaleDay = d % (25 + Math.floor(Math.random() * 11)) === 0;
    if (isSaleDay) {
      price = Math.round((basePrice * (0.7 + Math.random() * 0.15)) / 10) * 10;
    } else {
      const drift = Math.floor(Math.random() * 351) - 150;
      price = Math.round(Math.max(basePrice * 0.6, price + drift) / 10) * 10;
    }
    history.push({
      id: `ph_${d}_${Math.random().toString(36).slice(2, 7)}`,
      priceRecorded: price,
      timestamp: date.toISOString(),
    });
  }
  return history;
}

// ── Load & Enrich Products ────────────────────────────────────
function loadProducts() {
  const filePath = path.join(__dirname, "products.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  const parsed = JSON.parse(raw);

  products = parsed.map((product) => {
    const enrichedPlatforms = product.platforms.map((platform) => ({
      ...platform,
      priceHistory: generatePriceHistory(platform.currentPrice),
    }));
    return {
      ...product,
      createdAt: new Date(
        Date.now() - Math.floor(Math.random() * 90) * 86400000
      ).toISOString(),
      updatedAt: new Date().toISOString(),
      platforms: enrichedPlatforms,
    };
  });

  console.log(`📦 Loaded ${products.length} products with price history`);
}

// ── Getters ───────────────────────────────────────────────────
function getAllProducts() {
  return products;
}

function getProductById(id) {
  return products.find((p) => p.id === id) || null;
}

// ── Alerts Store ──────────────────────────────────────────────
function addAlert(alert) {
  const newAlert = {
    id: `alert_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    ...alert,
    triggered: false,
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  return newAlert;
}

function getAlerts() {
  return alerts;
}

module.exports = {
  loadProducts,
  getAllProducts,
  getProductById,
  addAlert,
  getAlerts,
};
