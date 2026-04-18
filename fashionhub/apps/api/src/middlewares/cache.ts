import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../utils/redis';

export const cache = (ttlSeconds: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    const key = `__express__${req.originalUrl || req.url}`;

    try {
      const cachedBody = await redisClient.get(key);
      if (cachedBody) {
        return res.setHeader('Content-Type', 'application/json').send(cachedBody);
      } else {
        // Intercept res.send to cache the response
        const originalSend = res.send;
        res.send = (body: any) => {
          // Only cache successful JSON responses
          if (res.statusCode >= 200 && res.statusCode < 300) {
            redisClient.setex(key, ttlSeconds, body).catch(e => console.error("Redis Cache Set Error:", e));
          }
          return originalSend.call(res, body);
        };
        next();
      }
    } catch (error) {
      console.error('Redis Cache Error:', error);
      next(); // Continue without cache if Redis fails
    }
  };
};
