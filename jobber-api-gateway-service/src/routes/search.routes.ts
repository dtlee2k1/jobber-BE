import { searchGigs, singleGigById } from '@gateway/controllers/auth/search';
import { Router } from 'express';

const searchRouter = Router();

searchRouter.get('/auth/search/gig/:gigId', singleGigById);

searchRouter.get('/auth/search/gig/:from/:size/:type', searchGigs);

export default searchRouter;
