import { z } from 'zod';

export const createAlertSchema = z.object({
  body: z.object({
    productId: z.string().min(1, "Product ID is required"),
    userId: z.string().min(1, "User ID is required"),
    targetPrice: z.number().positive("Target price must be positive"),
    email: z.string().email("Valid email required"),
  })
});
