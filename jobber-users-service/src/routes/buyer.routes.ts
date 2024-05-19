import { currentUsername, email, username } from '@users/controllers/buyer/get';
import { Router } from 'express';

const buyerRouter = Router();

buyerRouter.get('/email', email);

buyerRouter.get('/username', currentUsername);

buyerRouter.get('/:username', username);

export default buyerRouter;
