import { changePassword, forgotPassword, resetPassword } from '@auth/controllers/password';
import { SignIn } from '@auth/controllers/signin';
import { signUp } from '@auth/controllers/signup';
import { updateVerifyToken } from '@auth/controllers/verify-email';
import { Router } from 'express';

const authRouter = Router();

authRouter.post('/signup', signUp);

authRouter.post('/signin', SignIn);

authRouter.put('/verify-email', updateVerifyToken);

authRouter.put('/forgot-password', forgotPassword);

authRouter.put('/reset-password/:token', resetPassword);

authRouter.put('/change-password', changePassword);

export default authRouter;
