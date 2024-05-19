import { seller as createSeller } from '@gateway/controllers/users/seller/create';
import { seller as updateSeller } from '@gateway/controllers/users/seller/update';
import { id, random, username } from '@gateway/controllers/users/seller/get';
import { Router } from 'express';
import { createSeedSellers } from '@gateway/controllers/users/seller/seed';
import authMiddleware from '@gateway/services/auth-middleware';

const sellerRouter = Router();

sellerRouter.get('/seller/id/:sellerId', authMiddleware.checkAuthentication, id);

sellerRouter.get('/seller/username/:username', authMiddleware.checkAuthentication, username);

sellerRouter.get('/seller/random/:size', authMiddleware.checkAuthentication, random);

sellerRouter.post('/seller/create', authMiddleware.checkAuthentication, createSeller);

sellerRouter.put('/seller/:sellerId', authMiddleware.checkAuthentication, updateSeller);

sellerRouter.put('/seller/seed/:count', authMiddleware.checkAuthentication, createSeedSellers);

export default sellerRouter;
