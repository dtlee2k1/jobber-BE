import { IOrderDocument } from '@dtlee2k1/jobber-shared';
import { getOrderByOrderId, getOrdersByBuyerId, getOrdersBySellerId } from '@order/services/order.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function orderByOrderId(req: Request, res: Response, _next: NextFunction) {
  const order: IOrderDocument = await getOrderByOrderId(req.params.orderId);
  res.status(StatusCodes.OK).json({
    message: 'Get order successfully',
    order
  });
}

export async function sellerOrders(req: Request, res: Response, _next: NextFunction) {
  const orders: IOrderDocument[] = await getOrdersBySellerId(req.params.sellerId);
  res.status(StatusCodes.OK).json({
    message: 'Get seller orders successfully',
    orders
  });
}

export async function buyerOrders(req: Request, res: Response, _next: NextFunction) {
  const orders: IOrderDocument[] = await getOrdersByBuyerId(req.params.buyerId);
  res.status(StatusCodes.OK).json({
    message: 'Get buyer orders successfully',
    orders
  });
}
