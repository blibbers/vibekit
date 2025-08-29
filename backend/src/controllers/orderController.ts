import { Response } from 'express';
import Order from '../models/Order';
import Product from '../models/Product';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { emailService } from '../services/emailService';

class OrderController {
  getUserOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort('-createdAt');

    res.json({ orders });
  });

  getAllOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status, page = 1, limit = 10 } = req.query;
    const query: any = {};

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const orders = await Order.find(query)
      .populate('user', 'email firstName lastName')
      .populate('items.product')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);

    const total = await Order.countDocuments(query);

    res.json({
      orders,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  });

  getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const query: any = { _id: req.params.id };

    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query)
      .populate('items.product')
      .populate('user', 'email firstName lastName');

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({ order });
  });

  createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const { items, shippingAddress, billingAddress, paymentMethod } = req.body;

    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        throw new AppError(`Product ${item.product} not found`, 404);
      }

      if (product.stock < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
        total: itemTotal,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    const tax = subtotal * 0.1;
    const shipping = subtotal > 100 ? 0 : 10;
    const total = subtotal + tax + shipping;

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      subtotal,
      tax,
      shipping,
      total,
      shippingAddress,
      billingAddress,
      paymentMethod,
    });

    await emailService.sendOrderConfirmation(req.user.email, {
      orderNumber: order.orderNumber,
      total: order.total,
    });

    res.status(201).json({ order });
  });

  updateOrderStatus = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      {
        status,
        ...(status === 'shipped' && { shippedAt: new Date() }),
        ...(status === 'delivered' && { deliveredAt: new Date() }),
      },
      { new: true }
    );

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    res.json({ order });
  });

  cancelOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      throw new AppError('User not found', 404);
    }

    const query: any = { _id: req.params.id };

    if (req.user.role !== 'admin') {
      query.user = req.user._id;
    }

    const order = await Order.findOne(query);

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (!['pending', 'processing'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled', 400);
    }

    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        product.stock += item.quantity;
        await product.save();
      }
    }

    order.status = 'cancelled';
    await order.save();

    res.json({ message: 'Order cancelled successfully', order });
  });
}

export const orderController = new OrderController();
