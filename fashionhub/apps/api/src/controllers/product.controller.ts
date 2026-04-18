import { Request, Response, NextFunction } from 'express';
import { prisma } from '@fashionhub/database';
import { successResponse, errorResponse } from '../utils/ApiResponse';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string || '1');
    const limit = parseInt(req.query.limit as string || '20');
    const skip = (page - 1) * limit;

    const { category, brand, gender, minPrice, maxPrice, sort } = req.query;

    const where: any = {};
    if (category) where.category = { equals: (category as string).toLowerCase(), mode: 'insensitive' };
    if (brand) where.brand = { equals: brand as string, mode: 'insensitive' };
    if (gender) where.gender = { equals: gender as string, mode: 'insensitive' };

    // Price filtering needs to look at the listings.
    // If minPrice or maxPrice are present, we filter products that have at least one listing in this range.
    if (minPrice || maxPrice) {
      where.listings = {
        some: {
          currentPrice: {
            ...(minPrice ? { gte: parseFloat(minPrice as string) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice as string) } : {}),
          }
        }
      };
    }

    let orderBy: any = undefined;
    if (sort === 'price_asc') {
      orderBy = { listings: { _count: 'asc' } }; // Prisma has limitations sorting by relation min/max directly without raw query or aggregation, we fallback or handle in memory, but let's do created fallback for simplicity or a custom sort
    } else if (sort === 'newest') {
      orderBy = { createdAt: 'desc' };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: orderBy || { createdAt: 'desc' },
        include: {
          listings: true // Included to compute best price, discount etc.
        }
      })
    ]);

    // Map response to schema expectations
    const data = products.map((p: any) => {
      const bestListing = p.listings?.sort((a: any, b: any) => a.currentPrice - b.currentPrice)[0];
      return {
        id: p.id,
        title: p.title,
        brand: p.brand,
        category: p.category,
        gender: p.gender,
        imageUrl: p.imageUrl,
        bestCurrentPrice: bestListing ? bestListing.currentPrice : null,
        highestDiscount: bestListing ? bestListing.discount : 0,
        platformCount: p.listings?.length || 0,
      };
    });

    if (sort === 'price_asc') data.sort((a: any, b: any) => (a.bestCurrentPrice || Infinity) - (b.bestCurrentPrice || Infinity));
    if (sort === 'price_desc') data.sort((a: any, b: any) => (b.bestCurrentPrice || 0) - (a.bestCurrentPrice || 0));
    if (sort === 'discount') data.sort((a: any, b: any) => (b.highestDiscount || 0) - (a.highestDiscount || 0));

    res.json(successResponse(data, 'Products retrieved successfully', {
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }));
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { history } = req.query; // '30', '90', '180'

    const historyDays = parseInt(history as string) || 30;
    const dateLimit = new Date();
    dateLimit.setDate(dateLimit.getDate() - historyDays);

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        listings: {
          include: {
            priceHistory: {
              where: {
                timestamp: { gte: dateLimit } // Using timestamp as per schema
              },
              orderBy: {
                timestamp: 'asc'
              }
            }
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json(successResponse(product, 'Product data retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

export const getDeals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        listings: {
          some: {
            discount: { gt: 40 }
          }
        }
      },
      take: 20,
      include: {
        listings: true
      }
    });

    const mapped = products.map((p: any) => {
      const bestDiscountListing = p.listings.reduce((prev: any, curr: any) => (prev.discount > curr.discount) ? prev : curr);
      return {
        id: p.id,
        title: p.title,
        brand: p.brand,
        imageUrl: p.imageUrl,
        discount: bestDiscountListing.discount,
        currentPrice: bestDiscountListing.currentPrice
      };
    });

    // Sort by highest discount
    mapped.sort((a: any, b: any) => b.discount - a.discount);

    res.json(successResponse(mapped, 'Top deals retrieved'));
  } catch (error) {
    next(error);
  }
};

export const getTrending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Basic heuristics: Recent products with highest discounts overall acting as 'trending'.
    const trending = await prisma.product.findMany({
      where: {
        listings: {
          some: {
            discount: { gt: 20 }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { listings: true }
    });

    const mapped = trending.map((p: any) => {
      const bestListing = p.listings?.sort((a: any, b: any) => a.currentPrice - b.currentPrice)[0];
      return {
        id: p.id,
        title: p.title,
        brand: p.brand,
        price: bestListing?.currentPrice,
        discount: bestListing?.discount,
      }
    });

    res.json(successResponse(mapped, 'Trending products retrieved'));
  } catch (error) {
    next(error);
  }
};

export const compareProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: { listings: true }
    });

    if (!product) {
      return res.status(404).json(errorResponse('Product not found for comparison'));
    }

    const listings = product.listings;
    if (!listings || listings.length === 0) {
      return res.status(404).json(errorResponse('No active listings found to compare'));
    }

    // Sort heavily by price ascending
    listings.sort((a: any, b: any) => a.currentPrice - b.currentPrice);

    // Assuming we have basic metrics for 'fastest delivery' if they exist, or simulate tagging.
    // For this demonstration, the first is cheapest. The one with max discount is 'best discount'.
    let bestDiscountListing = listings[0];
    let fastestDeliveryListing = listings[Math.floor(Math.random() * listings.length)]; // Simulation placeholder as schema doesn't define delivery times explicitly

    for (const l of listings) {
      if ((l as any).discount > (bestDiscountListing as any).discount) {
        bestDiscountListing = l;
      }
    }

    const payload = listings.map((l: any, i: number) => ({
      platform: l.platformDomain,
      currentPrice: l.currentPrice,
      originalPrice: l.originalPrice,
      discount: l.discount,
      inStock: l.inStock,
      url: l.url,
      highlights: {
        cheapest: i === 0,
        bestDiscount: l.id === bestDiscountListing.id,
        fastestDelivery: l.id === fastestDeliveryListing.id // Placerholder
      }
    }));

    res.json(successResponse(payload, 'Product listings comparison generated'));
  } catch (error) {
    next(error);
  }
};
