import cron from 'node-cron';
import { prisma } from '@fashionhub/database';
import { scrapeQueue } from '../utils/queue';

// "0 */6 * * *" = At minute 0 past every 6th hour
export const initCronJobs = () => {
  cron.schedule('0 */6 * * *', async () => {
    console.log('Running scheduled scraper batch job...');
    
    try {
      // Find all listings to trigger re-scrape
      const listings = await prisma.listing.findMany({
        where: { inStock: true }
      });
      
      console.log(`Found ${listings.length} active listings. Dispatching jobs...`);

      // Avoid blocking Node event loop on massive queues by breaking them into manageable dispatches natively
      const jobs = listings.map((l: any) => ({
        name: 'scrape-url',
        data: {
          url: l.url,
          platform: l.platformDomain,
          trigger: 'scheduled_batch'
        },
        opts: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 2000 }
        }
      }));

      // Add jobs entirely in bulk (requires BullMQ version supports addBulk)
      if (jobs.length > 0) {
        await scrapeQueue.addBulk(jobs);
        console.log(`Successfully dispatched ${jobs.length} bulk batch jobs to scrape queue.`);
      }
    } catch (error) {
      console.error('Failed to run scheduled scraper batch job:', error);
    }
  });

  console.log('Cron jobs initialized successfully.');
};
