import { Request, Response, NextFunction } from 'express';
import { prisma } from '@fashionhub/database';
import { successResponse, errorResponse } from '../utils/ApiResponse';
import { sendPriceAlertEmail } from '../utils/mailer';

export const createPriceAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, userId, targetPrice, email } = req.body;

    const alert = await prisma.priceAlert.create({
      data: {
        productId,
        userId,
        targetPrice,
        email,
        triggered: false,
      }
    });

    // Native check on creation. If already below target, trigger instantly
    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { listings: true }
    });

    if (product) {
      const bestListing = product.listings.sort((a: any, b: any) => a.currentPrice - b.currentPrice)[0];
      if (bestListing && bestListing.currentPrice <= targetPrice) {
        // Send alert immediately
        const sent = await sendPriceAlertEmail(email, product.title, bestListing.currentPrice, targetPrice, bestListing.url);
        
        if (sent) {
          await prisma.priceAlert.update({
             where: { id: alert.id },
             data: { triggered: true }
          });
        }
      }
    }

    res.json(successResponse(alert, 'Price alert successfully created'));
  } catch (error) {
    next(error);
  }
};
