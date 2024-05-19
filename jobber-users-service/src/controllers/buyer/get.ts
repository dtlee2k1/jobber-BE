import { IBuyerDocument } from '@dtlee2k1/jobber-shared';
import { getBuyerByEmail, getBuyerByUsername } from '@users/services/buyer.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function email(req: Request, res: Response, _next: NextFunction) {
  const buyer: IBuyerDocument | null = await getBuyerByEmail(req.currentUser!.email);
  res.status(StatusCodes.OK).json({
    message: 'Buyer profile',
    buyer
  });
}

export async function currentUsername(req: Request, res: Response, _next: NextFunction) {
  const buyer: IBuyerDocument | null = await getBuyerByUsername(req.currentUser!.username);
  res.status(StatusCodes.OK).json({
    message: 'Buyer profile',
    buyer
  });
}

export async function username(req: Request, res: Response, _next: NextFunction) {
  const buyer: IBuyerDocument | null = await getBuyerByUsername(req.params.username);
  res.status(StatusCodes.OK).json({
    message: 'Buyer profile',
    buyer
  });
}
