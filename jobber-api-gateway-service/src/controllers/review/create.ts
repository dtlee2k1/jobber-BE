import { reviewService } from '@gateway/services/api/review.service';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export async function review(req: Request, res: Response, _next: NextFunction) {
  const response = await reviewService.addReview(req.body);
  res.status(StatusCodes.CREATED).json({
    message: response.data.message,
    review: response.data.review
  });
}
