import { Request, Response, NextFunction } from 'express';
import { prisma } from '@fashionhub/database';
import { successResponse } from '../utils/ApiResponse';

export const searchProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = req.query.q as string;

    // Use prisma.$queryRaw explicitly requesting rank and similarity.
    // Assuming schema has a "Product" or "products" table (will cast to 'Product' usually in Prisma).
    // The table name in Prisma Postgres is often exactly the model name 'Product' or mapped via @@map.
    // If it's pure Prisma standard: 'Product' is quoted as "Product".
    
    // We compute a relevance score that combines fulltext rank and trgm similarity.
    // ts_rank_cd computes rank based on tsvector.
    // similarity(brand, query) or similarity(title, query) computes fuzzy match score.

    const results = await prisma.$queryRaw`
      SELECT id, title, brand, category, "imageUrl",
             (
                ts_rank_cd(to_tsvector('english', title || ' ' || brand), plainto_tsquery('english', ${query}))
                + 
                similarity(title, ${query}) * 0.5
                +
                similarity(brand, ${query}) * 0.5
             ) as relevance
      FROM "Product"
      WHERE 
        to_tsvector('english', title || ' ' || brand) @@ plainto_tsquery('english', ${query})
        OR title % ${query}
        OR brand % ${query}
      ORDER BY relevance DESC
      LIMIT 20;
    `;

    res.json(successResponse(results, 'Search results'));
  } catch (error) {
    console.error("Search API Error (Make sure pg_trgm extension is active): ", error);
    next(error);
  }
};
