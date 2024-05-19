import { review } from '@gateway/controllers/review/create';
import { getReviewsByGigId, getSellerGigs } from '@gateway/controllers/review/get';
import authMiddleware from '@gateway/services/auth-middleware';
import { Router } from 'express';

const reviewRouter = Router();

reviewRouter.get('/review/gig/:gigId', authMiddleware.checkAuthentication, getReviewsByGigId);

reviewRouter.get('/review/seller/:sellerId', authMiddleware.checkAuthentication, getSellerGigs);

reviewRouter.post('/review', authMiddleware.checkAuthentication, review);

export default reviewRouter;
