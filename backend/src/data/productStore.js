/**
 * In-memory product store with price history generation.
 * Loads products.json and enriches each platform listing with
 * 180-day synthetic price history for charts.
 */

const fs = require("fs");
const path = require("path");

let products = [];
let alerts = [];
let price_history = []; // Simulated database table: id, product_id, platform, price, timestamp

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

  // Initialize the price_history table from the generated data
  for (const product of products) {
    for (const platform of product.platforms) {
      if (platform.priceHistory) {
        for (const historyEntry of platform.priceHistory) {
          price_history.push({
            id: historyEntry.id,
            product_id: product.id,
            platform: platform.platformDomain,
            price: historyEntry.priceRecorded,
            timestamp: historyEntry.timestamp
          });
        }
      }
    }
  }
}

// ── Price Tracking Interval (Every 6 Hours) ───────────────────
function startPriceTracker() {
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  
  setInterval(() => {
    console.log("⏱️ Running scheduled 6-hour price update...");
    const now = new Date().toISOString();
    
    // Simulate updating prices for each product listing
    products.forEach((product) => {
      product.platforms.forEach((platform) => {
        // Randomly simulate a slight price drift
        const drift = Math.floor(Math.random() * 101) - 20; // -20 to +80
        platform.currentPrice = Math.max(100, platform.currentPrice + drift);
        
        // Insert into price_history table
        price_history.push({
          id: `ph_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
          product_id: product.id,
          platform: platform.platformDomain,
          price: platform.currentPrice,
          timestamp: now
        });
      });
    });
  }, SIX_HOURS);
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

function getPriceHistoryData(productId) {
  return price_history.filter(entry => entry.product_id === productId);
}

module.exports = {
  loadProducts,
  getAllProducts,
  getProductById,
  addAlert,
  getAlerts,
  getPriceHistoryData,
  startPriceTracker,
};
