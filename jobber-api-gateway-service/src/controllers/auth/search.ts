import { authService } from '@gateway/services/api/auth.service';
import { NextFunction, Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function singleGigById(req: Request, res: Response, _next: NextFunction) {
  const response = await authService.getGig(req.params.gigId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gig: response.data.gig
  });
}

export async function searchGigs(req: Request, res: Response, _next: NextFunction) {
  const { from, size, type } = req.params;
  const queryString = new URLSearchParams(req.query as any).toString();
  const response = await authService.getGigs(queryString, from, size, type);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gigs: response.data.gigs,
    total: response.data.total
  });
}
