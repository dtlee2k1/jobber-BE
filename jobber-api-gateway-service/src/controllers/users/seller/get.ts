import { sellerService } from '@gateway/services/api/seller.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function id(req: Request, res: Response, _next: NextFunction) {
  const response = await sellerService.getSellerById(req.params.sellerId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    seller: response.data.seller
  });
}

export async function username(req: Request, res: Response, _next: NextFunction) {
  const response = await sellerService.getSellerByUsername(req.params.username);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    seller: response.data.seller
  });
}

export async function random(req: Request, res: Response, _next: NextFunction) {
  const response = await sellerService.getRandomSellers(req.params.size);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    sellers: response.data.sellers
  });
}
