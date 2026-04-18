import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/ApiResponse';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Error:', err);
  
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json(errorResponse(message, process.env.NODE_ENV === 'development' ? err.stack : undefined));
};
