import { orderService } from '@gateway/services/api/order.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function cancel(req: Request, res: Response, _next: NextFunction) {
  const { paymentIntentId } = req.body;
  const { orderId } = req.params;

  const response = await orderService.cancelOrder(paymentIntentId, orderId, req.body);
  res.status(StatusCodes.OK).json({
    message: response.data.message
  });
}

export async function approve(req: Request, res: Response, _next: NextFunction) {
  const response = await orderService.approveOrder(req.params.orderId, req.body);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    order: response.data.order
  });
}

export async function requestExtension(req: Request, res: Response, _next: NextFunction) {
  const response = await orderService.requestDeliveryDateExtension(req.params.orderId, req.body);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    order: response.data.order
  });
}

export async function deliveryDate(req: Request, res: Response, _next: NextFunction) {
  const { orderId, type } = req.params;

  const response = await orderService.updateDeliveryDate(orderId, type, req.body);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    order: response.data.order
  });
}

export async function deliverOrder(req: Request, res: Response, _next: NextFunction) {
  const response = await orderService.deliverOrder(req.params.orderId, req.body);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    order: response.data.order
  });
}

export async function markNotificationAsRead(req: Request, res: Response, _next: NextFunction) {
  const response = await orderService.markNotificationAsRead(req.body.notificationId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    notification: response.data.notification
  });
}
