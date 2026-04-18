import { Router } from 'express';
import { getProducts, getProductById, getDeals, getTrending, compareProducts } from '../controllers/product.controller';
import { validate } from '../middlewares/validate';
import { cache } from '../middlewares/cache';
import { getProductsSchema } from '../schemas/product.schema';

const router = Router();

// Specific routes first to avoid catching by /:id
router.get('/deals', cache(300), getDeals);
router.get('/trending', cache(300), getTrending);
router.get('/:id/compare', compareProducts); // :id captures first segment
router.get('/', validate(getProductsSchema), cache(300), getProducts);
router.get('/:id', cache(300), getProductById);

export default router;
