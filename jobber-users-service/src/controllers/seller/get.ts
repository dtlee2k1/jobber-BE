import { ISellerDocument } from '@dtlee2k1/jobber-shared';
import { getRandomSellers, getSellerById, getSellerByUsername } from '@users/services/seller.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function id(req: Request, res: Response, _next: NextFunction) {
  const seller: ISellerDocument | null = await getSellerById(req.params.sellerId);
  res.status(StatusCodes.OK).json({
    message: 'Seller profile',
    seller
  });
}

export async function username(req: Request, res: Response, _next: NextFunction) {
  const seller: ISellerDocument | null = await getSellerByUsername(req.params.username);
  res.status(StatusCodes.OK).json({
    message: 'Seller profile',
    seller
  });
}

export async function random(req: Request, res: Response, _next: NextFunction) {
  const sellers: ISellerDocument[] | null = await getRandomSellers(parseInt(req.params.size));
  res.status(StatusCodes.OK).json({
    message: 'Random sellers profile',
    sellers
  });
}
