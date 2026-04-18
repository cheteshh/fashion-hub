import { Router } from 'express';
import { createPriceAlert } from '../controllers/alert.controller';
import { validate } from '../middlewares/validate';
import { createAlertSchema } from '../schemas/alert.schema';

const router = Router();

router.post('/', validate(createAlertSchema), createPriceAlert);

export default router;
