import { orderService } from '@gateway/services/api/order.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function paymentIntent(req: Request, res: Response, _next: NextFunction) {
  const { price, buyerId } = req.body;
  const response = await orderService.createOrderIntent(price, buyerId);
  res.status(StatusCodes.CREATED).json({
    message: response.data.message,
    clientSecret: response.data.clientSecret,
    paymentIntentId: response.data.paymentIntentId
  });
}

export async function order(req: Request, res: Response, _next: NextFunction) {
  const response = await orderService.createOrder(req.body);
  res.status(StatusCodes.CREATED).json({
    message: response.data.message,
    order: response.data.order
  });
}
