import { Request, Response } from 'express';
import Product from '../models/Product';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { stripeService } from '../services/stripeService';

class ProductController {
  getAllProducts = asyncHandler(async (req: Request, res: Response) => {
    const {
      category,
      minPrice,
      maxPrice,
      search,
      page = 1,
      limit = 10,
      sort = '-createdAt',
    } = req.query;

    const query: any = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const products = await Product.find(query)
      .sort(sort as string)
      .limit(Number(limit))
      .skip(skip);

    const total = await Product.countDocuments(query);

    res.json({
      products,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  });

  getProductById = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ product });
  });

  createProduct = asyncHandler(async (req: Request, res: Response) => {
    const {
      name,
      description,
      price = 0,
      isFree = false,
      billingType = 'recurring',
      billingInterval = 'month',
      billingIntervalCount = 1,
      features = [],
    } = req.body;

    let stripeProductId = null;
    let stripePriceId = null;

    // Only create Stripe product and price if it's not free
    if (!isFree && price > 0) {
      const stripeProduct = await stripeService.createProduct(name, description);
      stripeProductId = stripeProduct.id;

      // Create recurring or one-time price based on billingType
      let stripePrice;
      if (billingType === 'recurring') {
        stripePrice = await stripeService.createPrice(stripeProduct.id, price, 'usd', {
          interval: billingInterval,
          interval_count: billingIntervalCount,
        });
      } else {
        stripePrice = await stripeService.createPrice(stripeProduct.id, price);
      }
      stripePriceId = stripePrice.id;
    }

    const product = await Product.create({
      ...req.body,
      isFree: isFree || price === 0,
      price: isFree ? 0 : price,
      billingType: isFree ? undefined : billingType,
      billingInterval: isFree || billingType !== 'recurring' ? undefined : billingInterval,
      billingIntervalCount:
        isFree || billingType !== 'recurring' ? undefined : billingIntervalCount,
      features: Array.isArray(features) ? features.filter((f) => f && f.trim()) : [],
      stripeProductId,
      stripePriceId,
    });

    res.status(201).json({ product });
  });

  updateProduct = asyncHandler(async (req: Request, res: Response) => {
    const { features, ...updateData } = req.body;

    // Process features if provided
    const processedUpdateData = {
      ...updateData,
      ...(features !== undefined && {
        features: Array.isArray(features) ? features.filter((f) => f && f.trim()) : [],
      }),
    };

    const product = await Product.findByIdAndUpdate(req.params.id, processedUpdateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ product });
  });

  deleteProduct = asyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!product) {
      throw new AppError('Product not found', 404);
    }

    res.json({ message: 'Product deleted successfully' });
  });
}

export const productController = new ProductController();
