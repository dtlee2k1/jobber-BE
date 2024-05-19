import { sellerService } from '@gateway/services/api/seller.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function seller(req: Request, res: Response, _next: NextFunction) {
  const response = await sellerService.createSeller(req.body);
  res.status(StatusCodes.CREATED).json({
    message: response.data.message,
    seller: response.data.seller
  });
}
