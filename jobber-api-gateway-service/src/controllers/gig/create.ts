import { gigService } from '@gateway/services/api/gig.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function createGig(req: Request, res: Response, _next: NextFunction) {
  const response = await gigService.createGig(req.body);
  res.status(StatusCodes.CREATED).json({
    message: response.data.message,
    gig: response.data.gig
  });
}
