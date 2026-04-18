import { Router } from 'express';
import { queueScrape, getScrapeStatus } from '../controllers/scrape.controller';
import { validate } from '../middlewares/validate';
import { scrapeUrlSchema } from '../schemas/scrape.schema';

const router = Router();

router.post('/url', validate(scrapeUrlSchema), queueScrape);
router.get('/status/:jobId', getScrapeStatus);

export default router;
