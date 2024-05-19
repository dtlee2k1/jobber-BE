import { createGig } from '@gateway/controllers/gig/create';
import { deleteGig } from '@gateway/controllers/gig/delete';
import {
  gigById,
  gigsByCategory,
  moreGigsLikeThis,
  sellerGigs,
  sellerInactiveGigs,
  topRatedGigsByCategory
} from '@gateway/controllers/gig/get';
import { searchGigs } from '@gateway/controllers/gig/search';
import { seedGig } from '@gateway/controllers/gig/seed';
import { gigUpdateActive, updateGig } from '@gateway/controllers/gig/update';
import authMiddleware from '@gateway/services/auth-middleware';
import { Router } from 'express';

const gigRouter = Router();

gigRouter.get('/gig/:gigId', authMiddleware.checkAuthentication, gigById);

gigRouter.get('/gig/seller/:sellerId', authMiddleware.checkAuthentication, sellerGigs);

gigRouter.get('/gig/seller/pause/:sellerId', authMiddleware.checkAuthentication, sellerInactiveGigs);

gigRouter.get('/gig/search/:from/:size/:type', authMiddleware.checkAuthentication, searchGigs);

gigRouter.get('/gig/top/:username', authMiddleware.checkAuthentication, topRatedGigsByCategory);

gigRouter.get('/gig/category/:username', authMiddleware.checkAuthentication, gigsByCategory);

gigRouter.get('/gig/similar/:gigId', authMiddleware.checkAuthentication, moreGigsLikeThis);

gigRouter.post('/gig/create', authMiddleware.checkAuthentication, createGig);

gigRouter.put('/gig/:gigId', authMiddleware.checkAuthentication, updateGig);

gigRouter.put('/gig/active/:gigId', authMiddleware.checkAuthentication, gigUpdateActive);

gigRouter.put('/gig/seed/:count', authMiddleware.checkAuthentication, seedGig);

gigRouter.delete('/gig/:gigId/:sellerId', authMiddleware.checkAuthentication, deleteGig);

export default gigRouter;
