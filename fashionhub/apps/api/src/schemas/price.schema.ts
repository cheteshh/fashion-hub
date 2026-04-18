import { z } from 'zod';

export const getPriceHistorySchema = z.object({
  params: z.object({
    productId: z.string().min(1)
  }),
  query: z.object({
    platform: z.string().optional(),
    days: z.string().optional().default('90').transform((val) => parseInt(val, 10))
  })
});
