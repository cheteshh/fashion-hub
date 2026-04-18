import { Worker } from 'bullmq';
console.log('Scraper worker starting...');
const worker = new Worker('scraping-queue', async job => {
  console.log('Processing job', job.id);
  // Scraper implementation here
}, { connection: { host: 'localhost', port: 6379 } });
