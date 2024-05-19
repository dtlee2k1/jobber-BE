import { refreshToken } from '@auth/controllers/refresh-token';
import { Router } from 'express';
import { getCurrentUser, resendEmail } from '@auth/controllers/current-user';

const currentUserRouter = Router();

currentUserRouter.get('/current-user', getCurrentUser);

currentUserRouter.get('/refresh-token/:username', refreshToken);

currentUserRouter.post('/resend-email', resendEmail);

export default currentUserRouter;
