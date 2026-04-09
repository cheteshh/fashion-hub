const fs = require("fs");
const path = require("path");

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];
const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];

function makePriceHistory(base) {
  let p = base + rand(400, 1200);
  return MONTHS.map((date) => {
    const price = Math.max(base + 50, p - rand(50, 300));
    p = price;
    return { date, price: Math.round(price / 10) * 10 };
  });
}

function makePrices(base) {
  // Shuffle price tiers so every platform has equal chance of being cheapest
  const TIERS = [-150, -30, 120, 240];          // one discount, one near-base, two premium
  const shuffled = shuffle(TIERS);
  const platforms = ["myntra", "amazon", "flipkart", "ajio"];
  const result = {};
  platforms.forEach((p, i) => {
    result[p] = Math.max(99, Math.round((base + shuffled[i] + rand(-30, 30)) / 10) * 10);
  });
  return result;
}

const IMAGES = {
  "Shirts":      ["https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1602810316498-ab67cf68c8e1?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1607345366928-199ea26cfe3e?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1625910513413-5fc830c70cb0?w=400&h=500&fit=crop"],
  "T-Shirts":    ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1618354691792-d1d42acfd860?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1559582798-678dfc71ccd8?w=400&h=500&fit=crop"],
  "Hoodies":     ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1509942774463-acf339cf87d5?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1578768079052-aa76e52ff62e?w=400&h=500&fit=crop"],
  "Jackets":     ["https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1521223890158-f9f7c3d5d504?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1548369937-47519962c11a?w=400&h=500&fit=crop"],
  "Jeans":       ["https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1475178626620-a4d074967452?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1604176354204-9268737828e4?w=400&h=500&fit=crop"],
  "Dresses":     ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1508162326617-69e6e7c79dd4?w=400&h=500&fit=crop"],
  "Pants":       ["https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1519058082700-08a0b56da9b4?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400&h=500&fit=crop"],
  "Ethnic":      ["https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=400&h=500&fit=crop"],
  "Skirts":      ["https://images.unsplash.com/photo-1594938298603-c8148c4bae73?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1571513800374-df1bbe650e56?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400&h=500&fit=crop"],
  "Sneakers":    ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1584735175315-9d5df23be620?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=400&h=500&fit=crop"],
  "Accessories": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400&h=500&fit=crop","https://images.unsplash.com/photo-1590736969955-71cc94901144?w=400&h=500&fit=crop"],
};

const FALLBACK = "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?w=400&h=500&fit=crop";
const imgCounters = {};
function getImage(cat) {
  const pool = IMAGES[cat] || IMAGES["T-Shirts"];
  const i = imgCounters[cat] || 0;
  imgCounters[cat] = (i + 1) % pool.length;
  return pool[i] || FALLBACK;
}

const RATINGS = [3.8,3.9,4.0,4.1,4.2,4.3,4.4,4.5,4.6,4.7,4.8];

