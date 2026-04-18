import express from 'express';
import cors from 'cors';
import { prisma } from '@fashionhub/database';
import productRoutes from './routes/product.routes';
import searchRoutes from './routes/search.routes';
import scrapeRoutes from './routes/scrape.routes';
import priceHistoryRoutes from './routes/priceHistory.routes';
import alertRoutes from './routes/alert.routes';
import { errorHandler } from './middlewares/errorHandler';
import { initCronJobs } from './jobs/scraper.cron';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.use('/api/v1/products', productRoutes);
app.use('/api/v1/search', searchRoutes);
app.use('/api/v1/scrape', scrapeRoutes);
app.use('/api/v1/price-history', priceHistoryRoutes);
app.use('/api/v1/alerts', alertRoutes);

app.use(errorHandler);

// Attempt to enable pg_trgm for search if possible
async function setupDatabase() {
  try {
    await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS pg_trgm;`;
    console.log('PostgreSQL pg_trgm extension verified.');
  } catch (err) {
    console.warn('Could not verify pg_trgm extension automatically. Search results might degrade if not enabled. Error:', err instanceof Error ? err.message : err);
  }
}

app.listen(PORT, async () => {
  await setupDatabase();
  initCronJobs();
  console.log(`FashionHub API is running on http://localhost:${PORT}`);
});
