import { checkHealth } from '@auth/controllers/health';
import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/auth-health', checkHealth);

export default healthRouter;
