import { z } from 'zod';

export const getProductsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform((val) => parseInt(val, 10)),
    limit: z.string().optional().default('20').transform((val) => parseInt(val, 10)),
    category: z.string().optional(),
    brand: z.string().optional(),
    gender: z.string().optional(),
    minPrice: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
    maxPrice: z.string().optional().transform((val) => val ? parseFloat(val) : undefined),
    sort: z.enum(['price_asc', 'price_desc', 'discount', 'trending', 'newest']).optional(),
  }),
});

export const searchProductsSchema = z.object({
  query: z.object({
    q: z.string().min(1, "Search query is required"),
  }),
});
