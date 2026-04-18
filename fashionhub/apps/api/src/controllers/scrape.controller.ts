import { Request, Response, NextFunction } from 'express';
import { scrapeQueue } from '../utils/queue';
import { successResponse, errorResponse } from '../utils/ApiResponse';

function detectPlatform(url: string): string | null {
  const normalized = url.toLowerCase();
  const platforms = ['myntra', 'amazon', 'ajio', 'flipkart', 'tatacliq', 'meesho', 'nykaa_fashion'];
  for (const p of platforms) {
    if (normalized.includes(p)) return p.toUpperCase();
  }
  return null;
}

export const queueScrape = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { url } = req.body;
    
    const platform = detectPlatform(url);
    if (!platform) {
      return res.status(400).json(errorResponse('Unsupported platform or invalid URL.'));
    }

    const job = await scrapeQueue.add('scrape-url', { url, platform }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 }
    });

    res.json(successResponse({
      jobId: job.id,
      platform,
      estimatedTime: 'Your job has been queued. It typically completes in 10-15 seconds.'
    }, 'Scrape job successfully queued'));
  } catch (error) {
    next(error);
  }
};

export const getScrapeStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const job = await scrapeQueue.getJob(jobId);

    if (!job) {
      return res.status(404).json(errorResponse('Job not found'));
    }

    const state = await job.getState();
    const result = job.returnvalue;
    const failedReason = job.failedReason;

    res.json(successResponse({
      jobId: job.id,
      state,
      progress: job.progress,
      result: state === 'completed' ? result : null,
      error: state === 'failed' ? failedReason : null
    }, `Job is currently ${state}`));
  } catch (error) {
    next(error);
  }
};
