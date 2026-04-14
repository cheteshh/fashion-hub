import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import cron from 'node-cron';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
export const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fashionhub-dev-secret';

app.use(cors());
app.use(express.json());

// ── Auth Middleware ──────────────────────────────────────────────
function authMiddleware(req: Request & { userId?: string }, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ═══════════════════════════════════════════════════════════════
//  AUTH ROUTES
// ═══════════════════════════════════════════════════════════════
app.post('/api/v1/auth/register', async (req: Request, res: Response) => {
  const { email, name, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: 'Email already registered' });
  const hashed = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({ data: { email, name, password: hashed } });
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
});

// ═══════════════════════════════════════════════════════════════
//  PRODUCTS ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/v1/products — with filtering, sorting, pagination
app.get('/api/v1/products', async (req: Request, res: Response) => {
  try {
    const {
      category, brand, gender, q,
      minPrice, maxPrice,
      platform,
      sort = 'createdAt',
      page = '1', limit = '24',
    } = req.query as Record<string, string>;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    const where: any = {};
    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (brand) where.unifiedBrand = { equals: brand, mode: 'insensitive' };
    if (gender) where.gender = { equals: gender, mode: 'insensitive' };
    if (q) where.OR = [
      { unifiedTitle: { contains: q, mode: 'insensitive' } },
      { unifiedBrand: { contains: q, mode: 'insensitive' } },
      { category: { contains: q, mode: 'insensitive' } },
      { tags: { has: q } },
    ];

    let platformWhere: any = {};
    if (minPrice || maxPrice) {
      platformWhere.currentPrice = {};
      if (minPrice) platformWhere.currentPrice.gte = parseFloat(minPrice);
      if (maxPrice) platformWhere.currentPrice.lte = parseFloat(maxPrice);
    }
    if (platform) platformWhere.platformDomain = { equals: platform, mode: 'insensitive' };

    if (Object.keys(platformWhere).length > 0) {
      where.platforms = { some: platformWhere };
    }

    const orderBy: any = sort === 'rating' ? { globalAverageRating: 'desc' }
      : sort === 'reviews' ? { totalReviews: 'desc' }
      : { createdAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { platforms: { select: { platformDomain: true, currentPrice: true, originalPrice: true, lowestEverPrice: true, inStock: true, sourceUrl: true, customPlatformRating: true, platformReviews: true } } },
        orderBy,
        skip,
        take,
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: parseInt(page), limit: take, totalPages: Math.ceil(total / take) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/products/deals — biggest price drops
app.get('/api/v1/products/deals', async (req: Request, res: Response) => {
  try {
    // Products where at least one platform has a big discount (originalPrice - currentPrice is large)
    const listings = await prisma.platformListing.findMany({
      where: { originalPrice: { gt: 0 }, inStock: true },
      include: { product: true },
      orderBy: [{ originalPrice: 'desc' }],
      take: 100,
    });

    // Compute discount % and sort
    const withDiscount = listings
      .map(l => ({
        ...l,
        discountPct: l.originalPrice ? Math.round(((l.originalPrice - l.currentPrice) / l.originalPrice) * 100) : 0,
      }))
      .filter(l => l.discountPct > 10)
      .sort((a, b) => b.discountPct - a.discountPct);

    // De-duplicate by product
    const seen = new Set<string>();
    const deals = withDiscount.filter(l => {
      if (seen.has(l.productId)) return false;
      seen.add(l.productId);
      return true;
    }).slice(0, 20);

    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/products/trending — highest rated with most reviews
app.get('/api/v1/products/trending', async (req: Request, res: Response) => {
  try {
    const limit = parseInt((req.query as any).limit || '12');
    const products = await prisma.product.findMany({
      include: { platforms: { select: { platformDomain: true, currentPrice: true, originalPrice: true, inStock:true, sourceUrl: true } } },
      orderBy: [{ globalAverageRating: 'desc' }, { totalReviews: 'desc' }],
      take: limit,
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/products/new-arrivals
app.get('/api/v1/products/new-arrivals', async (req: Request, res: Response) => {
  try {
    const products = await prisma.product.findMany({
      include: { platforms: { select: { platformDomain: true, currentPrice: true, originalPrice: true, inStock: true, sourceUrl: true } } },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/products/:id — full product with price history
app.get('/api/v1/products/:id', async (req: Request, res: Response) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: {
        platforms: {
          include: {
            priceHistory: {
              orderBy: { timestamp: 'asc' },
              // Return last 60 days only for performance
              where: { timestamp: { gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) } },
            },
          },
        },
      },
    });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/price-history/:productId
app.get('/api/v1/price-history/:productId', async (req: Request, res: Response) => {
  try {
    const { days = '30', platform } = req.query as Record<string, string>;
    const sinceDate = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const listings = await prisma.platformListing.findMany({
      where: {
        productId: req.params.productId,
        ...(platform ? { platformDomain: platform } : {}),
      },
      include: {
        priceHistory: {
          where: { timestamp: { gte: sinceDate } },
          orderBy: { timestamp: 'asc' },
        },
      },
    });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/search
app.get('/api/v1/search', async (req: Request, res: Response) => {
  try {
    const { q, category, brand, gender, minPrice, maxPrice, sort, page = '1', limit = '24' } = req.query as Record<string, string>;
    if (!q) return res.status(400).json({ error: 'q param required' });

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where: any = {
      OR: [
        { unifiedTitle: { contains: q, mode: 'insensitive' } },
        { unifiedBrand: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
      ],
    };
    if (category) where.category = { equals: category, mode: 'insensitive' };
    if (brand) where.unifiedBrand = { equals: brand, mode: 'insensitive' };
    if (gender) where.gender = { equals: gender, mode: 'insensitive' };
    if (minPrice || maxPrice) {
      where.platforms = { some: { currentPrice: { ...(minPrice ? { gte: parseFloat(minPrice) } : {}), ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}) } } };
    }

    const orderBy: any = sort === 'rating' ? { globalAverageRating: 'desc' } : sort === 'reviews' ? { totalReviews: 'desc' } : { updatedAt: 'desc' };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { platforms: { select: { platformDomain: true, currentPrice: true, originalPrice: true, inStock: true, sourceUrl: true, customPlatformRating: true } } },
        orderBy,
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/v1/categories
app.get('/api/v1/categories', async (_req, res) => {
  const categories = await prisma.product.groupBy({ by: ['category'], _count: true });
  res.json(categories);
});

// GET /api/v1/brands
app.get('/api/v1/brands', async (_req, res) => {
  const brands = await prisma.product.groupBy({ by: ['unifiedBrand'], _count: true, orderBy: { _count: { unifiedBrand: 'desc' } } });
  res.json(brands);
});

// ═══════════════════════════════════════════════════════════════
//  PRICE ALERTS
// ═══════════════════════════════════════════════════════════════
app.post('/api/v1/alerts', async (req: Request, res: Response) => {
  const { productId, targetPrice, email } = req.body;
  if (!productId || !targetPrice || !email) return res.status(400).json({ error: 'productId, targetPrice, and email required' });
  const alert = await prisma.priceAlert.create({ data: { productId, targetPrice: parseFloat(targetPrice), email, userId: req.body.userId || 'anonymous' } });
  res.json({ message: 'Alert set successfully', alert });
});

// ═══════════════════════════════════════════════════════════════
//  WISHLIST (requires auth)
// ═══════════════════════════════════════════════════════════════
app.get('/api/v1/wishlist', authMiddleware as any, async (req: any, res: Response) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.userId },
    include: { product: { include: { platforms: true } } },
  });
  res.json(items);
});

app.post('/api/v1/wishlist', authMiddleware as any, async (req: any, res: Response) => {
  const { productId } = req.body;
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.userId, productId } },
    create: { userId: req.userId, productId },
    update: {},
  });
  res.json(item);
});

app.delete('/api/v1/wishlist/:productId', authMiddleware as any, async (req: any, res: Response) => {
  await prisma.wishlistItem.deleteMany({ where: { userId: req.userId, productId: req.params.productId } });
  res.json({ message: 'Removed from wishlist' });
});

// ═══════════════════════════════════════════════════════════════
//  WEBSOCKET
// ═══════════════════════════════════════════════════════════════
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('subscribe:product', (productId: string) => socket.join(`product:${productId}`));
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

export function notifyPriceUpdate(productId: string, data: any) {
  io.to(`product:${productId}`).emit('price:update', data);
}

// ═══════════════════════════════════════════════════════════════
//  CRON JOBS
// ═══════════════════════════════════════════════════════════════

// Every 15 minutes: sim price fluctuations for demo purposes
cron.schedule('*/15 * * * *', async () => {
  console.log('⏱ [CRON] Running price fluctuation simulation...');
  try {
    const listings = await prisma.platformListing.findMany({ take: 20, orderBy: { lastSuccessfullyScraped: 'asc' } });
    for (const listing of listings) {
      const drift = Math.floor(Math.random() * 401) - 200; // ±200 INR
      const newPrice = Math.max(199, listing.currentPrice + drift);
      await prisma.platformListing.update({
        where: { id: listing.id },
        data: { currentPrice: newPrice, lastSuccessfullyScraped: new Date() },
      });
      await prisma.priceHistory.create({
        data: { listingId: listing.id, priceRecorded: newPrice, timestamp: new Date() },
      });
      notifyPriceUpdate(listing.productId, { platformDomain: listing.platformDomain, currentPrice: newPrice });

      // Check price alerts
      const alerts = await prisma.priceAlert.findMany({ where: { productId: listing.productId, triggered: false, targetPrice: { gte: newPrice } } });
      for (const alert of alerts) {
        await prisma.priceAlert.update({ where: { id: alert.id }, data: { triggered: true } });
        console.log(`🔔 Alert triggered for ${alert.email} - product ${listing.productId} at ₹${newPrice}`);
      }
    }
  } catch (err) {
    console.error('Cron error:', err);
  }
});

// Daily: refresh trending tags
cron.schedule('0 2 * * *', () => {
  console.log('🕐 [CRON] Running daily product discovery...');
});

// ═══════════════════════════════════════════════════════════════
//  START
// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => {
  console.log(`\n🚀 FashionHub Aggregator API running → http://localhost:${PORT}`);
  console.log(`📡 WebSocket ready on port ${PORT}`);
  console.log(`🗄️  Connected to: ${process.env.DATABASE_URL?.split('@')[1] || 'PostgreSQL'}\n`);
});
