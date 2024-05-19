import { review } from '@review/controllers/create';
import { reviewsByGigId, sellerReviews } from '@review/controllers/get';
import { Router } from 'express';

const reviewRouter = Router();

reviewRouter.get('/gig/:gigId', reviewsByGigId);

reviewRouter.get('/seller/:sellerId', sellerReviews);

reviewRouter.post('/', review);

export default reviewRouter;
