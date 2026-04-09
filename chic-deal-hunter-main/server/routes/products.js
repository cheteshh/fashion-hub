const express = require('express');
const db = require('../db');

const router = express.Router();

// Get all products
router.get('/', (req, res) => {
  // basic filtering can be handled here if query params provided
  const search = req.query.q;
  let query = 'SELECT * FROM products';
  let params = [];

  if (search) {
    query += ' WHERE name LIKE ? OR category LIKE ? OR brand LIKE ?';
    params = [`%${search}%`, `%${search}%`, `%${search}%`];
  }

  db.all(query, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    
    // Parse JSON strings back to objects
    const products = rows.map(r => ({
      ...r,
      sizes: JSON.parse(r.sizes || '[]'),
      prices: JSON.parse(r.prices || '{}'),
      priceHistory: JSON.parse(r.priceHistory || '[]')
    }));

    res.json(products);
  });
});

// Get single product
router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM products WHERE id = ?`, [req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!row) return res.status(404).json({ error: 'Product not found' });

    const product = {
      ...row,
      sizes: JSON.parse(row.sizes || '[]'),
      prices: JSON.parse(row.prices || '{}'),
      priceHistory: JSON.parse(row.priceHistory || '[]')
    };
    
    res.json(product);
  });
});

module.exports = router;
