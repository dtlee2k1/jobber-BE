import { gigService } from '@gateway/services/api/gig.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function searchGigs(req: Request, res: Response, _next: NextFunction) {
  const { from, size, type } = req.params;
  const queryString = new URLSearchParams(req.query as any).toString();
  const response = await gigService.searchGigs(queryString, from, size, type);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gigs: response.data.gigs,
    total: response.data.total
  });
}
