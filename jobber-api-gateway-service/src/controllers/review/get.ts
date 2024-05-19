import { reviewService } from '@gateway/services/api/review.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function getReviewsByGigId(req: Request, res: Response, _next: NextFunction) {
  const response = await reviewService.getReviewsByGigId(req.params.gigId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    reviews: response.data.reviews
  });
}

export async function getSellerGigs(req: Request, res: Response, _next: NextFunction) {
  const response = await reviewService.getReviewsBySellerId(req.params.sellerId);
  res.status(StatusCodes.OK).json({
    message: response.data.message,
    reviews: response.data.reviews
  });
}
