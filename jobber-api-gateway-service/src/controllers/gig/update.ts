import { gigService } from '@gateway/services/api/gig.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function updateGig(req: Request, res: Response, _next: NextFunction) {
  const response = await gigService.updateGig(req.params.gigId, req.body);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gig: response.data.gig
  });
}

export async function gigUpdateActive(req: Request, res: Response, _next: NextFunction) {
  const response = await gigService.updateActiveGigProp(req.params.gigId, req.body.active);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gig: response.data.gig
  });
}
