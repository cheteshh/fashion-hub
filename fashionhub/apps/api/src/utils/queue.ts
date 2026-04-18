import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

// Parse redis URL into host and port if needed for bullmq connection, 
// but bullmq accepts an ioredis connection or connection object.
// The simplest way is to pass ioredis connection options.
const connection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
};

export const scrapeQueue = new Queue('scrapeQueue', { connection });
