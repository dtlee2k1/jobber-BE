import { getCurrentUser, getLoggedInUsers, removeLoggedInUser, resendEmail } from '@gateway/controllers/auth/current-user';
import { refreshToken } from '@gateway/controllers/auth/refresh-token';
import authMiddleware from '@gateway/services/auth-middleware';
import { Router } from 'express';

const currentUserRouter = Router();

currentUserRouter.get('/auth/current-user', authMiddleware.checkAuthentication, getCurrentUser);

currentUserRouter.get('/auth/logged-in-user', authMiddleware.checkAuthentication, getLoggedInUsers);

currentUserRouter.get('/auth/refresh-token/:username', authMiddleware.checkAuthentication, refreshToken);

currentUserRouter.post('/auth/resend-email', authMiddleware.checkAuthentication, resendEmail);

currentUserRouter.delete('/auth/logged-in-user/:username', authMiddleware.checkAuthentication, removeLoggedInUser);

export default currentUserRouter;
