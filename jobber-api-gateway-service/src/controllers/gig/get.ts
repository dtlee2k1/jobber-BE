import { gigService } from '@gateway/services/api/gig.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function gigById(req: Request, res: Response, _next: NextFunction) {
  const response = await gigService.getGigById(req.params.gigId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gig: response.data.gig
  });
}

export async function sellerGigs(req: Request, res: Response) {
  const response = await gigService.getSellerGigs(req.params.sellerId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gigs: response.data.gigs
  });
}

export async function sellerInactiveGigs(req: Request, res: Response) {
  const response = await gigService.getSellerPausedGigs(req.params.sellerId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gigs: response.data.gigs
  });
}

export async function gigsByCategory(req: Request, res: Response) {
  const response = await gigService.getGigsByCategory(req.params.username);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gigs: response.data.gigs
  });
}

export async function moreGigsLikeThis(req: Request, res: Response) {
  const response = await gigService.getMoreGigsLikeThis(req.params.gigId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gigs: response.data.gigs
  });
}

export async function topRatedGigsByCategory(req: Request, res: Response) {
  const response = await gigService.getTopRatedGigsByCategory(req.params.username);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    gigs: response.data.gigs
  });
}
