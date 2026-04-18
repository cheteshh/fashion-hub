import { Router } from 'express';
import { searchProducts } from '../controllers/search.controller';
import { validate } from '../middlewares/validate';
import { searchProductsSchema } from '../schemas/product.schema';
import { cache } from '../middlewares/cache';

const router = Router();

router.get('/', validate(searchProductsSchema), cache(300), searchProducts);

export default router;
