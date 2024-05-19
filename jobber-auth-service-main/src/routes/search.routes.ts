import { searchGigs, singleGigById } from '@auth/controllers/search';
import { Router } from 'express';

const searchRouter = Router();

searchRouter.get('/search/gig/:from/:size/:type', searchGigs);

searchRouter.get('/search/gig/:gigId', singleGigById);

export default searchRouter;
