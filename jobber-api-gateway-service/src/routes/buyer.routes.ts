import { currentUsername, email, username } from '@gateway/controllers/users/buyer/get';
import authMiddleware from '@gateway/services/auth-middleware';
import { Router } from 'express';

const buyerRouter = Router();

buyerRouter.get('/buyer/email', authMiddleware.checkAuthentication, email);

buyerRouter.get('/buyer/username', authMiddleware.checkAuthentication, currentUsername);

buyerRouter.get('/buyer/:username', authMiddleware.checkAuthentication, username);

export default buyerRouter;
