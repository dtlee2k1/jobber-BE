import crypto from 'crypto';

import { IDeliveredWork, IOrderDocument, uploadImages } from '@dtlee2k1/jobber-shared';
import envConfig from '@order/config';
import { BadRequestError } from '@order/error-handler';
import { orderUpdateSchema } from '@order/schemes/order';
import {
  approveDeliveryDate,
  approveOrder,
  cancelOrder,
  rejectDeliveryDate,
  requestDeliveryExtension,
  sellerDeliverOrder
} from '@order/services/order.service';
import { UploadApiResponse } from 'cloudinary';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';

const stripe = new Stripe(envConfig.STRIPE_API_KEY!, {
  typescript: true
});

export async function cancel(req: Request, res: Response, _next: NextFunction) {
  await stripe.refunds.create({
    payment_intent: `${req.body.paymentIntentId}`
  });
  await cancelOrder(req.params.orderId, req.body.orderData);

  res.status(StatusCodes.OK).json({
    message: 'Order cancelled successfully'
  });
}

export async function approve(req: Request, res: Response, _next: NextFunction) {
  const { orderId } = req.params;

  const order: IOrderDocument = await approveOrder(orderId, req.body);
  res.status(StatusCodes.OK).json({
    message: 'Order approve successfully',
    order
  });
}

export async function requestExtension(req: Request, res: Response, _next: NextFunction) {
  const { error } = await Promise.resolve(orderUpdateSchema.validate(req.body));
  if (error?.details) {
    throw new BadRequestError(error.details[0].message, 'Update requestExtension() method error');
  }
  const order: IOrderDocument = await requestDeliveryExtension(req.params.orderId, req.body);

  res.status(StatusCodes.OK).json({
    message: 'Order request delivery extension successfully',
    order
  });
}

export async function deliveryDate(req: Request, res: Response, _next: NextFunction) {
  const { orderId, type } = req.params;

  const order: IOrderDocument = type === 'approve' ? await approveDeliveryDate(orderId, req.body) : await rejectDeliveryDate(orderId);
  res.status(StatusCodes.OK).json({
    message: 'Order delivery date extension successfully',
    order
  });
}

export async function deliverOrder(req: Request, res: Response, _next: NextFunction) {
  const { orderId } = req.params;

  let file: string = req.body.file;

  const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
  const randomCharacters = randomBytes.toString('hex');

  let uploadResult: UploadApiResponse;
  if (file) {
    uploadResult = (
      req.body.fileType === 'zip' ? await uploadImages(file, `${randomCharacters}.zip`) : await uploadImages(file)
    ) as UploadApiResponse;

    if (!uploadResult.public_id) {
      throw new BadRequestError('File upload error. Try again', 'Update deliveryOrder() method error');
    }

    file = uploadResult.secure_url;
  }

  const deliveredWork: IDeliveredWork = {
    message: req.body.message,
    file: req.body.file,
    fileType: req.body.fileType,
    fileSize: req.body.fileSize,
    fileName: req.body.fileName
  };

  const order = await sellerDeliverOrder(orderId, true, deliveredWork);

  res.status(StatusCodes.OK).json({
    message: 'Order delivered successfully',
    order
  });
}
