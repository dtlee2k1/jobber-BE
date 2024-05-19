import { IReviewDocument } from '@dtlee2k1/jobber-shared';
import { getReviewsById, getReviewsBySellerId } from '@review/services/review.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function reviewsByGigId(req: Request, res: Response, _next: NextFunction) {
  const reviews: IReviewDocument[] = await getReviewsById(req.params.gigId);
  res.status(StatusCodes.OK).json({
    message: 'Get reviews successfully',
    reviews
  });
}

export async function sellerReviews(req: Request, res: Response, _next: NextFunction) {
  const reviews: IReviewDocument[] = await getReviewsBySellerId(req.params.sellerId);
  res.status(StatusCodes.OK).json({
    message: 'Get seller reviews successfully',
    reviews
  });
}
