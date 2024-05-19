import { buyerService } from '@gateway/services/api/buyer.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function email(_req: Request, res: Response, _next: NextFunction) {
  const response = await buyerService.getBuyerByEmail();
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    buyer: response.data.buyer
  });
}

export async function currentUsername(_req: Request, res: Response, _next: NextFunction) {
  const response = await buyerService.getCurrentBuyerByUsername();
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    buyer: response.data.buyer
  });
}

export async function username(req: Request, res: Response, _next: NextFunction) {
  const response = await buyerService.getBuyerByUsername(req.params.username);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    buyer: response.data.buyer
  });
}
