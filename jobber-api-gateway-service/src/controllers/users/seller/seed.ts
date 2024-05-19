import { sellerService } from '@gateway/services/api/seller.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function createSeedSellers(req: Request, res: Response, _next: NextFunction) {
  const response = await sellerService.seedingSellers(req.params.count);
  res.status(StatusCodes.OK).json({
    message: response.data.message
  });
}
