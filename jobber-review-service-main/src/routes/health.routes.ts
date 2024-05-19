import { checkHealth } from '@review/controllers/health';
import { Router } from 'express';

const healthRouter = Router();

healthRouter.get('/review-health', checkHealth);

export default healthRouter;
