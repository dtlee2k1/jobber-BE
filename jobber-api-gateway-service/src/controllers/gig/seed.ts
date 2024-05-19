import { gigService } from '@gateway/services/api/gig.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function seedGig(req: Request, res: Response, _next: NextFunction) {
  const response = await gigService.seed(req.params.count);
  res.status(StatusCodes.CREATED).json({
    message: response.data.message
  });
}
