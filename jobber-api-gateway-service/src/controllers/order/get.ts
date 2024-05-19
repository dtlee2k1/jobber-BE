import { orderService } from '@gateway/services/api/order.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function orderByOrderId(req: Request, res: Response, _next: NextFunction) {
  const response = await orderService.getOrderById(req.params.orderId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    order: response.data.order
  });
}

export async function sellerOrders(req: Request, res: Response, _next: NextFunction) {
  const response = await orderService.sellerOrders(req.params.sellerId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    orders: response.data.orders
  });
}

export async function buyerOrders(req: Request, res: Response, _next: NextFunction) {
  const response = await orderService.buyerOrders(req.params.buyerId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    orders: response.data.orders
  });
}

export async function notifications(req: Request, res: Response, _next: NextFunction) {
  const response = await orderService.getNotifications(req.params.userTo);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    notifications: response.data.notifications
  });
}
