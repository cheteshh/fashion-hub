import { Request, Response, NextFunction } from 'express';
import { prisma } from '@fashionhub/database';
import { successResponse, errorResponse } from '../utils/ApiResponse';
import { calculateLinearRegression } from '../utils/forecast';

export const getPriceHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const platform = req.query.platform as string | undefined;
    const days = parseInt(req.query.days as string) || 90;

    const dateBoundary = new Date();
    dateBoundary.setDate(dateBoundary.getDate() - days);

    // Assuming listings carry the relation to priceHistory
    const whereClause: any = {
      productId,
    };
    if (platform) {
      whereClause.platformDomain = { equals: platform, mode: 'insensitive' };
    }

    const targetListings = await prisma.listing.findMany({
      where: whereClause,
      include: {
        priceHistory: {
          where: {
            timestamp: { gte: dateBoundary }
          },
          orderBy: {
            timestamp: 'asc'
          }
        }
      }
    });

    if (!targetListings.length) {
      return res.status(404).json(errorResponse('No historical data found for product/platform'));
    }

    let historySeries: { date: Date, price: number, platform: string }[] = [];
    
    targetListings.forEach((listing: any) => {
      listing.priceHistory.forEach((h: any) => {
        historySeries.push({
          date: h.timestamp,
          price: h.priceRecorded || h.price, // Fallback if schema has 'price' or 'priceRecorded'
          platform: listing.platformDomain,
        });
      });
    });

    // Chronological sort
    historySeries.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Basic stats based on series (assuming user expects aggregate across platforms or isolated if they passed platform query)
    const prices = historySeries.map(h => h.price);
    const allTimeHigh = Math.max(...prices);
    const allTimeLow = Math.min(...prices);
    const averagePrice = prices.length ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
    const currentPrice = prices.length ? prices[prices.length - 1] : 0;

    // Price change percentage
    const getHistoricPrice = (daysAgo: number) => {
       const boundary = new Date();
       boundary.setDate(boundary.getDate() - daysAgo);
       const obj = [...historySeries].reverse().find(h => h.date <= boundary);
       return obj ? obj.price : currentPrice;
    };

    const price7d = getHistoricPrice(7);
    const priceChange7d = Math.round(((currentPrice - price7d) / price7d) * 100);

    const price30d = getHistoricPrice(30);
    const priceChange30d = Math.round(((currentPrice - price30d) / price30d) * 100);

    res.json(successResponse(historySeries, 'Historical price trajectory retrieved', {
      stats: {
        allTimeHigh,
        allTimeLow,
        averagePrice,
        currentPrice,
        priceChange7d,
        priceChange30d
      }
    }));
  } catch (error) {
    next(error);
  }
};

export const getPriceForecast = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;

    // Fetch up to 30 recent entries across average listings or cheapest listing for baseline regression
    const listings = await prisma.listing.findMany({
      where: { productId },
      include: {
        priceHistory: {
          orderBy: { timestamp: 'desc' },
          take: 30
        }
      }
    });

    if (!listings.length) {
      return res.status(404).json(errorResponse('No historical datasets available for forecasting'));
    }

    // Select the best listing conceptually (cheapest current)
    listings.sort((a: any, b: any) => a.currentPrice - b.currentPrice);
    const primarySeries = listings[0].priceHistory.map((h: any) => h.priceRecorded || h.price).reverse();

    const forecast = calculateLinearRegression(primarySeries);
    if (!forecast) {
       return res.status(500).json(errorResponse('Inadequate variance coordinates to calculate trajectory'));
    }

    res.json(successResponse(forecast, '30-Day forecast retrieved successfully'));
  } catch (error) {
    next(error);
  }
};
