import { Router } from 'express';
import { getPriceHistory, getPriceForecast } from '../controllers/price.controller';
import { validate } from '../middlewares/validate';
import { getPriceHistorySchema } from '../schemas/price.schema';

const router = Router();

router.get('/:productId', validate(getPriceHistorySchema), getPriceHistory);
router.get('/:productId/forecast', getPriceForecast);

export default router;