const CATALOG = [
  {cat:"T-Shirts",gender:"Men",brand:"H&M",name:"Basic Crew Tee",color:"White",sizes:["S","M","L","XL"],base:599},
  {cat:"T-Shirts",gender:"Men",brand:"H&M",name:"Essential V-Neck Tee",color:"Navy",sizes:["S","M","L","XL"],base:699},
  {cat:"T-Shirts",gender:"Men",brand:"Nike",name:"Dri-FIT Training Tee",color:"Black",sizes:["S","M","L","XL","XXL"],base:1499},
  {cat:"T-Shirts",gender:"Men",brand:"Nike",name:"Sportswear Club Tee",color:"Grey",sizes:["M","L","XL","XXL"],base:1799},
  {cat:"T-Shirts",gender:"Men",brand:"Adidas",name:"3-Stripes Tee",color:"White",sizes:["S","M","L","XL"],base:1299},
  {cat:"T-Shirts",gender:"Men",brand:"Adidas",name:"Trefoil Graphic Tee",color:"Black",sizes:["S","M","L","XL","XXL"],base:1599},
  {cat:"T-Shirts",gender:"Men",brand:"Zara",name:"Textured Polo Tee",color:"Olive",sizes:["S","M","L","XL"],base:1999},
  {cat:"T-Shirts",gender:"Men",brand:"Levi's",name:"Logo Print Tee",color:"Blue",sizes:["M","L","XL"],base:899},
  {cat:"T-Shirts",gender:"Men",brand:"Urbanic",name:"Oversized Drop Shoulder Tee",color:"Cream",sizes:["S","M","L"],base:799},
  {cat:"T-Shirts",gender:"Men",brand:"Ralph Lauren",name:"Striped Polo T-Shirt",color:"Navy",sizes:["M","L","XL"],base:4199},
  {cat:"T-Shirts",gender:"Unisex",brand:"GAP",name:"Softspun Crewneck Tee",color:"White",sizes:["XS","S","M","L","XL"],base:999},
  {cat:"T-Shirts",gender:"Unisex",brand:"Mango",name:"Printed Slogan Tee",color:"Black",sizes:["XS","S","M","L"],base:1199},
  {cat:"T-Shirts",gender:"Women",brand:"H&M",name:"Fitted Rib Tee",color:"Pink",sizes:["XS","S","M","L"],base:599},
  {cat:"T-Shirts",gender:"Women",brand:"Zara",name:"Crop Logo Tee",color:"White",sizes:["XS","S","M","L"],base:1499},
  {cat:"T-Shirts",gender:"Women",brand:"Urbanic",name:"Tie-Dye Graphic Tee",color:"Multicolor",sizes:["S","M","L"],base:849},
  {cat:"T-Shirts",gender:"Women",brand:"Nykaa Fashion",name:"Printed Boxy Tee",color:"Lavender",sizes:["XS","S","M","L"],base:699},
  {cat:"T-Shirts",gender:"Men",brand:"GAP",name:"Graphic Logo Tee",color:"Red",sizes:["S","M","L","XL"],base:849},
  {cat:"T-Shirts",gender:"Men",brand:"Mango",name:"Washed Effect Tee",color:"Stone",sizes:["S","M","L","XL"],base:1299},
  {cat:"T-Shirts",gender:"Women",brand:"Mango",name:"Ruched Crop Tee",color:"White",sizes:["XS","S","M","L"],base:1399},
  {cat:"T-Shirts",gender:"Women",brand:"GAP",name:"Classic Pocket Tee",color:"Blue",sizes:["XS","S","M","L","XL"],base:799},
  {cat:"Shirts",gender:"Men",brand:"H&M",name:"Slim Fit Cotton Shirt",color:"White",sizes:["S","M","L","XL"],base:1099},
  {cat:"Shirts",gender:"Men",brand:"H&M",name:"Oxford Shirt",color:"Blue",sizes:["S","M","L","XL"],base:1299},
  {cat:"Shirts",gender:"Men",brand:"Zara",name:"Linen Blend Shirt",color:"Beige",sizes:["S","M","L","XL"],base:2999},
  {cat:"Shirts",gender:"Men",brand:"Zara",name:"Printed Casual Shirt",color:"Floral",sizes:["S","M","L","XL"],base:3499},
  {cat:"Shirts",gender:"Men",brand:"Levi's",name:"Western Denim Shirt",color:"Blue",sizes:["M","L","XL"],base:2499},
  {cat:"Shirts",gender:"Men",brand:"GAP",name:"Classic Chambray Shirt",color:"Light Blue",sizes:["S","M","L","XL","XXL"],base:2199},
  {cat:"Shirts",gender:"Men",brand:"Mango",name:"Slim Fit Poplin Shirt",color:"White",sizes:["S","M","L","XL"],base:2799},
  {cat:"Shirts",gender:"Men",brand:"Ralph Lauren",name:"Oxford Polo Shirt",color:"Navy",sizes:["M","L","XL"],base:5499},
  {cat:"Shirts",gender:"Men",brand:"Urbanic",name:"Oversized Cuban Collar Shirt",color:"Black",sizes:["S","M","L"],base:1499},
  {cat:"Shirts",gender:"Women",brand:"Zara",name:"Satin Finish Shirt",color:"Ivory",sizes:["XS","S","M","L"],base:2999},
  {cat:"Shirts",gender:"Women",brand:"H&M",name:"Relaxed Linen Shirt",color:"White",sizes:["XS","S","M","L","XL"],base:1499},
  {cat:"Shirts",gender:"Women",brand:"Nykaa Fashion",name:"Printed Tie-Hem Shirt",color:"Blue",sizes:["S","M","L"],base:999},
  {cat:"Shirts",gender:"Men",brand:"Adidas",name:"Checked Flannel Shirt",color:"Red/Black",sizes:["S","M","L","XL"],base:1799},
  {cat:"Shirts",gender:"Men",brand:"Nike",name:"Dri-FIT Polo Shirt",color:"White",sizes:["S","M","L","XL","XXL"],base:2499},
  {cat:"Hoodies",gender:"Men",brand:"Adidas",name:"Essentials Hoodie",color:"Grey",sizes:["M","L","XL"],base:3199},
  {cat:"Hoodies",gender:"Men",brand:"Nike",name:"Club Fleece Pullover Hoodie",color:"Black",sizes:["S","M","L","XL","XXL"],base:3499},
  {cat:"Hoodies",gender:"Men",brand:"H&M",name:"Relaxed Fit Hoodie",color:"Navy",sizes:["S","M","L","XL"],base:1599},
  {cat:"Hoodies",gender:"Men",brand:"GAP",name:"Vintage Soft Hoodie",color:"Brown",sizes:["S","M","L","XL","XXL"],base:2799},
  {cat:"Hoodies",gender:"Men",brand:"Levi's",name:"Logo Pullover Hoodie",color:"Dark Grey",sizes:["M","L","XL"],base:2999},
  {cat:"Hoodies",gender:"Men",brand:"Urbanic",name:"Acid Wash Hoodie",color:"Blue",sizes:["S","M","L"],base:1799},
  {cat:"Hoodies",gender:"Women",brand:"Adidas",name:"All SZN Fleece Hoodie",color:"Pink",sizes:["XS","S","M","L"],base:2999},
  {cat:"Hoodies",gender:"Women",brand:"Nike",name:"Sportswear Phoenix Hoodie",color:"Black",sizes:["XS","S","M","L","XL"],base:3799},
  {cat:"Hoodies",gender:"Women",brand:"H&M",name:"Cropped Zip Hoodie",color:"White",sizes:["XS","S","M","L"],base:1699},
  {cat:"Hoodies",gender:"Women",brand:"Mango",name:"Oversized Hoodie Dress",color:"Beige",sizes:["XS","S","M","L"],base:2499},
  {cat:"Hoodies",gender:"Unisex",brand:"Urbanic",name:"Streetwear Zip-Up Hoodie",color:"Black",sizes:["S","M","L","XL"],base:1999},
  {cat:"Hoodies",gender:"Unisex",brand:"Zara",name:"Textured Knit Hoodie",color:"Olive",sizes:["S","M","L","XL"],base:3299},
  {cat:"Hoodies",gender:"Men",brand:"Mango",name:"Brushed Effect Hoodie",color:"Burgundy",sizes:["S","M","L","XL"],base:2599},
  {cat:"Hoodies",gender:"Women",brand:"Zara",name:"Fur Lined Hoodie",color:"Cream",sizes:["XS","S","M","L"],base:3499},
  {cat:"Jackets",gender:"Men",brand:"Levi's",name:"Classic Denim Jacket",color:"Blue",sizes:["M","L","XL"],base:3599},
  {cat:"Jackets",gender:"Men",brand:"Mango",name:"Leather Biker Jacket",color:"Black",sizes:["S","M","L"],base:5499},
  {cat:"Jackets",gender:"Men",brand:"Zara",name:"Formal Blazer",color:"Charcoal",sizes:["S","M","L","XL"],base:4999},
  {cat:"Jackets",gender:"Men",brand:"H&M",name:"Padded Puffer Jacket",color:"Black",sizes:["S","M","L","XL","XXL"],base:2999},
  {cat:"Jackets",gender:"Men",brand:"Nike",name:"Windrunner Jacket",color:"Navy",sizes:["S","M","L","XL"],base:4499},
  {cat:"Jackets",gender:"Men",brand:"Adidas",name:"Tiro Track Jacket",color:"Black",sizes:["S","M","L","XL","XXL"],base:2799},
  {cat:"Jackets",gender:"Men",brand:"GAP",name:"Harrington Jacket",color:"Tan",sizes:["S","M","L","XL"],base:3799},
  {cat:"Jackets",gender:"Men",brand:"Ralph Lauren",name:"Down Quilted Vest",color:"Navy",sizes:["M","L","XL"],base:6999},
  {cat:"Jackets",gender:"Women",brand:"Zara",name:"Faux Leather Jacket",color:"Camel",sizes:["XS","S","M","L"],base:5999},
  {cat:"Jackets",gender:"Women",brand:"H&M",name:"Quilted Puffer Jacket",color:"Pink",sizes:["XS","S","M","L","XL"],base:2799},
  {cat:"Jackets",gender:"Women",brand:"Mango",name:"Structured Blazer",color:"White",sizes:["XS","S","M","L"],base:4499},
  {cat:"Jackets",gender:"Women",brand:"Levi's",name:"Sherpa Trucker Jacket",color:"Blue",sizes:["S","M","L","XL"],base:4999},
  {cat:"Jackets",gender:"Women",brand:"Urbanic",name:"Cropped Moto Jacket",color:"Black",sizes:["XS","S","M","L"],base:2299},
  {cat:"Jackets",gender:"Men",brand:"Urbanic",name:"Varsity Bomber Jacket",color:"Navy/White",sizes:["S","M","L","XL"],base:2999},
  {cat:"Jackets",gender:"Women",brand:"GAP",name:"Denim Jacket",color:"Light Wash",sizes:["XS","S","M","L","XL"],base:3299},
  {cat:"Jeans",gender:"Men",brand:"Levi's",name:"511 Slim Fit Jeans",color:"Dark Blue",sizes:["28","30","32","34","36"],base:3499},
  {cat:"Jeans",gender:"Men",brand:"Levi's",name:"501 Original Straight Jeans",color:"Mid Blue",sizes:["28","30","32","34","36","38"],base:3999},
  {cat:"Jeans",gender:"Men",brand:"H&M",name:"Slim Tapered Jeans",color:"Black",sizes:["28","30","32","34","36"],base:1999},
  {cat:"Jeans",gender:"Men",brand:"H&M",name:"Regular Fit Jeans",color:"Blue",sizes:["28","30","32","34","36","38"],base:1799},
  {cat:"Jeans",gender:"Men",brand:"GAP",name:"Athletic Taper Jeans",color:"Light Wash",sizes:["28","30","32","34","36"],base:2999},
  {cat:"Jeans",gender:"Men",brand:"Zara",name:"Skinny Fit Jeans",color:"Dark Wash",sizes:["28","30","32","34","36"],base:3299},
  {cat:"Jeans",gender:"Men",brand:"Mango",name:"Carrot Fit Jeans",color:"Tan",sizes:["28","30","32","34","36"],base:2799},
  {cat:"Jeans",gender:"Women",brand:"Levi's",name:"High Rise Skinny Jeans",color:"Dark Blue",sizes:["24","26","28","30","32"],base:3799},
  {cat:"Jeans",gender:"Women",brand:"H&M",name:"Mom Jeans",color:"Light Blue",sizes:["XS","S","M","L","XL"],base:1999},
  {cat:"Jeans",gender:"Women",brand:"Zara",name:"Wide Leg Jeans",color:"Blue",sizes:["XS","S","M","L"],base:3499},
  {cat:"Jeans",gender:"Women",brand:"GAP",name:"Vintage Slim Jeans",color:"Black",sizes:["24","26","28","30"],base:2799},
  {cat:"Jeans",gender:"Women",brand:"Mango",name:"Straight Leg Jeans",color:"White",sizes:["XS","S","M","L"],base:2999},
  {cat:"Jeans",gender:"Women",brand:"Urbanic",name:"Barrel Fit Jeans",color:"Light Wash",sizes:["XS","S","M","L"],base:1699},
  {cat:"Jeans",gender:"Men",brand:"Urbanic",name:"Distressed Baggy Jeans",color:"Blue",sizes:["28","30","32","34"],base:2199},
  {cat:"Jeans",gender:"Women",brand:"Ralph Lauren",name:"High Rise Bootcut Jeans",color:"Dark Wash",sizes:["24","26","28","30","32"],base:5999},
  {cat:"Dresses",gender:"Women",brand:"Zara",name:"Printed Floral Dress",color:"Red",sizes:["XS","S","M","L"],base:2399},
  {cat:"Dresses",gender:"Women",brand:"Zara",name:"Satin Slip Dress",color:"Champagne",sizes:["XS","S","M","L"],base:3499},
  {cat:"Dresses",gender:"Women",brand:"Zara",name:"Mini Wrap Dress",color:"Green",sizes:["XS","S","M","L"],base:2799},
  {cat:"Dresses",gender:"Women",brand:"H&M",name:"Jersey Midi Dress",color:"Black",sizes:["XS","S","M","L","XL"],base:1799},
  {cat:"Dresses",gender:"Women",brand:"H&M",name:"Smocked Tiered Dress",color:"Floral",sizes:["XS","S","M","L"],base:2299},
  {cat:"Dresses",gender:"Women",brand:"Mango",name:"Ruffle Asymmetric Dress",color:"White",sizes:["XS","S","M","L"],base:3999},
  {cat:"Dresses",gender:"Women",brand:"Mango",name:"Knit Bodycon Dress",color:"Camel",sizes:["XS","S","M","L"],base:2999},
  {cat:"Dresses",gender:"Women",brand:"Urbanic",name:"Corset Maxi Dress",color:"Black",sizes:["XS","S","M","L"],base:1999},
  {cat:"Dresses",gender:"Women",brand:"Nykaa Fashion",name:"A-Line Sundress",color:"Yellow",sizes:["XS","S","M","L"],base:1299},
  {cat:"Dresses",gender:"Women",brand:"Nykaa Fashion",name:"Off-Shoulder Midi Dress",color:"Dusty Rose",sizes:["S","M","L"],base:1599},
  {cat:"Dresses",gender:"Women",brand:"GAP",name:"Easy Swing Dress",color:"Navy",sizes:["XS","S","M","L","XL"],base:2499},
  {cat:"Dresses",gender:"Women",brand:"Ralph Lauren",name:"Linen Shirt Dress",color:"White",sizes:["XS","S","M","L","XL"],base:6499},
  {cat:"Dresses",gender:"Women",brand:"H&M",name:"Knit Mini Dress",color:"Grey",sizes:["XS","S","M","L"],base:1999},
  {cat:"Dresses",gender:"Women",brand:"Zara",name:"Broderie Anglaise Dress",color:"White",sizes:["XS","S","M","L"],base:3999},
  {cat:"Pants",gender:"Men",brand:"Nike",name:"Jogger Pants",color:"Black",sizes:["S","M","L","XL","XXL"],base:2699},
  {cat:"Pants",gender:"Men",brand:"Adidas",name:"Tiro Track Pants",color:"Black",sizes:["S","M","L","XL","XXL"],base:2499},
  {cat:"Pants",gender:"Men",brand:"H&M",name:"Slim Chino Pants",color:"Khaki",sizes:["28","30","32","34","36"],base:1799},
  {cat:"Pants",gender:"Men",brand:"GAP",name:"Chino Pants",color:"Beige",sizes:["28","30","32","34","36"],base:2599},
  {cat:"Pants",gender:"Men",brand:"Zara",name:"Wide-Leg Trousers",color:"Charcoal",sizes:["S","M","L","XL"],base:3299},
  {cat:"Pants",gender:"Men",brand:"Mango",name:"Cargo Pants",color:"Olive",sizes:["S","M","L","XL"],base:2999},
  {cat:"Pants",gender:"Women",brand:"Zara",name:"High-Waist Wide Leg Trousers",color:"Cream",sizes:["XS","S","M","L"],base:3299},
  {cat:"Pants",gender:"Women",brand:"H&M",name:"Flared Suit Trousers",color:"Black",sizes:["XS","S","M","L","XL"],base:1999},
  {cat:"Pants",gender:"Women",brand:"Nike",name:"One Luxe Tights",color:"Black",sizes:["XS","S","M","L"],base:2999},
  {cat:"Pants",gender:"Women",brand:"Adidas",name:"Running Training Tights",color:"Pink",sizes:["XS","S","M","L"],base:2799},
  {cat:"Pants",gender:"Women",brand:"Urbanic",name:"Barrel Leg Trousers",color:"Brown",sizes:["XS","S","M","L"],base:1499},
  {cat:"Pants",gender:"Women",brand:"Mango",name:"Linen Blend Trousers",color:"White",sizes:["XS","S","M","L"],base:2499},
  {cat:"Pants",gender:"Men",brand:"Levi's",name:"XX Chino Slim Pants",color:"Khaki",sizes:["28","30","32","34","36"],base:2999},
  {cat:"Pants",gender:"Women",brand:"GAP",name:"High Rise Straight Pants",color:"Navy",sizes:["XS","S","M","L","XL"],base:2299},
  {cat:"Ethnic",gender:"Women",brand:"W",name:"Cotton Kurti",color:"Pink",sizes:["XS","S","M","L","XL"],base:899},
  {cat:"Ethnic",gender:"Women",brand:"W",name:"Embroidered Kurta",color:"Maroon",sizes:["XS","S","M","L","XL"],base:1299},
  {cat:"Ethnic",gender:"Women",brand:"Mango",name:"Block Print Kurta",color:"Blue",sizes:["XS","S","M","L"],base:1799},
  {cat:"Ethnic",gender:"Women",brand:"Nykaa Fashion",name:"Anarkali Suit",color:"Green",sizes:["XS","S","M","L","XL"],base:2499},
  {cat:"Ethnic",gender:"Women",brand:"Nykaa Fashion",name:"Palazzo Kurta Set",color:"Peach",sizes:["S","M","L","XL"],base:1999},
  {cat:"Ethnic",gender:"Women",brand:"GAP",name:"Floral Print Kurta",color:"Yellow",sizes:["S","M","L","XL"],base:1599},
  {cat:"Ethnic",gender:"Women",brand:"Levi's",name:"Indigo Dyed Kurta",color:"Blue",sizes:["XS","S","M","L"],base:2199},
  {cat:"Ethnic",gender:"Men",brand:"W",name:"Cotton Kurta",color:"White",sizes:["S","M","L","XL","XXL"],base:1299},
  {cat:"Ethnic",gender:"Men",brand:"Mango",name:"Handloom Kurta",color:"Beige",sizes:["S","M","L","XL"],base:2299},
  {cat:"Ethnic",gender:"Women",brand:"Urbanic",name:"Mirror Work Skirt Set",color:"Red",sizes:["S","M","L"],base:2799},
  {cat:"Ethnic",gender:"Women",brand:"W",name:"Chanderi Silk Kurta",color:"Mint",sizes:["XS","S","M","L","XL"],base:1799},
  {cat:"Skirts",gender:"Women",brand:"H&M",name:"Maxi Boho Skirt",color:"Mustard",sizes:["XS","S","M","L"],base:1699},
  {cat:"Skirts",gender:"Women",brand:"Zara",name:"Pleated Mini Skirt",color:"Black",sizes:["XS","S","M","L"],base:2799},
  {cat:"Skirts",gender:"Women",brand:"Zara",name:"Satin Midi Skirt",color:"Brown",sizes:["XS","S","M","L"],base:3199},
  {cat:"Skirts",gender:"Women",brand:"Mango",name:"Denim Mini Skirt",color:"Blue",sizes:["XS","S","M","L","XL"],base:2299},
  {cat:"Skirts",gender:"Women",brand:"Urbanic",name:"Cargo Mini Skirt",color:"Olive",sizes:["XS","S","M","L"],base:1299},
  {cat:"Skirts",gender:"Women",brand:"Nykaa Fashion",name:"Floral Wrap Skirt",color:"Coral",sizes:["S","M","L"],base:999},
  {cat:"Skirts",gender:"Women",brand:"GAP",name:"A-Line Skirt",color:"Navy",sizes:["XS","S","M","L","XL"],base:1799},
  {cat:"Skirts",gender:"Women",brand:"H&M",name:"Jersey Mini Skirt",color:"Black",sizes:["XS","S","M","L"],base:999},
  {cat:"Skirts",gender:"Women",brand:"Mango",name:"Leather Look Maxi Skirt",color:"Black",sizes:["XS","S","M","L"],base:3499},
  {cat:"Sneakers",gender:"Unisex",brand:"Nike",name:"Air Max 270",color:"White",sizes:["6","7","8","9","10","11"],base:8999},
  {cat:"Sneakers",gender:"Unisex",brand:"Nike",name:"Air Force 1",color:"White",sizes:["6","7","8","9","10","11"],base:7999},
  {cat:"Sneakers",gender:"Unisex",brand:"Nike",name:"Revolution 6",color:"Black",sizes:["6","7","8","9","10","11","12"],base:4499},
  {cat:"Sneakers",gender:"Unisex",brand:"Adidas",name:"Stan Smith",color:"White/Green",sizes:["6","7","8","9","10","11"],base:6999},
  {cat:"Sneakers",gender:"Unisex",brand:"Adidas",name:"Ultraboost 22",color:"Core Black",sizes:["6","7","8","9","10","11"],base:12999},
  {cat:"Sneakers",gender:"Unisex",brand:"Adidas",name:"Forum Low",color:"White",sizes:["6","7","8","9","10","11"],base:5999},
  {cat:"Sneakers",gender:"Men",brand:"Levi's",name:"Vernon Canvas Sneaker",color:"Navy",sizes:["7","8","9","10","11"],base:2999},
  {cat:"Sneakers",gender:"Men",brand:"GAP",name:"Classic Low Sneaker",color:"White",sizes:["7","8","9","10","11"],base:2499},
  {cat:"Sneakers",gender:"Women",brand:"Nike",name:"Court Legacy Lift",color:"White",sizes:["5","6","7","8","9"],base:5499},
  {cat:"Sneakers",gender:"Women",brand:"Adidas",name:"VL Court 3.0",color:"Pink",sizes:["5","6","7","8","9"],base:4999},
  {cat:"Sneakers",gender:"Women",brand:"Zara",name:"Platform Sneaker",color:"White",sizes:["5","6","7","8","9"],base:3999},
  {cat:"Sneakers",gender:"Women",brand:"Mango",name:"Chunky Sole Sneaker",color:"Beige",sizes:["5","6","7","8","9"],base:3499},
  {cat:"Sneakers",gender:"Unisex",brand:"Nike",name:"Pegasus 40",color:"Blue",sizes:["6","7","8","9","10","11"],base:9999},
  {cat:"Sneakers",gender:"Unisex",brand:"Adidas",name:"Samba OG",color:"White/Black",sizes:["6","7","8","9","10","11"],base:7999},
  {cat:"Accessories",gender:"Unisex",brand:"Levi's",name:"Reversible Belt",color:"Black/Brown",sizes:["S","M","L"],base:1299},
  {cat:"Accessories",gender:"Unisex",brand:"H&M",name:"Canvas Tote Bag",color:"Natural",sizes:["One Size"],base:699},
  {cat:"Accessories",gender:"Unisex",brand:"Nike",name:"Heritage Cap",color:"Black",sizes:["One Size"],base:1299},
  {cat:"Accessories",gender:"Unisex",brand:"Adidas",name:"Classic Backpack",color:"Black",sizes:["One Size"],base:2499},
  {cat:"Accessories",gender:"Unisex",brand:"GAP",name:"Beanie Hat",color:"Grey",sizes:["One Size"],base:899},
  {cat:"Accessories",gender:"Women",brand:"Mango",name:"Mini Shoulder Bag",color:"Tan",sizes:["One Size"],base:2999},
  {cat:"Accessories",gender:"Women",brand:"Zara",name:"Crossbody Bag",color:"Black",sizes:["One Size"],base:3999},
  {cat:"Accessories",gender:"Women",brand:"Nykaa Fashion",name:"Silk Scrunchie Set",color:"Multicolor",sizes:["One Size"],base:399},
  {cat:"Accessories",gender:"Men",brand:"Ralph Lauren",name:"Leather Wallet",color:"Brown",sizes:["One Size"],base:3499},
  {cat:"Accessories",gender:"Unisex",brand:"H&M",name:"Retro Sunglasses",color:"Tortoise",sizes:["One Size"],base:999},
  {cat:"Accessories",gender:"Women",brand:"Urbanic",name:"Chain Strap Mini Bag",color:"Silver",sizes:["One Size"],base:1599},
  {cat:"Accessories",gender:"Men",brand:"GAP",name:"Wool Blend Scarf",color:"Navy",sizes:["One Size"],base:1199},
  {cat:"Accessories",gender:"Unisex",brand:"Zara",name:"Woven Bucket Hat",color:"Beige",sizes:["One Size"],base:1499},
  {cat:"Accessories",gender:"Women",brand:"H&M",name:"Hair Claw Clip Set",color:"Multicolor",sizes:["One Size"],base:349},
];

let id = 1;
const products = CATALOG.map((item) => {
  const prices = makePrices(item.base);
  return {
    id: String(id++),
    name: item.name,
    brand: item.brand,
    color: item.color,
    sizes: item.sizes,
    image: getImage(item.cat),
    category: item.cat,
    gender: item.gender,
    rating: pick(RATINGS),
    reviews: rand(42, 3200),
    prices,
    priceHistory: makePriceHistory(item.base),
  };
});

const outPath = path.resolve(__dirname, "../public/products.json");
fs.writeFileSync(outPath, JSON.stringify(products, null, 2));
console.log("Generated " + products.length + " products -> " + outPath);
