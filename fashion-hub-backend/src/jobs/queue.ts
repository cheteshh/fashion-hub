import { Queue, Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import { scrapeMyntra } from '../scraper/targets/myntra';

// Note: BullMQ requires Redis running locally on port 6379 natively.
const connection = new IORedis({
  maxRetriesPerRequest: null,
});

export const scrapeQueue = new Queue('scrapeQueue', { connection });

const worker = new Worker('scrapeQueue', async (job: Job) => {
  const { platform, url } = job.data;
  
  console.log(`Starting scrape job ${job.id} for ${platform}...`);

  if (platform === 'myntra') {
    return await scrapeMyntra(url);
  } 
  // Expand hooks for Ajio, Amazon, etc. here
  
}, { 
  connection, 
  concurrency: 2 // Keep concurrency extremely low to prevent immediate IP-based anti-bot triggers
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed successfully.`);
});

worker.on('failed', (job, err) => {
  console.log(`Job ${job?.id} has failed with error: ${err.message}`);
});
