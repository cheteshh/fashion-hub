import { z } from 'zod';

export const scrapeUrlSchema = z.object({
  body: z.object({
    url: z.string().url("Must be a valid URL"),
  }),
});
