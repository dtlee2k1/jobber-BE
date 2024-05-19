import { IReviewDocument } from '@dtlee2k1/jobber-shared';
import { addReview } from '@review/services/review.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function review(req: Request, res: Response, _next: NextFunction) {
  const review: IReviewDocument = await addReview(req.body);

  res.status(StatusCodes.CREATED).json({
    message: 'Review created successfully',
    review
  });
}
