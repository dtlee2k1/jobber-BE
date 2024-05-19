import { gigService } from '@gateway/services/api/gig.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function deleteGig(req: Request, res: Response, _next: NextFunction) {
  const response = await gigService.deleteGig(req.params.gigId, req.params.sellerId);
  res.status(StatusCodes.OK).json({
    message: response.data.message
  });
}
