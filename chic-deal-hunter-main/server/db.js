const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Connected to SQLite database.');

db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    email TEXT UNIQUE,
    password TEXT
  )`);

  // Products table
  db.run(`CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT,
    brand TEXT,
    color TEXT,
    sizes TEXT,
    image TEXT,
    category TEXT,
    gender TEXT,
    rating REAL,
    reviews INTEGER,
    prices TEXT,
    priceHistory TEXT
  )`);
});

module.exports = db;
