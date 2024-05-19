import { seller as createSeller } from '@users/controllers/seller/create';
import { id, random, username } from '@users/controllers/seller/get';
import { createSeedSellers } from '@users/controllers/seller/seed';
import { seller as updateSeller } from '@users/controllers/seller/update';
import { Router } from 'express';

const sellerRouter = Router();

sellerRouter.get('/id/:sellerId', id);

sellerRouter.get('/username/:username', username);

sellerRouter.get('/random/:size', random);

sellerRouter.post('/create', createSeller);

sellerRouter.put('/:sellerId', updateSeller);

sellerRouter.put('/seed/:count', createSeedSellers);

export default sellerRouter;
